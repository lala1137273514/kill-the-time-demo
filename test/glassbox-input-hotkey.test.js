"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

const main = fs.readFileSync(path.join(__dirname, "..", "src", "main.js"), "utf8");

test("glassbox input registers a macOS rescue hotkey", () => {
  assert.match(main, /inputHotkeys\s*=\s*\[_glassboxCfg\(\)\.hotkey\]/);
  assert.match(main, /process\.platform\s*===\s*"darwin"[\s\S]*inputHotkeys\.push\("Control\+Space"\)/);
  assert.match(main, /globalShortcut\.register\(accel,\s*\(\)\s*=>\s*toggleGlassboxInput\(\)\)/);
});

test("menu context can open the glassbox input", () => {
  assert.match(main, /openGlassboxInput:\s*\(\)\s*=>\s*toggleGlassboxInput\(\)/);
});
