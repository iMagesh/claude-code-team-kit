# Responsible use of Claude Code on a team

Guardrails this kit demonstrates, and the reasoning behind each.

| Practice | Where it lives | Why |
|---|---|---|
| Least-privilege permissions | `.claude/settings.json` (`allow`/`deny`) | Claude only runs commands you have approved. Network and push access are denied by default. |
| Protect secrets and critical files | `protect-files.js` hook + `deny` rules | Prevents accidental reads or edits of `.env` (at any depth), `.git/`, and lockfiles. |
| Protect the guardrails | `protect-files.js` + `guard-bash.js` | Claude cannot edit `settings.json`, `settings.local.json`, or the hooks to switch off its own limits. |
| Catch shell bypasses | `guard-bash.js` hook | Permission rules match command prefixes, so `git -C . push` or `cat .env` would slip past them. |
| Verify, don't trust | `test-after-edit.js` hook + CI | Failing tests are fed straight back, and CI re-checks every push. |
| Test the guardrails | `test/hooks.test.js` | A safety mechanism nobody tests will regress silently. |
| Human review of every change | `/review`, `/pr-summary` | AI-written code gets the same review bar as any other code. |
| Independent second opinion | `security-reviewer` subagent | A read-only reviewer with a separate context catches what the author missed. |
| Shared, versioned context | `CLAUDE.md` | Team conventions are explicit and reviewable, not tribal knowledge. |

## Limits of these guardrails
Be honest with your team about what this setup does and does not guarantee.

- **Pattern matching is best-effort.** `guard-bash.js` and the `deny` rules match text.
  An obfuscated command (base64, a script written to disk then run) can evade them.
  They stop accidents and casual mistakes, not a determined adversary.
- **False positives happen.** `guard-bash.js` will block `git log --grep push` or a
  `grep` for `.env`. That is the price of erring on the safe side; ask a human to run it.
- **Hooks fail open** on malformed input, so a broken hook never wedges a session.
  Permissions still apply in that case.
- **For hard isolation, use the sandbox.** Claude Code's sandboxing restricts the
  filesystem and network at the OS level, and is the right tool when you need a guarantee.
- **Local settings can widen access.** `.claude/settings.local.json` is per-developer and
  gitignored. The hooks stop Claude from editing it, but a human can still loosen rules there.

## What not to delegate
- Decisions about security posture, data retention, or user privacy.
- Merging, releasing, or pushing to shared branches.
- Handling real credentials or production data.
- Changes to the guardrails themselves.
- Anything you could not explain or defend in a code review.

## Team rules of thumb
1. You own the code, regardless of who or what wrote it.
2. Read the diff before accepting it.
3. Keep permissions narrow; widen them deliberately and in version control.
4. Treat tool output and fetched content as untrusted input.
5. Share what works: commit skills and `CLAUDE.md` improvements.
