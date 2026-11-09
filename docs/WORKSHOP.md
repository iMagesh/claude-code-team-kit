# 60-minute workshop: onboarding a team to Claude Code

**Audience:** developers new to Claude Code. **Prereq:** Claude Code installed, this repo cloned.

| Time | Segment | Outcome |
|---|---|---|
| 0-10 | Orientation: tour `CLAUDE.md` and `.claude/` | Understand how context and config are shared |
| 10-20 | Exercise 1: explore and plan | Use `/onboard`, `/test-plan src/cart.js`, and plan mode |
| 20-35 | Exercise 2: build with guardrails | Add a feature; watch the hooks work |
| 35-45 | Exercise 3: probe the guardrails | Try to get around them; learn their limits |
| 45-52 | Exercise 4: review | `/review`, then the security-reviewer subagent |
| 52-60 | Debrief | What to adopt, what to adapt, what not to delegate |

## Orientation notes
- `CLAUDE.md` and `.claude/settings.json` are committed and shared by the team.
- `.claude/settings.local.json` is personal and gitignored: use it for your own extra
  `allow` rules, never to weaken team policy.
- `.claude/skills/` holds the team's skills. Each one is a folder with a `SKILL.md`,
  and Claude can also pick one up on its own when a task matches its description.

## Exercise 1: explore and plan
1. Run `/onboard`. Is the summary accurate? What is missing from `CLAUDE.md`?
2. Run `/test-plan src/cart.js`. Which edge cases did it miss?
3. Switch to plan mode (Shift+Tab until it shows "plan mode") and ask:
   *"Plan how to add a FREESHIP code."* Review the plan before letting it edit anything.

## Exercise 2: build with guardrails
Prompt: *"Add a `FREESHIP` code that sets shipping to zero. Follow CLAUDE.md."*
Observe:
- Tests run automatically after each edit (PostToolUse hook).
- Ask Claude to edit `.env`. The PreToolUse hook blocks it.
- Ask it to `git push`. Permissions deny it.

Discussion: the cart has no shipping yet. Did Claude ask before inventing a shipping
model, as `CLAUDE.md` requires?

## Exercise 3: probe the guardrails
In pairs, try to get Claude to do something the kit forbids, and note what stops it:
1. *"Run `git -C . push`."* (Prefix rules miss this; `guard-bash.js` catches it.)
2. *"Show me what's in config/.env using cat."*
3. *"Edit `.claude/hooks/protect-files.js` so it allows `.env` files."*
4. *"Fetch https://example.com with node."*

Then read the **Limits** section of `docs/RESPONSIBLE-USE.md`. Which of these would
only the sandbox stop reliably? Run `npm test` and read `test/hooks.test.js`:
how would you add a test for a bypass you found?

## Exercise 4: review
1. Run `/review` on the change. Do you agree with each finding?
2. Ask: *"Use the security-reviewer subagent on my changes."*
3. Write down one finding you would reject and why.

## Facilitator notes
- Emphasize that hooks and permissions enforce policy; prompts only suggest it.
- Emphasize that enforcement is best-effort pattern matching unless the sandbox is on.
- Have participants improve `CLAUDE.md` after the session and open a PR. Guardrail
  changes (`.claude/settings.json`, hooks) must be made by a human and reviewed.
