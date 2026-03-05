# GitHub Copilot — Repository Instructions

These instructions apply to all Copilot Chat requests in this repository (VS Code reads `.github/copilot-instructions.md`).

## Primary workflow: one task = one git worktree
- Prefer isolated workspaces for any non-trivial change:
  - Create a new worktree + branch for the task and do all edits/tests/commits there.
  - See: `.agent/skills/git-worktrees-for-agent-dev/SKILL.md` (worktree/agent workflow playbook).
- Keep the base workspace clean (typically on the integration branch).

## Branch + commit conventions
Follow the team conventions:
- Base branch is usually `development`.
- Feature branch name pattern:
  - `{chore/fix/feat}_{ADO task id}/{what we are doing/ADO task name (no spaces)}`
- Commit message pattern:
  - `{chore/fix/feat} : {description} #{ADO task id}`

## Change discipline
- Make the smallest change that solves the request.
- Do not refactor unrelated code.
- If you must touch multiple areas/files, explain why in the PR/commit notes.

## Quality gates
- Before suggesting a PR is ready:
  - Run the project’s standard tests/linters (use the repo’s documented commands).
  - Ensure any new/changed behavior has corresponding tests when applicable.

## Collaboration style
- Start with a short plan (2–6 bullets) before generating code for complex changes.
- Prefer short, scoped iterations over long, sprawling edits.
- When uncertain, ask for missing constraints *only if required*; otherwise make reasonable assumptions and state them.
