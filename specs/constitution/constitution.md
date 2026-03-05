#
<!--
Sync Impact Report
- Version change: [UNSET] -> 1.0.0
- Modified principles: [PRINCIPLE_1_NAME] -> I. Microsoft-First & Data Residency
                      [PRINCIPLE_2_NAME] -> II. CLI-First Interfaces
                      [PRINCIPLE_3_NAME] -> III. Test-First (NON-NEGOTIABLE)
                      [PRINCIPLE_4_NAME] -> IV. Integration & Contract Testing
                      [PRINCIPLE_5_NAME] -> V. Observability, Versioning & Simplicity
- Added sections: Security & Compliance, Development Workflow
- Removed sections: none
- Templates reviewed: .specify/templates/plan-template.md (✅ reviewed), .specify/templates/spec-template.md (✅ reviewed), .specify/templates/tasks-template.md (✅ reviewed)
- Follow-up TODOs: RATIFICATION_DATE unresolved (TODO)
-->

# SpringBoard Constitution

## Core Principles

### I. Microsoft-First & Data Residency (NON-NEGOTIABLE)
All production systems and integrations MUST preserve customer and corporate data residency. Prefer Azure-hosted services and Microsoft 365 integrations (Copilot Enterprise, Graph, Power Automate) for production workloads unless a documented exception is approved. Any external service that processes sensitive data MUST be documented, approved by security owners, and use data controls (Key Vault, private endpoints, encrypted at rest and in transit).

### II. CLI-First Interfaces
All core tooling and libraries MUST expose a CLI surface for automation and CI. CLIs MUST support machine-readable JSON input/output and a human-readable mode. CLI behavior MUST be scriptable (stdin/args → stdout, errors → stderr) to allow composability in pipelines and agent orchestration.

### III. Test-First (NON-NEGOTIABLE)
Every feature or change MUST include automated tests before implementation: unit tests, model/evaluator tests (where ML/LLM is involved), and contract tests for external integrations. Tests MUST be run in CI and fail the pipeline on regressions. Use the `model_evaluator` tooling for local model verification and include reproducible test inputs/outputs for model changes.

### IV. Integration & Contract Testing
Integration tests and contract tests are REQUIRED for any component that connects to external systems (M365, Azure SQL, Power Automate, internal APIs). Contracts (input/output schemas) MUST be versioned and validated in CI; breaking contract changes require a documented migration plan and a MAJOR semver bump.

### V. Observability, Versioning & Simplicity
Services and long-running tooling MUST emit structured logs and meaningful metrics. Use semantic versioning (MAJOR.MINOR.PATCH). Aim for minimal surface area and simple designs: prefer explicit, testable behavior over complex cleverness. All production changes MUST include observability (logs/metrics) adequate to diagnose failures remotely.

## Security & Compliance

All systems MUST follow corporate security policies. Authentication and authorization MUST use Entra ID (MSAL) where possible; secrets MUST be stored in Key Vault; network endpoints for production resources SHOULD use private endpoints and restricted NSGs. Any solution that transmits or processes customer data outside the corporate tenant MUST be explicitly approved and documented with a data flow diagram and risk assessment.

## Development Workflow

- Pull requests MUST include a linked spec or plan and tests that validate behavior.
- CI gates: linting/formatting, unit tests, contract tests, integration smoke tests where applicable, and a security scan must pass before merge.
- Model or LLM changes MUST include deterministic evaluator artifacts (prompts, test cases, expected outputs) and be validated via the `model_evaluator` before merging to main.
- Releases MUST follow semantic versioning and include a changelog entry describing user-impacting changes and any required migration steps.

## Governance

Amendments to this constitution require a documented PR describing the change, review and explicit approval from at least one engineering owner and one security owner. Major governance changes (removal or redefinition of PRINCIPLES) constitute a MAJOR version bump. Minor additions or clarifications are MINOR or PATCH bumps as appropriate. All PRs touching core infra or security MUST include an impact assessment.

All PRs/reviews MUST verify compliance with the relevant principles above. Complexity MUST be justified in the PR description and linked to a plan in `/specs/` when non-trivial.

**Version**: 1.0.0 | **Ratified**: 2026-03-03: original adoption date | **Last Amended**: 2026-03-03
