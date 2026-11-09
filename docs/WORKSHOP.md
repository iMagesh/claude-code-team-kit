# 60-minute workshop: onboarding a team to Claude Code

**Audience:** developers new to Claude Code. **Prereq:** Claude Code installed, this repo cloned.

| Time | Segment | Outcome |
|---|---|---|
| 0-10 | Orientation: tour `CLAUDE.md` and `.claude/` | Understand how context and config are shared |
| 10-25 | Exercise 1: explore and plan | Use `/onboard`, then `/test-plan src/cart.js` |
| 25-40 | Exercise 2: build with guardrails | Add a feature; watch the hooks work |
| 40-50 | Exercise 3: review | `/review`, then the security-reviewer subagent |
| 50-60 | Debrief | What to adopt, what to adapt, what not to delegate |

## Exercise 1: explore and plan
1. Run `/onboard`. Is the summary accurate? What is missing from `CLAUDE.md`?
2. Run `/test-plan src/cart.js`. Which edge cases did it miss?

## Exercise 2: build with guardrails
Prompt: *"Add a `FREESHIP` code that sets shipping to zero. Follow CLAUDE.md."*
Observe:
- Tests run automatically after each edit (PostToolUse hook).
- Ask Claude to edit `.env`. The PreToolUse hook blocks it.
- Ask it to `git push`. Permissions deny it.

## Exercise 3: review
1. Run `/review` on the change. Do you agree with each finding?
2. Ask: *"Use the security-reviewer subagent on my changes."*
3. Write down one finding you would reject and why.

## Facilitator notes
- Emphasize that hooks and permissions enforce policy; prompts only suggest it.
- Have participants improve `CLAUDE.md` after the session and open a PR.
