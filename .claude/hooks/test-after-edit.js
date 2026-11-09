#!/usr/bin/env node
'use strict';
// PostToolUse hook: run the tests after edits to source or test files.
// On failure, exit 2 so the output is fed back to Claude to fix.

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const TIMEOUT_MS = 90_000; // keep below the hook timeout in settings.json

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

  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const rel = path.relative(projectDir, path.resolve(projectDir, filePath)).split(path.sep).join('/');
  if (!/^(src|test)\/.*\.[cm]?js$/.test(rel)) process.exit(0);

  const result = spawnSync('npm test --silent', {
    cwd: projectDir,
    encoding: 'utf8',
    shell: true,
    timeout: TIMEOUT_MS,
  });

  if (result.error && result.error.code === 'ETIMEDOUT') {
    process.stderr.write(`Tests timed out after ${TIMEOUT_MS / 1000}s while checking ${rel}.\n`);
    process.exit(2);
  }
  if (result.status !== 0) {
    process.stderr.write(`Tests failed after editing ${rel}:\n${result.stdout}\n${result.stderr}\n`);
    process.exit(2);
  }
  process.exit(0);
});
