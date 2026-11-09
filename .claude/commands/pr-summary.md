---
description: Draft a pull request description from the current branch
allowed-tools: Bash(git diff:*), Bash(git log:*)
---

Branch changes:
!`git log --oneline main..HEAD`
!`git diff main...HEAD --stat`

Write a PR description with: **What changed**, **Why**, **How to test**, and
**Risks**. Be factual; do not claim tests passed unless you ran them.
