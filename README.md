# Claude Code Team Kit

A small, forkable reference for onboarding an engineering team to
[Claude Code](https://docs.claude.com/en/docs/claude-code/overview) with sensible,
responsible defaults. The code is a tiny Node.js cart library; the point is the setup
around it.

## What's inside

| Path | What it shows |
|---|---|
| `CLAUDE.md` | Shared project context: commands, conventions, working agreements |
| `.claude/settings.json` | Permission allow/deny rules and hook wiring |
| `.claude/hooks/protect-files.js` | PreToolUse hook that blocks edits to secrets, `.git/`, the lockfile, and the guardrails themselves |
| `.claude/hooks/guard-bash.js` | PreToolUse hook that catches shell-level bypasses (`cat .env`, `git -C . push`, `wget`) |
| `.claude/hooks/test-after-edit.js` | PostToolUse hook that runs tests and feeds failures back |
| `.claude/skills/` | Skills, invoked as `/review`, `/test-plan`, `/onboard`, `/pr-summary` |
| `.claude/agents/security-reviewer.md` | Read-only subagent for security review |
| `test/hooks.test.js` | Tests for the hooks: the guardrails are verified by code too |
| `.github/workflows/ci.yml` | Runs lint and tests on every push and PR, on Node 18 to 24 |
| `docs/RESPONSIBLE-USE.md` | Guardrails, their limits, and what not to delegate |
| `docs/WORKSHOP.md` | A 60-minute facilitated onboarding session |

## Quick start

```bash
git clone <this repo> && cd claude-code-team-kit
npm test          # confirm the baseline passes (Node 18+)
claude            # start Claude Code in this directory
```

Then try, in order: `/onboard`, `/test-plan src/cart.js`, and
*"Add a FREESHIP discount code that makes shipping free."* Watch the tests run
automatically after each edit.

## Adapting it to your team
1. Copy `.claude/`, `CLAUDE.md`, and `test/hooks.test.js` into your repo.
2. Replace the commands in `CLAUDE.md` with yours.
3. Tighten `deny` rules and the patterns in `guard-bash.js` for your environment, and widen `allow` deliberately.
4. Review the hook scripts. They are short on purpose. Keep their tests passing.
5. Adjust the hook timeouts in `settings.json` if your test suite is slow.

## Design principles
- **Enforce, don't just ask.** Hooks and permissions are deterministic; prompts are not.
- **Verify with code.** Tests are the source of truth, not the model's confidence. That includes the hooks.
- **Know the limits.** Pattern-matching guardrails are best-effort; see `docs/RESPONSIBLE-USE.md`.
- **Humans stay accountable.** Every change is reviewed before it ships.

## Feedback
Issues and PRs welcome, especially improvements to `CLAUDE.md` and the workshop exercises.

## License
MIT. See `LICENSE`.
