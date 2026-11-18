#!/usr/bin/env node
'use strict';
// PreToolUse hook for Bash: catch shell-level bypasses of the permission rules.
// Permission rules match command prefixes, so `git -C . push` or `cat .env`
// slip past them. This scans the whole command string instead.
// It is still best-effort (a determined script can obfuscate a command);
// use Claude Code's sandbox for hard network/filesystem isolation.
// Exit code 2 blocks the tool call and feeds stderr back to Claude.
// Patterns ignore case because macOS and Windows filesystems usually do.

// Claude Code settings files, the hooks directory, or the whole .claude directory.
// Tolerates `//` and `/./` path segments, which resolve to the same file.
const CLAUDE_CONFIG = /\.claude(\/+(\.\/+)*(settings[\w.-]*\.json|hooks\b)|\/*(?=$|[\s'";|&)]))/i;
// A command that changes into a .claude directory, after which bare file names are config.
const ENTERS_CLAUDE_DIR = /\b(cd|pushd)\s+[^;&|\n]*\.claude\b/i;
// A write: redirect into a file (but not fd duplication like 2>&1), a mutating tool,
// git's --output, or a file-writing call from an inline Node or Python script.
const WRITE_OP = new RegExp(
  [
    />(?!&)/,
    /\btee\b/,
    /\bsed\b[^;&|\n]*\s(-[a-zA-Z]*i|--in-place)/,
    /\b(mv|cp|rm|ln|chmod|truncate|perl|dd|install)\b/,
    /--output\b/,
    /\b(writeFile|appendFile|unlink|rm|rename|copyFile|truncate)(Sync)?\s*\(/,
    /\bopen\s*\([^)]*['"][wa]\+?['"]/,
    /\b(os\.(remove|unlink|rename|replace)|shutil\.\w+)\s*\(/,
  ]
    .map((r) => r.source)
    .join('|')
);
const SEGMENTS = /&&|\|\||[;|\n]/;

function writesClaudeConfig(cmd) {
  const segments = cmd.split(SEGMENTS);
  // After a `cd .claude`, any write in the command may land in the config.
  if (ENTERS_CLAUDE_DIR.test(cmd) && segments.some((seg) => WRITE_OP.test(seg))) return true;
  // Otherwise judge each pipeline/list segment on its own, so an unrelated `2>&1`
  // or `rm` elsewhere in the command does not count as a write to the config.
  return segments.some((seg) => CLAUDE_CONFIG.test(seg) && WRITE_OP.test(seg));
}

const NETWORK_MODULE = /['"](node:)?(https?|http2|net|tls|dgram)['"]/;
const RULES = [
  {
    // Also catches globs such as `.env*` and `.env?`, which the shell expands to secrets files.
    test: (c) => /(^|[\s'"=:/<>])\.env(\.[\w.*?[\]-]+)?(?=$|[\s'";|&)<>/*?[])/i.test(c),
    why: 'touches a .env file',
  },
  { test: (c) => /\bgit\b[^;&|\n]*\spush\b/i.test(c), why: 'pushes to a remote' },
  { test: (c) => /\bgit\b[^;&|\n]*\s--output\b/i.test(c), why: "writes git output to a file with --output" },
  { test: (c) => /\b(curl|wget|nc|ncat|scp|sftp|rsync|ssh)\b/i.test(c), why: 'uses a network tool' },
  {
    test: (c) =>
      /\bfetch\s*\(|\bhttps?\.(get|request)\s*\(|\bnet\.(connect|createConnection)\s*\(/.test(c) ||
      new RegExp(/\b(require\s*\(\s*|from\s+|import\s*\(\s*)/.source + NETWORK_MODULE.source).test(c) ||
      /\b(urllib\.request|http\.client|socket\.socket|requests\.(get|post|put|patch|delete))\b/.test(c) ||
      /\bimport\s+(urllib|http\.client|socket|requests)\b/.test(c),
    why: 'makes a network call from a script',
  },
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
