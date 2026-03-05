# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Electron + Python project scaffold with minimal setup (main.js, Flask backend, UI boilerplate)
- `.gitignore` tuned for Node/Electron and Python environments

## [1.0.0-constitution] — 2026-03-03

### Added
- **SpringBoard Constitution v1.0.0** (`specs/constitution/constitution.md`)
  - Established 5 core principles: Microsoft-First & Data Residency, CLI-First, Test-First (NON-NEGOTIABLE), Integration & Contract Testing, Observability & Versioning
  - Defined security & compliance requirements (Azure AD, Key Vault, private endpoints, data residency)
  - Codified development workflow (PR requirements, CI gates, model/LLM validation, release process)
  - Established governance rules for amendments (require engineering + security owner approval)
- Constitution governance files:
  - `specs/constitution/README.md` — Overview and quick reference
  - `specs/constitution/OWNERS.md` — Engineering and security owners + amendment process
  - `specs/constitution/tasks.md` — Implementation roadmap (18 tasks across publish, propagation, ratification, Polish phases)
  - `specs/constitution/quickstart.md` — Guide for proposing amendments (planned)
- Repository bookkeeping:
  - Initial .specify template review and constitution check gate documentation

### Status
**NOTE**: Constitution v1.0.0 is currently in **draft** status pending ratification by engineering and security owners. See `specs/constitution/OWNERS.md` for contacts and amendment process.

---

## How to Contribute

See [Contributing](CONTRIBUTING.md) and [SpringBoard Constitution](specs/constitution/README.md) for guidelines.
