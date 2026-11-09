#!/usr/bin/env node
'use strict';
// PreToolUse hook: block edits to sensitive files.
// Exit code 2 blocks the tool call and feeds stderr back to Claude.

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const input = JSON.parse(raw);
    filePath = (input.tool_input && (input.tool_input.file_path || input.tool_input.path)) || '';
  } catch {
    process.exit(0); // never block on malformed input
  }

  const protectedPatterns = [/(^|\/)\.env(\.|$)/, /(^|\/)\.git\//, /package-lock\.json$/];
  if (protectedPatterns.some((p) => p.test(filePath))) {
    process.stderr.write(
      `Blocked: ${filePath} is protected. Ask the user to change it manually.\n`
    );
    process.exit(2);
  }
  process.exit(0);
});
