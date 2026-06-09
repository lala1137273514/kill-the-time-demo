"use strict";

// Local app/agent launcher for deterministic commands like "打开 Claude".
// User text never becomes a shell command; only the fixed target + cwd are used.

function shellQuote(value) {
  return `'${String(value == null ? "" : value).replace(/'/g, "'\\''")}'`;
}

function appleScriptString(value) {
  return JSON.stringify(String(value == null ? "" : value));
}

function terminalScript(shellCommand) {
  return [
    'tell application "Terminal"',
    "activate",
    `do script ${appleScriptString(shellCommand)}`,
    "end tell",
  ];
}

function targetLabel(target) {
  if (target === "claude") return "Claude";
  if (target === "codex") return "Codex";
  return "终端";
}

function buildOpenCommand(target, opts = {}) {
  const cwd = opts.cwd || "";
  const cd = cwd ? `cd ${shellQuote(cwd)} && ` : "";
  if (target === "terminal") return `${cd}clear || true`;
  if (target === "codex") {
    const bin = opts.codexBin || "codex";
    return `${cd}if command -v ${shellQuote(bin)} >/dev/null 2>&1 || [ -x ${shellQuote(bin)} ]; then ${shellQuote(bin)}; else echo '没有找到 Codex CLI，请先安装或把 codex 加入 PATH。'; fi`;
  }
  const bin = opts.claudeBin || "claude";
  return `${cd}if command -v ${shellQuote(bin)} >/dev/null 2>&1 || [ -x ${shellQuote(bin)} ]; then ${shellQuote(bin)}; else echo '没有找到 Claude CLI，请先安装或把 claude 加入 PATH。'; fi`;
}

function defaultSpawn(cmd, args, spawnOpts) {
  return require("node:child_process").spawn(cmd, args, spawnOpts);
}

function openAgent(target, opts = {}) {
  const t = target === "codex" || target === "terminal" ? target : "claude";
  const platform = opts.platform || process.platform;
  const shellCommand = buildOpenCommand(t, opts);
  const spawnFn = opts.spawnFn || defaultSpawn;
  let command;
  let args;
  if (platform === "darwin") {
    command = "osascript";
    args = terminalScript(shellCommand).flatMap((line) => ["-e", line]);
  } else {
    command = "/bin/sh";
    args = ["-lc", shellCommand];
  }
  const child = spawnFn(command, args, { windowsHide: true, stdio: "ignore", detached: false });
  const swallow = () => {};
  if (child && typeof child.on === "function") child.on("error", swallow);
  if (child && typeof child.unref === "function") child.unref();
  return {
    command,
    args,
    target: t,
    label: targetLabel(t),
    cwd: opts.cwd || null,
    child,
    onError(cb) {
      if (child && typeof child.on === "function") child.on("error", cb);
    },
  };
}

module.exports = {
  shellQuote,
  appleScriptString,
  terminalScript,
  targetLabel,
  buildOpenCommand,
  openAgent,
};
