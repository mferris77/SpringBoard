---
description: "Tasks for SpringBoard Constitution update"
---

# Tasks: SpringBoard Constitution

**Input**: `.specify/memory/constitution.md` (populated)
**Prerequisites**: repo access, owner and security reviewer identified

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create feature folder and copy finalized constitution to specs: specs/constitution/constitution.md
- [ ] T002 [P] Add changelog entry in docs/CHANGELOG.md describing constitution v1.0.0
- [ ] T003 [P] Identify engineering owner and security owner; add names to specs/constitution/OWNERS.md

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Export the `SpringBoard Constitution` into `.specify/memory/constitution.md` (already updated) — verify content and metadata in `.specify/memory/constitution.md`
- [ ] T005 [P] Update `.specify/templates/plan-template.md` and `.specify/templates/tasks-template.md` with reference link to the constitution (if missing) — files: .specify/templates/plan-template.md, .specify/templates/tasks-template.md
- [ ] T006 Ensure CI linting and markdown checks include specs/constitution/ (update .github/workflows/* if required) — files: .github/workflows/*.yml

---

## Phase 3: User Story 1 - Publish Constitution (Priority: P1) 🎯 MVP

**Goal**: Make the new constitution discoverable in the repo and versioned.

**Independent Test**: File `specs/constitution/constitution.md` exists and contains the v1.0.0 header; changelog has an entry.

- [ ] T007 [US1] Create `specs/constitution/constitution.md` from `.specify/memory/constitution.md`
- [ ] T008 [US1] Add `specs/constitution/README.md` describing purpose and link to `.specify/memory/constitution.md`
- [ ] T009 [US1] Create `specs/constitution/tasks.md` (this file) and commit to branch

---

## Phase 4: User Story 2 - Propagation & CI (Priority: P2)

**Goal**: Ensure templates, CI, and developer workflows reference and enforce the constitution.

**Independent Test**: PR checks reference constitution and CI runs markdown/linting that includes specs/constitution.

- [ ] T010 [US2] Update developer onboarding docs to reference `specs/constitution/constitution.md` — file: docs/NOTES.md
- [ ] T011 [US2] Add CI check that ensures `specs/constitution/constitution.md` is present (or fails on missing ratification date) — file: .github/workflows/validate-specs.yml
- [ ] T012 [P] [US2] Add `specs/constitution/OWNERS.md` to CODEOWNERS or repo governance files if applicable — file: .github/CODEOWNERS

---

## Phase 5: User Story 3 - Ratification & Release (Priority: P3)

**Goal**: Collect approvals, set ratification date, tag release, and merge.

**Independent Test**: PR merged with approvals from engineering owner and security owner; `.specify/memory/constitution.md` updated with ratification date.

- [ ] T013 [US3] Open PR with constitution files and link to this tasks.md — include reviewers: engineering owner, security owner
- [ ] T014 [US3] After approvals, update `.specify/memory/constitution.md` and `specs/constitution/constitution.md` to set `Ratified: YYYY-MM-DD` and commit
- [ ] T015 [US3] Tag repository/release notes: `v1.0.0-constitution` and update `docs/CHANGELOG.md`

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T016 [P] Update `.specify/templates/spec-template.md` to include a Constitution Check section reference
- [ ] T017 [P] Add a short CI job to fail PRs that change infra/security files without referencing constitution review — file: .github/workflows/security-check.yml
- [ ] T018 Documentation: add a short quickstart in `specs/constitution/quickstart.md` explaining how to propose amendments

---

## Dependencies & Execution Order

- Phase 1 must complete before Phase 2.
- Phase 2 (foundational) blocks all user stories.
- US1 (publish) is MVP and should be completed first (P1).
- US2 and US3 can be worked in parallel after foundational work, but ratification (US3) requires approvals.

---

## Summary

- Total tasks: 18
- P1 tasks (US1): 3
- P2 tasks (US2): 3 (plus parallel flags)
- P3 tasks (US3): 3
- Parallel opportunities identified: T002, T003, T005, T011, T012, T016, T017, T018

---

Implementation notes:

- Use branch `chore/constitution-v1` for commits.
- Suggested commit message: "docs(constitution): add SpringBoard constitution v1.0.0 and tasks"
- After PR merge: run `git tag -a v1.0.0-constitution -m "Constitution v1.0.0"` and push tags.
