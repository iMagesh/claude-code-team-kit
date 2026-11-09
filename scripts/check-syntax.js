#!/usr/bin/env node
'use strict';
// Zero-dependency syntax check: runs `node --check` on every JS file we own.
// This catches syntax errors only; it is not a style linter.

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const DIRS = ['src', 'test', 'scripts', '.claude/hooks'];

function jsFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return jsFiles(p);
    return /\.[cm]?js$/.test(e.name) ? [p] : [];
  });
}

const files = DIRS.flatMap((d) => jsFiles(path.join(ROOT, d)));
const failures = files.filter((f) => {
  const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (r.status !== 0) process.stderr.write(r.stderr);
  return r.status !== 0;
});

console.log(`Syntax-checked ${files.length} files, ${failures.length} failed.`);
process.exit(failures.length ? 1 : 0);
