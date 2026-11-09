#!/usr/bin/env node
'use strict';
// PreToolUse hook for Bash: catch shell-level bypasses of the permission rules.
// Permission rules match command prefixes, so `git -C . push` or `cat .env`
// slip past them. This scans the whole command string instead.
// It is still best-effort (a determined script can obfuscate a command);
// use Claude Code's sandbox for hard network/filesystem isolation.
// Exit code 2 blocks the tool call and feeds stderr back to Claude.

// Claude Code settings files, the hooks directory, or the whole .claude directory.
const CLAUDE_CONFIG = /\.claude(\/(settings[\w.-]*\.json|hooks\b)|\/?(?=$|[\s'";|&)]))/;
// A write: redirect into a file (but not fd duplication like 2>&1), or a mutating tool.
const WRITE_OP = />(?!&)|\btee\b|\bsed\s+-i|\b(mv|cp|rm|ln|chmod|truncate|perl)\b/;

function writesClaudeConfig(cmd) {
  // Judge each pipeline/list segment on its own, so an unrelated `2>&1` or `rm`
  // elsewhere in the command does not count as a write to the config.
  return cmd.split(/&&|\|\||[;|\n]/).some((seg) => CLAUDE_CONFIG.test(seg) && WRITE_OP.test(seg));
}

const RULES = [
  { test: (c) => /(^|[\s'"=:/<>])\.env(\.[\w.-]+)?(?=$|[\s'";|&)<>/])/.test(c), why: 'touches a .env file' },
  { test: (c) => /\bgit\b[^;&|\n]*\spush\b/.test(c), why: 'pushes to a remote' },
  { test: (c) => /\b(curl|wget|nc|ncat|scp|sftp|rsync|ssh)\b/.test(c), why: 'uses a network tool' },
  { test: (c) => /\bfetch\s*\(|\bhttps?\.(get|request)\s*\(/.test(c), why: 'makes a network call from a script' },
  { test: writesClaudeConfig, why: 'may modify Claude Code settings or hooks' },
];

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let command = '';
  try {
    const input = JSON.parse(raw);
    command = (input.tool_input && input.tool_input.command) || '';
  } catch {
    process.exit(0); // fail open on malformed input; permissions still apply
  }

  const hit = RULES.find((r) => r.test(command));
  if (hit) {
    process.stderr.write(
      `Blocked: this command ${hit.why}, which this project does not allow. ` +
        'Ask the user to run it manually if it is really needed.\n'
    );
    process.exit(2);
  }
  process.exit(0);
});
