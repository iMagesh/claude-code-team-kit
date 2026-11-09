#!/usr/bin/env node
'use strict';
// PostToolUse hook: run the tests after edits to source or test files.
// On failure, exit 2 so the output is fed back to Claude to fix.

const { spawnSync } = require('node:child_process');

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let filePath = '';
  try {
    const input = JSON.parse(raw);
    filePath = (input.tool_input && (input.tool_input.file_path || input.tool_input.path)) || '';
  } catch {
    process.exit(0);
  }

  if (!/(^|\/)(src|test)\/.*\.js$/.test(filePath)) process.exit(0);

  const result = spawnSync('npm', ['test', '--silent'], {
    cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    encoding: 'utf8',
    shell: true,
  });

  if (result.status !== 0) {
    process.stderr.write(`Tests failed after editing ${filePath}:\n${result.stdout}\n${result.stderr}\n`);
    process.exit(2);
  }
  process.exit(0);
});
