---
name: git-worktrees-for-agent-dev
description: Explains Git worktrees and provides a repeatable workflow for running parallel (human or AI-agent) tasks in isolated worktrees, including branch/PR handoffs and cleanup.
---

# Git Worktrees for Agent Development (VS Code + Antigravity)

## Purpose
Use this skill when you need to:
- Work on multiple branches **at the same time** without constantly switching checkouts.
- Run one or more coding agents in **isolated sandboxes** (one task = one worktree).
- Keep a stable “main” workspace while parallel work happens elsewhere.

## What is a Git worktree? (High-level)
A *worktree* is an additional working directory attached to the same Git repository. Each worktree can check out a different branch/commit while sharing the same underlying `.git` object database.

**Mental model:** *one repo clone, many folders* — each folder is a clean checkout on its own branch.

## Key properties
- ✅ Multiple working directories share the same Git history/objects.
- ✅ Each worktree has its own working directory state (untracked files, build outputs, etc.).
- ⚠️ A given branch can only be checked out in **one** worktree at a time.

## Recommended “One Task = One Worktree” workflow

### 0) Keep a stable base worktree
- Keep your main repo folder on your integration branch (e.g., `develop`).
- Avoid running experimental agents directly in this folder.

### 1) Create a new worktree for a task (and branch)
From the base repo folder:

```bash
# Sync base
git fetch origin

# Create a new worktree folder and branch from a base ref
# (pick a naming convention that matches your team)
git worktree add -b <branch-name> ../wt/<branch-folder> <base-ref>

# Examples:
# git worktree add -b feat_12345/dqm-agent ../wt/feat_12345-dqm-agent origin/develop
# git worktree add -b fix_887/csv-parse ../wt/fix_887-csv-parse origin/develop
```

### 2) Run the agent inside the worktree
```bash
cd ../wt/<branch-folder>
# run your agent/tooling here
```

**Why:** each agent gets a clean sandbox, reducing cross-task interference.

### 3) Validate changes in that worktree
```bash
git status
git diff
# run tests/linters appropriate to the repo
```

### 4) Commit + push from the worktree
```bash
git add -p
git commit -m "<type>: <description> #<ticket-id>"
git push -u origin <branch-name>
```

### 5) Open a PR and merge
- Create a PR from `<branch-name>` into your integration branch.
- Prefer small PRs per task/worktree.

### 6) Clean up when done
```bash
# From anywhere:
git worktree list

# Remove a finished worktree
 git worktree remove ../wt/<branch-folder>

# Prune stale worktree metadata (after manual deletes, etc.)
git worktree prune
```

## Working with multiple agents (parallel tasks)
Pattern:
- Create `../wt/task-a`, `../wt/task-b`, `../wt/task-c` on separate branches.
- Assign each agent a single worktree directory and a single goal.
- Review/merge independently.

## Troubleshooting
- **“branch is already checked out”**: the branch is attached to another worktree. Use a new branch name or remove the other worktree.
- **Conflicting local servers**: multiple worktrees running services may collide on ports; configure distinct ports per worktree.
- **Dependency duplication**: each worktree may create its own `.venv/`, `node_modules/`, etc. This is expected; optimize later if needed.

## Antigravity placement (where this SKILL.md should live)
Workspace skill:
- `<workspace-root>/.agent/skills/git-worktrees-for-agent-dev/SKILL.md`

Global skill:
- `~/.gemini/antigravity/skills/git-worktrees-for-agent-dev/SKILL.md`

## VS Code usage notes
- Store this file in your repo to make it easy to share.
- If you want always-on guidance for Copilot Chat, put complementary high-level rules in:
  - `.github/copilot-instructions.md`
- Keep this SKILL focused on *the workflow*; put repo-specific constraints in instructions files or rules docs.

## Output expectations when invoked
When a user asks about Git worktrees or parallel agent workflows, respond with:
1) A short explanation of worktrees and why they help.
2) A copy/paste workflow tailored to the user’s base branch and naming conventions.
3) Cleanup steps and common gotchas.
