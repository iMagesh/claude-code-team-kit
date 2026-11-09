---
name: pr-summary
description: Draft a pull request description from the current branch
argument-hint: [base-branch, default main]
allowed-tools: Bash(git diff:*), Bash(git log:*), Read
---

Base branch: use `$ARGUMENTS` if given, otherwise `main`. Call it BASE below.

1. Run `git log --oneline BASE..HEAD` and `git diff BASE...HEAD --stat`.
2. Read the actual changes with `git diff BASE...HEAD`. If the diff is very large,
   diff the most important files individually (`git diff BASE...HEAD -- <path>`)
   rather than describing files you have not read.

Write a PR description with: **What changed**, **Why**, **How to test**, and
**Risks**. Be factual; do not claim tests passed unless you ran them.
