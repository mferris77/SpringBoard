# Git Worktrees Guide

This document explains how to use Git worktrees in the SpringBoard repository to manage multiple feature branches simultaneously without context switching.

## What are Git Worktrees?

A **worktree** is a separate working directory linked to the same Git repository. Each worktree can have its own branch checked out independently, allowing you to:

- Work on multiple features in parallel without stashing changes
- Keep separate build artifacts and node_modules per branch
- Avoid constant `git checkout` overhead
- Run tests/builds in one worktree while coding in another

## Installation

Git worktrees are built into Git 2.5+. Verify you have them:

```bash
git worktree list
```

## Typical Workflow

### 1. Create a worktree for a new feature

```bash
git worktree add ../springboard-feature-001 -b chore/constitution-v1
```

This creates a new directory `../springboard-feature-001/` with branch `chore/constitution-v1` checked out.

### 2. Switch to the worktree directory and work

```bash
cd ../springboard-feature-001
npm install
pip install -r python/requirements.txt
# ... make changes, commit, etc.
```

### 3. List active worktrees

```bash
git worktree list
```

Output:
```
C:\DEV\AI\SpringBoard (detached)
C:\DEV\AI\springboard-feature-001  chore/constitution-v1
```

### 4. Commit and push from the worktree

```bash
git add .
git commit -m "docs(constitution): add v1.0.0 and tasks"
git push -u origin chore/constitution-v1
```

### 5. Open a PR from the branch

Once pushed, open a pull request via GitHub/GitLab as usual.

### 6. Clean up after merge

Once the PR is merged, remove the worktree:

```bash
git worktree remove ../springboard-feature-001
```

## Advanced: Running Tests/Builds in Parallel

Use worktrees to run builds in parallel without blocking development:

```bash
# Terminal 1: main worktree
cd C:\DEV\AI\SpringBoard
npm run dev

# Terminal 2: feature worktree
cd ../springboard-feature-001
npm run build
npm test
```

Each worktree has its own `node_modules/`, `dist/`, and `build/` directories (see `.gitignore`).

## Best Practices

- **One worktree per feature branch**: Use a naming scheme like `springboard-NNN` (e.g., `springboard-001`, `springboard-002`).
- **Clean up after merging**: Remove the worktree immediately after PR merge to avoid stale directories.
- **Separate dependencies**: Each worktree should have its own `node_modules/` and Python venv (not shared).
- **Use descriptive branch names**: Follow the naming scheme in the constitution (e.g., `NNN-feature-name`).

### Example Naming

```bash
# For feature 001 (constitution):
git worktree add ../springboard-001-constitution -b 001-constitution

# For feature 002 (some other feature):
git worktree add ../springboard-002-auth -b 002-user-auth
```

## Gotchas

### Can't have two worktrees on the same branch

```bash
# ❌ ERROR
git worktree add ../another-dir -b chore/constitution-v1  # Already checked out!

# ✅ OK
git worktree add ../another-dir -b chore/constitution-v1-docs
```

### Worktree directory must not exist

```bash
# ❌ ERROR: directory exists
mkdir ../springboard-001
git worktree add ../springboard-001 -b feature

# ✅ OK: git creates the directory
git worktree add ../springboard-001 -b feature
```

### Don't move the worktree directory

```bash
# ❌ Bad: move the directory → git loses track
mv ../springboard-001 ~/Desktop/springboard-001

# ✅ Good: remove and recreate if needed
git worktree remove ../springboard-001
git worktree add ~/Desktop/springboard-001 -b feature
```

## Troubleshooting

### "Worktree is locked"

If a worktree is locked (previous process exited uncleanly):

```bash
git worktree unlock ../springboard-001
git worktree remove ../springboard-001
```

### Listing broken worktrees

```bash
git worktree list --prune  # Shows deleted directories still registered
```

### Prune stale worktrees

```bash
git worktree prune
```

## References

- [Git Official: git-worktree](https://git-scm.com/docs/git-worktree)
- [GitHub Docs: Managing worktrees](https://cli.github.com/manual/gh_repo_clone)

---

**See also**: [Repository Management](repo-management.md), [Developer Onboarding](NOTES.md), [SpringBoard Constitution](../specs/constitution/README.md)
