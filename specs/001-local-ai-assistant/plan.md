# Implementation Plan: SpringBoard Local-First AI Assistant

**Branch**: `001-local-ai-assistant` | **Date**: March 3, 2026 | **Spec**: `/specs/001-local-ai-assistant/spec.md`
**Input**: Feature specification with confirmed architectural decisions (Azure OpenAI / AI Inference Engine, Graph API, Windows Sandboxing, persistent permission model)

**Status**: Phase 0 Ready for Research → Phase 1 Design

## Summary

SpringBoard is a security-first local AI assistant desktop application built with Electron (frontend) + Node.js (backend) + Python (isolated ML/services). The application prioritizes worker privacy and enterprise security:
- **Zero cloud data leakage**: All conversation history, user data, and execution logs remain on local machine
- **Granular permission model**: Explicit per-resource-type permission grants (Outlook calendar, Word read, shell execution) with auto-refreshing Entra ID (MSAL) tokens
- **Local LLM first**: Azure OpenAI primarily, with support for local OpenAI-compatible inference endpoints
- **Inference-conscious orchestration**: Automation scripts and deterministic tool logic run before any LLM call; models are invoked only for reasoning/summarization steps that cannot be solved deterministically
- **Sandboxed tool execution**: Windows Sandbox (WSB) isolation for filesystem/shell/browser tools with restricted system access
- **Audited compliance**: Complete audit trail of permissions, tool use, and configuration changes for enterprise security review
- **Extensible skills framework**: Pluggable workflows similar to OpenClaw with per-skill permission declarations and managed installation/versioning

## Technical Context

**Language/Version**: 
  - Frontend/Main: **TypeScript + Electron 28+** (Windows 10/11 native)
  - Backend Services: **Node.js 20 LTS** (Node.js (Electron Main process))
  - Isolation Services: **Python 3.11** (Azure OpenAI / AI Inference Engine bridge, Graph API wrappers, tool execution adapters)
  - Tool Execution: **PowerShell 5.1, Bash** (in Windows Sandbox (WSB) containers)

**Primary Dependencies**: 
  - **LLM**: Azure OpenAI / AI Inference Engine (local model inference via HTTP API), future: Azure OpenAI for hybrid mode
  - **Office**: Microsoft Graph SDK for JavaScript, `node-office-addin` (COM fallback for Word/Excel)
  - **Sandboxing**: Windows Sandbox (WSB) (container orchestration), `Windows Sandbox (WSB)-modem` (Node.js Windows Sandbox (WSB) API)
  - **Auth**: `@azure/identity` (MSAL Node for Entra ID/SSO), `jsonwebtoken` (local token refresh)
  - **Crypto**: `crypto` (Node built-in for local encryption), `sodium.js` (for conversation encryption at rest)
  - **Storage**: `SQLCipher/better-sqlite3-multiple-ciphers-multiple-ciphers` or `nedb` (local encrypted message store), filesystem configs (SOUL.md, AGENTS.md, USER.md)
  - **Data & API**: `axios`, `ws` (WebSocket for frontend-backend comms), `pino` (structured logging)
  - **UI**: Vue 3.4, Pinia 3.0, Vue Router 5.0, PrimeVue 4.5, Tailwind CSS 4.1 (chat interface, permission dialogs, skill manager)

**Storage**: 
  - **Conversations**: SQLCipher / sqlite-vec local database (`%APPDATA%/SpringBoard/conversations.db`)
  - **Config Files**: YAML/Markdown in `%APPDATA%/SpringBoard/config/` (SOUL.md, AGENTS.md, USER.md)
  - **Audit Logs**: JSON Line logs in `%APPDATA%/SpringBoard/audit/` (rotation + retention policy)
  - **Permissions Cache**: Encrypted token store for Graph API refresh tokens (Credential Manager or encrypted file)
  - **Skills Registry**: JSON manifest + plugin code in `%APPDATA%/SpringBoard/skills/`

**Testing**: 
  - **Unit**: Jest/Vitest (Node backend, Vue components, permission logic)
  - **Contract**: Supertest + mock servers (Graph API, Azure OpenAI / AI Inference Engine, Windows Sandbox (WSB) API)
  - **Integration**: Test Electron + backend + local Azure OpenAI / AI Inference Engine setup
  - **Security**: Permission boundary tests, sandboxing escape tests, audit log validation

**Target Platform**: **Windows 10/11 (x64, future ARM64)**; requires Windows Sandbox (WSB) Desktop or Windows Sandbox (WSB) with Windows Sandbox (WSB) in Linux

**Project Type**: **Hybrid Desktop Application** (Electron 30 + Vite + Vue 3 frontend + Node.js backend + Python isolation layer)

**Frontend Stack**: Vue 3.4, Pinia 3.0 (state management), Vue Router 5.0, PrimeVue 4.5 (component library), Tailwind CSS 4.1
**Build**: Vite 5.1, vue-tsc, electron-builder
**Backend**: Node.js 20 LTS (Node.js (Electron Main process)), TypeScript 5.2
**Services**: Python 3.11 (uvicorn, FastAPI for Python services)
**IPC**: Electron IPC + WebSocket bridge for multi-process communication

**Performance Goals**: 
  - Chat response latency: <2s (perceived) for Azure OpenAI / AI Inference Engine inference on typical hardware (4090, 16GB RAM)
  - App startup: <3s from launch to ready-to-chat
  - History load: <1s for 500+ message conversations from encrypted store
  - Permission dialog: <500ms to display, <100ms to grant/revoke
  - Tool execution: <5s roundtrip for filesystem reads, <10s for complex Windows Sandbox (WSB) operations

**Reference Hardware**: Windows Surface Laptop (typical user device) - 16GB RAM, Intel Core i7/AMD Ryzen 7, NVMe SSD, Windows 11 Pro x64. Performance testing baseline: 4090 GPU (development/power user), 16GB RAM, Windows 11.

**Constraints**: 
  - **Security**: No conversation data outside local machine unless user explicitly enables hybrid cloud
  - **Offline Capable**: Core chat works without network; Office features require Entra ID auth
  - **Data Residency**: All user-provided content stays in Windows AppData or mounted WSL volumes
  - **Memory**: Target <400MB baseline (Electron 30 + Vue 3 optimized bundle with Vite), dynamic expansion for conversation stores
  - **Permissions**: OS-level restrictions enforced (Windows Sandbox or AppData isolation where applicable)
  - **Dev Experience**: Hot module reload (HMR) with Vite, TypeScript strict mode, Vue DevTools integration

**Scale/Scope**: 
  - **Initial MVP**: 1000+ message conversation history, 5–10 core skills (calendar, email, doc reader, filesystem, shell)
  - **Phase 1 Runtime**: Single-user desktop app; future: multi-user enterprise settings
  - **Audit Trail**: 100K+ audit log entries before rotation
  - **Interfaces**: Chat UI, skill manager, permission dialog, config editor, audit viewer

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ **I. Microsoft-First & Data Residency (NON-NEGOTIABLE)**

**Status**: **PASS with mitigation**

- ✅ **Primary Office integration via Graph API** (Microsoft 365 native, M365-compliant), with **COM fallback** for local Office installs
- ✅ **Zero cloud data leakage** for conversation/action history (stored locally, encrypted)
- ⚠️ **Entra ID/SSO via Entra ID (MSAL)** for enterprise auth (requires Azure tenant); local fallback: Windows credential store for non-enterprise installs
- ✅ **Future hybrid mode** will use Azure OpenAI when user opts in (explicit toggle, off by default, data flow documented)
- ✅ **Data residency**: All processed user data (emails, documents, conversations) cached locally in AppData, **NOT transmitted to Azure OpenAI / AI Inference Engine cloud or external services**

**Mitigation**: Azure OpenAI / AI Inference Engine runs local-only; Graph API calls are authenticated with user's Entra token (no SpringBoard intermediate); future hybrid mode will be opt-in with explicit user approval.

### ✅ **II. CLI-First Interfaces (NON-NEGOTIABLE)**

**Status**: **PASS**

- ✅ **Backend CLI interface** for permission management, skill installation, audit log queries
- ✅ **JSON output mode** for tool execution results (audit compliance, scripting)
- ✅ **PowerShell + Bash** shells in sandboxed environment support pipeline chaining
- ✅ **Electron backend** exposes IPC bridge for chat, skill mgmt, config reload

Example: `springboard-cli grant-permission "outlook-calendar-read" --user MyUser --expiry 30d | jq '.token'`

### ✅ **III. Test-First (NON-NEGOTIABLE)**

**Status**: **PASS with plan**

- ✅ **Unit tests**: Permission validation, encryption/decryption, config parsing, skill lifecycle
- ✅ **Contract tests**: Graph API mock (read calendar, send email), Azure OpenAI / Local fallback HTTP API, Windows Sandbox API
- ✅ **Permission boundary tests**: Verify sandboxed tool execution cannot escalate privileges
- ✅ **Audit trail tests**: Ensure all tool executions and permission changes are logged with complete metadata
- 🔲 **Model evaluator tests**: Pending (Azure OpenAI / AI Inference Engine integration will include reproducible prompts + golden test outputs)

**Plan**: Tests added before implementation; CI gates include unit + contract tests.

### ✅ **IV. Integration & Contract Testing (NON-NEGOTIABLE)**

**Status**: **PASS**

- ✅ **Graph API contract**: Versioned, tested with mock server (Graph API SDK provides type safety)
- ✅ **Windows Sandbox API contract**: Test `Windows Sandbox (WSB) run` + volume binding, exit codes, stream handling
- ✅ **Azure OpenAI / AI Inference Engine HTTP contract**: Protocol buffer or JSON schema for request/response (e.g., `/api/chat` endpoint)
- ✅ **Audit log contract**: Structured JSON schema, validated on every write

**Plans**: Contract versioning in `/contracts/` folder; breaking changes bump minor version + migration docs.

### ✅ **V. Observability, Versioning & Simplicity (NON-NEGOTIABLE)**

**Status**: **PASS**

- ✅ **Structured logging**: Pino JSON logs with semantic fields (event, resource, actor, outcome)
- ✅ **Semantic versioning**: SpringBoard X.Y.Z; skills are separately versioned
- ✅ **Minimal surface**: Explicit permission model (no implicit access), simple REST API, modular skills
- ✅ **Production observability**: Audit logs + system event logs sufficient to diagnose remote permission/tool issues

**Observability**: Logs include timestamps, permission scope, tool parameters, execution outcome, user identity (for shareware or audit review).

## Project Structure

### Documentation (this feature)

```text
specs/001-local-ai-assistant/
├── plan.md                    # Implementation plan (this file)
├── research.md                # Phase 0: Architectural research & decisions (TBD)
├── data-model.md              # Phase 1: Entity definitions, state machines (TBD)
├── quickstart.md              # Phase 1: 10-minute setup guide + architecture overview (TBD)
├── contracts/                 # Phase 1: Interface contracts & versioning
│   ├── graph-api.md           # Graph API integration contract
│   ├── lm-studio.md           # Azure OpenAI / Local fallback HTTP API contract
│   ├── sandbox-api.md          # Windows Sandbox (WSB) Windows Sandbox API contract
│   ├── permission-schema.md   # Permission grant schema
│   └── audit-log-schema.md    # Audit trail JSON schema
└── checklists/                # Security & compliance checklists
    ├── security-gates.md      # Pre-release security validation
    └── compliance-review.md   # Constitution alignment proof
```

### Source Code Repository Structure

**Desktop Application (Electron-based)**:

```text
apps/springboard-desktop/                    # Electron + Vue 3 main app
├── public/
│   ├── index.html
│   └── electron-preload.js
├── src/
│   ├── electron/
│   │   ├── main.ts                    # Electron main process
│   │   ├── app-lifecycle.ts           # App startup, updates, window mgmt
│   │   └── native-modules.ts          # Native module initialization
│   ├── components/
│   │   ├── ChatWindow.vue             # Message list, input form
│   │   ├── PermissionDialog.vue       # Grant/deny permission UI
│   │   ├── SkillConfigPanel.vue       # Skill config and controls
│   │   ├── ConfigEditor.vue           # SOUL.md, AGENTS.md, USER.md editor
│   │   └── ExecutionHistory.vue       # Audit/task history view
│   ├── pages/
│   │   ├── ChatPage.vue
│   │   ├── SettingsPage.vue
│   │   └── FirstRunPage.vue
│   ├── stores/
│   │   ├── conversationStore.ts
│   │   ├── permissionStore.ts
│   │   └── skillStore.ts
│   ├── services/
│   │   ├── api-client.ts              # Comms with backend via IPC/HTTP
│   │   └── crypto.ts                  # Client-side encryption utilities
│   ├── App.vue
│   └── main.ts
├── tests/
│   ├── unit/
│   │   ├── permission-model.test.ts
│   │   └── config-parser.test.ts
│   └── contract/
│       └── backend-api.test.ts
├── electron-builder.json5            # Packaging config
├── tsconfig.json
└── package.json
```

**Backend Services (Node.js)**:

```text
apps/springboard-backend/                    # Node.js (Electron Main process) backend
├── src/
│   ├── api/
│   │   ├── chat.ts                    # GET/IPC message: chat, /api/messages
│   │   ├── permissions.ts             # GET/IPC message: permissions, /api/tokens
│   │   ├── skills.ts                  # IPC message: skills, IPC message: skills/install
│   │   ├── tools.ts                   # IPC message: tools/execute (filesystem, shell, etc.)
│   │   ├── config.ts                  # IPC message: config, IPC message: config/reload
│   │   └── audit.ts                   # IPC message: audit/logs
│   ├── models/
│   │   ├── permission-grant.ts        # PermissionGrant entity, store/revoke logic
│   │   ├── audit-log.ts               # AuditLogEntry model, append + rotate
│   │   ├── skill-manifest.ts          # Skill validation, dependency parsing
│   │   └── conversation.ts            # Message store, encryption/decryption
│   ├── services/
│   │   ├── llm-service.ts             # Azure OpenAI / AI Inference Engine HTTP client, prompt handling
│   │   ├── office-service.ts          # Graph API + COM bridge for Word/Outlook/Excel
│   │   ├── permission-manager.ts      # Grant/revoke/check permissions, token refresh
│   │   ├── audit-logger.ts            # Structured audit trail writer
│   │   ├── skill-loader.ts            # Load, validate, isolate skill execution
│   │   ├── sandbox-orchestrator.ts    # Windows Sandbox (WSB) lifecycle
│   │   └── config-manager.ts          # SOUL.md, AGENTS.md, USER.md parser + watcher
│   ├── middleware/
│   │   ├── auth.ts                    # Verify Entra ID token or local user
│   │   ├── permission-check.ts        # Enforce per-resource permissions
│   │   └── error-handler.ts           # Structured error responses
│   ├── db/
│   │   ├── init.ts                    # SQLCipher/NeDB initialization
│   │   ├── encryption.ts              # Encryption/decryption for stored data
│   │   └── migrations/
│   └── app.ts                         # Node.js (Electron Main process) app factory
├── tests/
│   ├── unit/
│   │   ├── permission-manager.test.ts
│   │   ├── llm-service.test.ts
│   │   ├── config-manager.test.ts
│   │   └── skill-loader.test.ts
│   ├── contract/
│   │   ├── graph-api.test.ts          # Mocked Graph API responses
│   │   ├── lm-studio.test.ts          # Mocked Azure OpenAI / AI Inference Engine /api/chat
│   │   ├── sandbox-api.test.ts         # Mocked Windows Sandbox (WSB) API or test with real Windows Sandbox (WSB)
│   │   └── permission-schema.test.ts  # Validate permission grants
│   └── integration/
│       └── e2e-flow.test.ts           # Full flow: chat → tool execution → audit
├── tsconfig.json
└── package.json
```

**Python Isolation & Services**:

```text
services/springboard-python/                 # Shared Python utilities
├── src/
│   ├── lm_studio_bridge.py            # Azure OpenAI / Local fallback HTTP API wrapper, retry logic
│   ├── graph_api_adapter.py           # Graph API client, token refresh, pagination
│   ├── office_com_bridge.py           # COM automation for local Word/Excel/Outlook
│   ├── Windows Sandbox (WSB)_executor.py             # Windows Sandbox (WSB) image management, container lifecycle
│   ├── sandbox_tools.py               # Filesystem, shell, browser tool adapters
│   └── audit_formatter.py             # Audit event structure + validation
├── tests/
│   ├── test_lm_studio_bridge.py
│   ├── test_graph_api_adapter.py
│   └── test_sandbox_tools.py
├── requirements.txt
└── setup.py
```

**Shared Contracts & Schemas**:

```text
packages/springboard-contracts/              # Shared type definitions, error codes
├── src/
│   ├── permission-schema.ts           # PermissionGrant, Permission enum
│   ├── audit-schema.ts                # AuditLogEntry, EventType enum
│   ├── api-schema.ts                  # Chat message, tool execution request/response
│   ├── skill-manifest-schema.ts       # Skill metadata validation schema
│   └── errors.ts                      # Shared error codes (e.g., PERMISSION_DENIED, NOT_AUTHENTICATED)
├── tsconfig.json
└── package.json
```

**Configuration & Data Directories (Windows AppData)**:

```text
%APPDATA%/SpringBoard/
├── conversations.db              # SQLCipher (messages, metadata)
├── config/
│   ├── SOUL.md                   # AI personality & behavior model
│   ├── AGENTS.md                 # Skill orchestration & workflow rules
│   └── USER.md                   # User preferences (working hours, auto-scheduling, etc.)
├── audit/
│   ├── audit-2026-03-03.jsonl    # Daily rotated audit logs (JSON Lines format)
│   └── audit-2026-03-02.jsonl
├── skills/
│   ├── core-skills/              # Built-in skills (calendar, email, filesystem)
│   └── user-skills/              # User-installed custom skills
├── tokens/
│   └── refresh-tokens.encrypted  # Cached Graph API refresh tokens (encrypted)
└── cache/
    └── models/                   # Optional: cached Azure OpenAI / AI Inference Engine model metadata
```

**Structure Decision**: 
Multi-package monorepo structure separates concerns clearly: desktop UI layer (Electron), orchestration backend (Node), isolated utility/bridge layer (Python), and shared contracts. This enables:
- Electron to run sandboxed from backend via IPC/REST
- Backend to manage permissions, audit, and skill isolation
- Python services to run in Windows Sandbox (WSB) containers isolated from Windows host
- Clear contract boundaries for integration testing
- Future service decomposition (e.g., permission service as separate microservice)

## Phase 0: Research Gaps

*Clear NEEDS CLARIFICATION items before design begins*

Based on confirmed architectural decisions and technical context, **NO blocking research gaps identified**. 

However, the following should be validated during Phase 1 Design:

1. **Azure OpenAI / AI Inference Engine model selection & VRAM requirements**: Data-gather recommended model sizes for Outlook + Doc summary tasks on 4090 (confirmed: local inference, decision stands)
2. **Graph API scope mapping**: Document exact OAuth scopes for calendar read/write, email read, document read (requires Microsoft Graph docs review)
3. **Windows Sandbox (WSB)-in-Windows Sandbox (WSB) networking**: Validate inter-process communication between Electron/Node (Windows host) ↔ Windows Sandboxs (Windows Sandbox (WSB) Linux) for sandboxed tools
4. **Token refresh strategy**: Confirm auto-renewal timing + revocation notification via Graph API change notifications (needs contract definition)
5. **Audit log retention & performance**: Estimate audit log rotation policy for 100K+ daily tool executions (needs benchmarking during Phase 1)

**Action**: These are design-time validations; no implementation blockers.

## Complexity Tracking

> No Constitution violations needing justification. All principles (Microsoft-First, CLI-First, Test-First, Integration Testing, Observability) are satisfied with clear mitigation strategies documented in Constitution Check above.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
