#!/usr/bin/env node
'use strict';
// PreToolUse hook: block edits to sensitive files.
// Exit code 2 blocks the tool call and feeds stderr back to Claude.
// Shell-level writes are covered separately by guard-bash.js.

const PROTECTED = [
  /(^|\/)\.env(\.|$)/, // secrets, at any depth
  /(^|\/)\.git\//, // repository internals
  /(^|\/)package-lock\.json$/, // lockfile: change it via npm, not by hand
  /(^|\/)\.claude\/settings(\.local)?\.json$/, // permissions and hook wiring
  /(^|\/)\.claude\/hooks\//, // the guardrails themselves
];

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const input = JSON.parse(raw);
    const t = input.tool_input || {};
    filePath = t.file_path || t.notebook_path || t.path || '';
  } catch {
    process.exit(0); // fail open on malformed input; permissions still apply
  }

  const normalized = filePath.replace(/\\/g, '/');
  if (PROTECTED.some((p) => p.test(normalized))) {
    process.stderr.write(
      `Blocked: ${filePath} is protected. Ask the user to change it manually.\n`
    );
    process.exit(2);
  }
  process.exit(0);
});
