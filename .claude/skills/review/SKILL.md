---
name: review
description: Review uncommitted changes for bugs, missing tests, and risk
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git ls-files:*), Read, Grep
---

Review my uncommitted changes.

Working tree status:
!`git status --short`

Diff of tracked files:
!`git diff HEAD`

New (untracked) files, which the diff above does not include. Read each one:
!`git ls-files --others --exclude-standard`

Report in this order, keeping each section short:
1. **Bugs or logic errors** (with file and line)
2. **Missing or weak tests**
3. **Security or data-handling concerns**
4. **Style issues against CLAUDE.md**

If something is fine, say so briefly. Do not modify any files.
