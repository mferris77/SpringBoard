# SpringBoard Constitution

This directory contains the authoritative project constitution for SpringBoard.

## What is this?

The **constitution** defines core non-negotiable principles, governance rules, and development practices that all team members and contributors MUST follow. It is the single source of truth for:

- Core principles (Microsoft-First, CLI-First, Test-First, etc.)
- Security & compliance requirements
- Development workflow and CI gates
- Governance and amendment procedures

## Files

- **constitution.md** — The full constitution text and governance rules.
- **OWNERS.md** — Engineering and security owners responsible for maintaining and amending the constitution.
- **tasks.md** — Implementation tasks for rolling out the constitution across the repo (specs/, templates/, CI).
- **quickstart.md** — Howto guide for proposing amendments and ratifying changes.

## Reference

The constitution is the **authoritative guide** for all speckit templates and workflow. See `.specify/templates/` for templates that enforce and reference the constitution.

### Key Principles

- **I. Microsoft-First & Data Residency** (NON-NEGOTIABLE): All production systems MUST preserve data residency; prefer Azure services.
- **II. CLI-First Interfaces**: Core tooling MUST expose CLI with JSON/text I/O.
- **III. Test-First** (NON-NEGOTIABLE): TDD with unit, model/evaluator, and contract tests.
- **IV. Integration & Contract Testing**: External integrations require validated contracts and CI validation.
- **V. Observability, Versioning & Simplicity**: Structured logs, semantic versioning, minimal complexity.

### Security & Compliance

All systems MUST follow corporate security policies. Use Entra ID (MSAL), Key Vault, private endpoints, NSG restrictions. Any data outside the corporate tenant requires documented approval and data flow diagrams.

### Development Workflow

- PRs MUST include linked specs + tests.
- CI gates: linting, formatting, unit, contract, integration smoke tests, security scan.
- Model/LLM changes require `model_evaluator` verification before merge.
- All releases MUST be tagged semantically with changelog entries.

### Governance

Amendments require documented PR, review, and explicit approval from engineering and security owners. Major changes (PRINCIPLES redefinition) = MAJOR semver bump; minor clarifications = MINOR or PATCH.

## Getting Started

1. Read [constitution.md](constitution.md) for full details.
2. Check [OWNERS.md](OWNERS.md) for who to contact.
3. See [quickstart.md](quickstart.md) for proposing amendments.
4. See [tasks.md](tasks.md) for rollout roadmap.

## Status

**Version**: 1.0.0 | **Ratified**: 2026-03-03 | **Last Amended**: 2026-03-03

---

For questions, contact the engineering and security owners listed in [OWNERS.md](OWNERS.md).
