"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert");
const { EventEmitter } = require("node:events");

const {
  buildOpenCommand,
  openAgent,
  terminalScript,
} = require("../src/glassbox-agent-launcher");

function fakeChild() {
  const child = new EventEmitter();
  child.unref = () => {};
  return child;
}

describe("glassbox-agent-launcher", () => {
  it("builds a fixed Claude terminal command with cwd quoting", () => {
    const cmd = buildOpenCommand("claude", { cwd: "/tmp/my project" });
    assert.match(cmd, /^cd '\/tmp\/my project' && /);
    assert.match(cmd, /command -v 'claude'/);
    assert.doesNotMatch(cmd, /帮我打开/);
  });

  it("uses the resolved Codex binary for Codex", () => {
    const cmd = buildOpenCommand("codex", { cwd: "/work", codexBin: "/Applications/Codex.app/Contents/Resources/codex" });
    assert.match(cmd, /'\/Applications\/Codex\.app\/Contents\/Resources\/codex'/);
  });

  it("builds a Terminal AppleScript", () => {
    assert.deepStrictEqual(terminalScript("echo hi"), [
      'tell application "Terminal"',
      "activate",
      'do script "echo hi"',
      "end tell",
    ]);
  });

  it("spawns osascript on macOS", () => {
    let spawned = null;
    const handle = openAgent("claude", {
      platform: "darwin",
      cwd: "/work",
      spawnFn: (cmd, args, opts) => {
        spawned = { cmd, args, opts };
        return fakeChild();
      },
    });
    assert.strictEqual(spawned.cmd, "osascript");
    assert.ok(spawned.args.includes("-e"));
    assert.match(spawned.args.join("\n"), /Terminal/);
    assert.strictEqual(handle.label, "Claude");
    assert.strictEqual(handle.cwd, "/work");
  });
});
