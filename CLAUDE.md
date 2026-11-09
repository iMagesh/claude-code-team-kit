# Project context for Claude Code

A small Node.js shopping-cart library. It exists to demonstrate a team-ready Claude Code setup.

## Commands
- Test: `npm test`
- Lint: `npm run lint`

## Conventions
- CommonJS modules, strict mode, no runtime dependencies.
- Money is always integer cents. Never use floats for currency.
- Every behavior change needs a test in `test/` using `node:test`.
- Keep functions small and validate inputs at the boundary.

## Working agreements
- Run `npm test` before declaring a task done.
- Prefer small, reviewable diffs. Do not refactor unrelated code.
- Never read or edit `.env*` files. Never push to a remote.
- If a requirement is ambiguous, ask before implementing.
