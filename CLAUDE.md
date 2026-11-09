# Project context for Claude Code

A small Node.js shopping-cart library. It exists to demonstrate a team-ready Claude Code setup.

## Commands
- Test: `npm test`
- Lint: `npm run lint` (syntax check of all JS files via `node --check`; not a style linter)

## Conventions
- CommonJS modules, strict mode, no runtime dependencies.
- Money is always integer cents. Never use floats for currency; express rates in basis points.
- Look up user-supplied keys with `Object.hasOwn`, never `in`.
- Every behavior change needs a test in `test/` using `node:test`.
- Keep functions small and validate inputs at the boundary.

## Working agreements
- Run `npm test` before declaring a task done.
- Prefer small, reviewable diffs. Do not refactor unrelated code.
- Never read or edit `.env*` files. Never push to a remote.
- `.claude/settings*.json` and `.claude/hooks/` are guardrails; hooks block edits to them. Propose changes and let a human apply them.
- If a requirement is ambiguous, ask before implementing.
