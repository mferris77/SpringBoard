# SpringBoard Constitution — Owners & Contacts

This file identifies the engineering and security owners responsible for maintaining, interpreting, and amending the SpringBoard Constitution.

## Engineering Owner

**Role**: Oversees technical principles, development workflow compliance, and template/CI updates.

- **Name**: Mark Ferris
- **Contact**: mark.ferris@kantar.com
- **Responsibilities**:
  - Interpret and enforce Principles I–V (Microsoft-First, CLI-First, Test-First, Integration Testing, Observability)
  - Validate PR compliance with development workflow and CI gates
  - Review/approve non-security amendments to constitution
  - Update `.specify/templates/` and CI workflows to reflect constitution changes
  - Maintain and publish `specs/constitution/` documentation

## Security Owner

**Role**: Oversees security & compliance principles and data residency policies.

- **Name**: Mark Ferris
- **Contact**: mark.ferris@kantar.com
- **Responsibilities**:
  - Interpret and enforce security & compliance section (Entra ID (MSAL), Key Vault, private endpoints, NSG, data residency)
  - Review/approve any amendment involving data handling or external system integrations
  - Conduct security impact assessments for PRs touching core infra or security
  - Validate that ratification and amendment processes are followed

## Amendment Process

To propose changes to the constitution:

1. Create a documented PR with a clear title: `docs(constitution): [CHANGE DESCRIPTION]`
2. Link the PR to this file and to `specs/constitution/tasks.md`
3. Describe the change (what, why, impact)
4. Request reviews from **both** engineering and security owners
5. Upon approval, update `constitution.md` with new version, amendment date, and changelog entry
6. Tag the repository: `git tag -a v[VERSION]-constitution -m "Constitution v[VERSION]"`

## Version History

| Version | Ratified | Last Amended | Status |
|---------|----------|--------------|--------|
| 1.0.0   | TODO     | 2026-03-03   | Draft (pending ratification) |

## Contact & Questions

For questions about the constitution or to propose amendments:

1. Check [constitution.md](constitution.md) for full text
2. Review [quickstart.md](quickstart.md) for common amendments
3. Contact engineering or security owner above
4. Open an issue or PR in the repository referencing this file

---

Last updated: 2026-03-03
