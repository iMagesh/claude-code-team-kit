# Responsible use of Claude Code on a team

Guardrails this kit demonstrates, and the reasoning behind each.

| Practice | Where it lives | Why |
|---|---|---|
| Least-privilege permissions | `.claude/settings.json` (`allow`/`deny`) | Claude only runs commands you have approved. Network and push access are denied by default. |
| Protect secrets and critical files | `protect-files.js` hook + `deny` rules | Prevents accidental reads or edits of `.env`, `.git/`, and lockfiles. |
| Verify, don't trust | `test-after-edit.js` hook | Failing tests are fed straight back, so output is checked by code, not by belief. |
| Human review of every change | `/review`, `/pr-summary` | AI-written code gets the same review bar as any other code. |
| Independent second opinion | `security-reviewer` subagent | A read-only reviewer with a separate context catches what the author missed. |
| Shared, versioned context | `CLAUDE.md` | Team conventions are explicit and reviewable, not tribal knowledge. |

## What not to delegate
- Decisions about security posture, data retention, or user privacy.
- Merging, releasing, or pushing to shared branches.
- Handling real credentials or production data.
- Anything you could not explain or defend in a code review.

## Team rules of thumb
1. You own the code, regardless of who or what wrote it.
2. Read the diff before accepting it.
3. Keep permissions narrow; widen them deliberately and in version control.
4. Treat tool output and fetched content as untrusted input.
5. Share what works: commit commands and `CLAUDE.md` improvements.
