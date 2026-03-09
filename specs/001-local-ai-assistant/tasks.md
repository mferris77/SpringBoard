# Tasks: SpringBoard Local-First AI Assistant

**Feature**: SpringBoard Local-First AI Assistant  
**Branch**: `001-local-ai-assistant`  
**Created**: March 3, 2026  
**Input**: spec.md, plan.md, research.md, data-model.md, 4 API contracts  
**Format**: `- [ ] [ID] [P?] [Story?] Description with file path`

---

## Dependencies & Execution Strategy

### User Story Dependency Graph

```
Phase 1: Setup (shared)
    ↓
Phase 2: Foundational (blocking all stories)
    ├─ Permission Manager
    ├─ Encryption Service
    ├─ Audit Logging
    └─ Data Storage (SQLCipher)
    ↓
Phase 3: US1 - Secure Local Chat (P1) ◄─── MVP SCOPE
  ├─ Chat UI (Electron Vue)
    ├─ LLM Service (Azure OpenAI / AI Inference Engine bridge)
    └─ Message Persistence
    ↓
Phase 4: US2 - Office Automation (P2) 
    ├─ Graph API Integration
    ├─ COM Bridge (Python adapter)
    └─ Permission Dialogs (US1 + US2 shared)
    ↓
Phase 5: US3 - Tool Sandboxing (P3)
    ├─ Windows Sandbox Executor
    ├─ Windows Sandbox (WSB) Integration
    └─ Tool Permission Controls
    ↓
Phase 6: US4 - Skill Management (P4)
    ├─ Skill Registry (SQLCipher)
    ├─ Manifest Validator
    ├─ Skill Configuration UI
    └─ SOUL/AGENTS/USER.md Hot Reload
    ↓
Phase 7: US5 - Heartbeat Scheduling (P5)
    ├─ Scheduler Service (cron provider)
    ├─ Scheduled Task Registry
    └─ Background Task Executor
    ↓
Phase 8: Polish & Cross-Cutting (all stories)
    ├─ Integration Testing (end-to-end)
    ├─ Security Testing (sandbox escape, privilege escalation)
    ├─ Performance Tuning
    └─ Documentation & Release

### Parallel Execution Opportunities

**US1 can run independently**:
- All tasks marked [P] in Phase 3 (Chat UI, LLM Service) can be implemented in parallel
- Test: Conversation history persists locally without Office/tool features

**US2 can run independently** (after Phase 2 Foundational complete):
- [P] Graph API integration + [P] COM bridge can be implemented in parallel
- Test: Permission grant/revoke works; Office resource access succeeds

**US3 can run independently** (after Phase 2 Foundational + Phase 3 US1 complete):
- [P] Windows Sandbox Executor + [P] Windows Sandbox (WSB) integration can be implemented in parallel
- Test: Tool execution runs in sandbox; filesystem escapes fail

**US4 can run after US1** (does not depend on US2/US3):
- Skill system designed independently; plugins invoke existing services
- Test: Skill installation, configuration persistence, permission enforcement

**US5 depends on US4** (heartbeat invokes skills):
- Scheduler + scheduled task registry can be implemented in parallel
- Test: Task execution at scheduled time respects permissions

---

## Phase 1: Setup (Shared Infrastructure & Project Initialization)

**Purpose**: Initialize project structure, configure build tools, establish development environment

- [X] T001 Initialize Node.js backend project structure in `apps/springboard-backend/`
  - `package.json` with base dependencies (Node.js (Electron Main process), TypeScript, Node 20 target)
  - `tsconfig.json` with TypeScript compiler options
  - `.eslintrc.json` and `.prettierrc.json` for code standards
  - `jest.config.js` for unit testing framework
  - Create folders: `src/`, `tests/`, `dist/`, `__mocks__/`

- [X] T002 Initialize Electron frontend project structure in `apps/springboard-desktop/`
  - Owner-run bootstrap in Sprint 1: `npx create-vite@latest apps/springboard-desktop -- --template vue-ts`
  - Stack target: Electron + Vue 3 + Pinia + Vue Router + PrimeVue + Tailwind
  - Main process: `electron/main.ts` (spawns Node backend, opens BrowserWindow)
  - Renderer entry: `src/main.ts` (Vue app bootstrap)
  - Preload script: `electron/preload.ts` (IPC bridge)
  - Note: Do not pre-install or scaffold dependencies during Sprint 0

- [X] T003 Initialize Python services `services/springboard-python/`
  - Python 3.11 virtual environment scaffolding
  - `requirements.txt` with Flask, pywin32, requests, pydantic
  - `main.py` with Flask app structure (stub endpoints)
  - `venv/` folder (in .gitignore)
  - Documentation: setup.md (venv creation, pip install)

- [X] T004 [P] Create shared contracts package `packages/springboard-contracts/`
  - TypeScript interfaces for all 4 API contracts
  - `src/permission-schema.ts` (PermissionScope enum, GrantRequest/GrantResponse types)
  - `src/lm-studio.ts` (ChatRequest, ChatResponse types, OpenAI-compatible)
  - `src/sandbox-api.ts` (ContainerStartRequest, ExecutionResult types)
  - `src/audit-log.ts` (AuditLogEntry types, event enum)
  - `package.json` with `tsup` for bundling + npm distribution

- [X] T005 [P] Set up monorepo root tooling
  - Root `package.json` with npm workspaces (apps, services, packages)
  - `turbo.json` for build orchestration and caching
  - CI/CD script placeholders: `.github/workflows/build.yml`, `.github/workflows/test.yml`
  - Documentation: `DEVELOPMENT.md` (how to run all services locally)

- [X] T006 [P] Configure database infrastructure
  - SQLCipher schema migration tool (e.g., `SQLCipher/better-sqlite3-multiple-ciphers-multiple-ciphers` or `typeorm`)
  - Create `apps/springboard-backend/src/db/migrations/` folder
  - Initial schema (stubs for all 8 entities: Conversation, Message, PermissionGrant, Skill, ScheduledTask, ToolExecutionRecord, AuditLogEntry, ConfigurationProfile)
  - Database initialization script: `scripts/init-db.sh`

- [X] T007 [P] Create GitHub issues template and project board
  - Issue templates: `.github/ISSUE_TEMPLATE/feature.md`, `bug.md`, `security.md`
  - Pull request template: `.github/pull_request_template.md`
  - GitHub Projects board linked to feature kanban (Setup, Foundational, US1-US5, Polish)

- [X] T008 [P] Scaffold README and architecture documentation
  - Update root `README.md` with project purpose, tech stack, target users
  - Create `docs/ARCHITECTURE.md` (system diagram, component overview, deployment target)
  - Create `docs/SECURITY.md` (threat model, mitigations, audit logging approach)
  - Create `docs/CONTRIBUTING.md` (code style, testing requirements, PR checklist per constitution)

---

## Phase 2: Foundational (Blocking Prerequisites for All User Stories)

**Purpose**: Build security-critical, shared infrastructure that all user stories depend on

### Permission Manager & Storage

- [ ] T009 Implement SQLCipher wrapper in `apps/springboard-backend/src/lib/encrypted-db.ts`
  - Wrapper around `SQLCipher/better-sqlite3-multiple-ciphers-multiple-ciphers` with transparent AES-256-GCM encryption
  - Methods: `create()`, `query()`, `insert()`, `update()`, `delete()`
  - Encryption key: derived from Windows DPAPI(Data Protection API) via `crypto.randomBytes()` seeded with user SID
  - Validate: Decrypted data matches plaintext (unit test with sample Conversation object)

- [ ] T010 Implement PermissionGrant entity in `apps/springboard-backend/src/models/permission-grant.ts`
  - Class: `PermissionGrant` with properties from data-model.md (id, scope, grantedAt, expiresAt, revokedAt, grantMetadata)
  - Methods: `isActive()`, `isExpired()`, `revoke(reason)`, `toJSON()`
  - SQLCipher table: `permission_grants` (columns per data-model.md)
  - Validation: Scope must be in canonical PermissionScope enum

- [ ] T011 [P] Implement permission store repository in `apps/springboard-backend/src/repositories/permission-grant-repository.ts`
  - Methods: `grant(scope, ttl)`, `revoke(id, reason)`, `getActive(scope)`, `listAll()`, `refresh(id)`
  - Database operations via encrypted-db wrapper
  - Unit tests: Grant → revoke → verify not in getActive(); expiry calculation

- [ ] T012 [P] Implement permission validation service in `apps/springboard-backend/src/services/permission-validator.ts`
  - Method: `checkPermission(scope) → boolean` (is permission active + not expired?)
  - Method: `requirePermission(scope) → PermissionGrant | throws PermissionDeniedError`
  - Audit: Log each check (audit service integration)
  - Unit tests: Granted vs. revoked vs. expired scopes

### Encryption & Token Management

- [ ] T013 Implement conversation encryption service in `apps/springboard-backend/src/services/encryption-service.ts`
  - Algorithm: AES-256-GCM with authenticated encryption
  - Methods: `encrypt(plaintext, metadata) → {ciphertext, iv, tag, salt}`, `decrypt(ciphertext, iv, tag, metadata)`
  - Key derivation: PBKDF2 with Random salt (similar to `sodium.js` patterns)
  - Unit tests: Encrypt → decrypt roundtrip; tampered ciphertext rejected

- [ ] T014 [P] Implement token refresh scheduler in `apps/springboard-backend/src/services/token-refresh-scheduler.ts`
  - Purpose: Manage Graph API refresh_token rotation (prevent expiration)
  - Methods: `scheduleRefresh(permissionId, refreshToken, expiresIn)`, `onRefreshNeeded()`
  - Background task: Queue-based (e.g., Bull.js or node-schedule)
  - Error handling: Failed refresh logs error, notifies user (via audit + logging)
  - Unit tests: Schedule future refresh; verify token store updated

- [ ] T015 [P] Implement credential store (DPAPI wrapper) in `apps/springboard-backend/src/lib/secure-credential-store.ts`
  - Wrapper around Windows Credential Manager via `credential-manager` package (or custom win32 bindings)
  - Methods: `store(key, secret)`, `retrieve(key) → secret`, `delete(key)`
  - Fallback: Encrypted file store in `%APPDATA%/SpringBoard/secrets/` if Credential Manager unavailable
  - Unit tests: Store → retrieve → delete roundtrip

### Audit Logging

- [ ] T016 Implement AuditLogEntry entity in `apps/springboard-backend/src/models/audit-log-entry.ts`
  - Properties per data-model.md: id, timestamp, eventType, actor, outcome, details (JSON)
  - Event types enum: PERMISSION_GRANT, TOOL_EXECUTION_START, TOOL_EXECUTION_END, CONFIG_CHANGE, AUTH_FAILURE, PERMISSION_REVOKE, etc.
  - Methods: `toJSONLine()` (for JSON Lines format), `validate()`

- [ ] T017 Implement audit logger service in `apps/springboard-backend/src/services/audit-logger.ts`
  - Method: `logEvent(eventType, actor, outcome, details)` → write to JSON Lines file
  - Storage: `%APPDATA%/SpringBoard/audit/audit-YYYYMMDD.jsonl` (daily rotation + gzip compression)
  - Immutability: Append-only; no editing past entries
  - Retention: 90-day auto-delete via scheduled cleanup task
  - Unit tests: Write event → read back verified; rotation works

- [ ] T018 [P] Implement audit query service in `apps/springboard-backend/src/services/audit-query-service.ts`
  - Methods: `queryByEventType(type, from, to) → AuditLogEntry[]`, `queryByActor(actor)`, `queryByPermissionScope(scope)`
  - Search: Iterate through JSON Lines files, filter in-memory (audit logs not queried frequently)
  - Performance: Cache recent 1000 entries in memory; reload on file rotation
  - Unit tests: Query permission_grant events; verify filtered results

### Database & Data Persistence

- [ ] T019 Create SQLCipher schema migrations in `apps/springboard-backend/src/db/migrations/`
  - Migration framework: `SQLCipher/better-sqlite3-multiple-ciphers-multiple-ciphers` with manual migration files (001_init_conversations.sql, 002_init_permissions.sql, etc.)
  - Tables: conversations, messages, permission_grants, skills, scheduled_tasks, tool_execution_records, audit_log (if DB-stored), configuration_profiles
  - Indexes: On (user_principal_name, created_at) for Conversation; (conversation_id) for Message; (scope, granted_at) for PermissionGrant
  - Foreign key constraints enabled; cascade delete where appropriate (clean up messages when conversation deleted)
  - SQL files placed in migrations folder for version control + auditing

- [ ] T020 Implement database initialization in `apps/springboard-backend/src/db/database.ts`
  - Class: `Database` with constructor that opens SQLCipher + runs migrations
  - Methods: `initialize()`, `isReady()`, `close()`, `transaction(callback)`
  - Error handling: Graceful failure if DB corrupted (prompt user to restore from backup)
  - Unit tests: Initialize → verify tables exist; close → reopen

### Configuration Management

- [ ] T021 Implement config parser in `apps/springboard-backend/src/services/config-service.ts`
  - Purpose: Load and parse SOUL.md, AGENTS.md, USER.md from `%APPDATA%/SpringBoard/config/`
  - Format: YAML/Markdown frontmatter (e.g., `---\npersonality: helpful\n---\nDescription`)
  - Methods: `loadSOUL() → SOULConfig`, `loadAGENTS() → AgentsConfig`, `loadUSER() → UserConfig`
  - Validation: JSON Schema validation per entity; log warnings for missing fields
  - Error recovery: Return sensible defaults if config missing/malformed
  - Unit tests: Parse valid config; handle missing/syntax errors gracefully

- [ ] T022 [P] Implement config file watcher in `apps/springboard-backend/src/services/config-watcher.ts`
  - Framework: `chokidar` or native fs.watch
  - Purpose: Monitor SOUL.md, AGENTS.md, USER.md for changes; reload without restart
  - Methods: `watchConfig()`, `onConfigChanged(callback)`, `unwatch()`
  - Debounce: 500ms wait before reload (prevent repeated fires while user typing)
  - Audit: Log config change event with delta (what changed)
  - Unit tests: Modify config file → listener fires; config reloaded

### Foundational Testing Infrastructure

- [ ] T023 [P] Create mock servers for contract testing in `apps/springboard-backend/__mocks__/`
  - `lm-studio-mock.ts`: Mock OpenAI-compatible /v1/chat/completions endpoint (returns canned response)
  - `graph-api-mock.ts`: Mock Graph API endpoints (GET /me/calendarview, POST /me/events, etc.)
  - `sandbox-api-mock.ts`: Mock Windows Sandbox (WSB) API container lifecycle
  - Servers run on localhost:8001, 8002, 8003 (configurable)
  - Unit tests: Call mock endpoint → verify response format matches contract

- [ ] T024 [P] Set up test database in `apps/springboard-backend/__mocks__/test-db.ts`
  - Function: `createTestDatabase() → Database` (in-memory SQLCipher for fast tests)
  - Cleanup: `dropTestDatabase()` after each test
  - Seeding: `seedPermissions()`, `seedConversations()` helpers for test setup
  - Usage: Test files import and use in beforeEach/afterEach hooks

- [ ] T025 [P] Create integration test helper in `apps/springboard-backend/tests/integration-helper.ts`
  - Setup: Start Node backend + mock servers + test database in beforeAll
  - Teardown: Stop all services in afterAll
  - HTTP client: Axios configured for Electron Main IPC (backend) + test assertions
  - Usage pattern: `const { app, db } = await setupIntegrationTests(); await request(app).get('/api/health')`

---

## Phase 3: User Story 1 - Secure Local Chat (P1 — MVP Scope)

**User Goal**: User opens SpringBoard, has a private conversation with AI, and can recall conversation history locally

**Independent Test Criteria**:
- ✅ Conversation data persists to SQLCipher after message send
- ✅ App restart restores full conversation history
- ✅ No network requests made outside localhost (Azure OpenAI / AI Inference Engine + internal HTTP)
- ✅ Encryption validation: randomly sample disk file, verify unreadable without decryption key
- ✅ Response time <2s for typical query (measured with Azure OpenAI / AI Inference Engine inference timing)

### Conversation & Message Models

- [ ] T026 [US1] Implement Conversation entity in `apps/springboard-backend/src/models/conversation.ts`
  - Properties: id (UUID), createdAt, updatedAt, title, messageCount, encrypted, encryptionVersion, userPrincipalName, metadata (JSON)
  - Validation: title non-empty <256 chars; messageCount >= 0
  - Methods: `addMessage(message)`, `getMessages()`, `getTitle()`, `setTitle(newTitle)`, `delete()`, `archive()`
  - Unit tests: Create conversation → add messages → verify message count incremented

- [ ] T027 [P] [US1] Implement Message entity in `apps/springboard-backend/src/models/message.ts`
  - Properties: id (UUID), conversationId, author (user|assistant|system), content, createdAt, tokensUsed, modelName, metadata (JSON)
  - Validation: author in enum; content non-empty <64KB; tokensUsed >= 0
  - Methods: `toJSON()`, `toEncrypted()` (returns encrypted structure), `getMetadata()`
  - Support: Both plain text and JSON-structured tool results (e.g., `{type: "tool_result", body: "...", tool_calls: []}`)
  - Unit tests: Create message → serialize → deserialize roundtrip

### Chat API & LLM Integration

- [ ] T028 [P] [US1] Implement LLM service in `apps/springboard-backend/src/services/lm-service.ts`
  - Purpose: HTTP client for Azure OpenAI / AI Inference Engine /v1/chat/completions endpoint (OpenAI-compatible)
  - Methods: `complete(messages: Message[], model?: string) → {content, tokens, latency}`
  - Configuration: Azure OpenAI / AI Inference Engine URL from env (default inference endpoint); fallback error if unavailable
  - Model selection: Get from SOUL.md config or hardcoded fallback (e.g., "mistral-7b")
  - Error handling: Timeout 30s; return user-facing error if Azure OpenAI / AI Inference Engine down
  - Unit tests: Call mock Azure OpenAI / AI Inference Engine → verify response format; timeout handling

- [ ] T029 [P] [US1] Implement chat API endpoint in `apps/springboard-backend/src/routes/chat.ts`
  - Endpoint: `IPC message: chat`
  - Request: `{conversationId?: UUID, userMessage: string}`
  - Response: `{conversationId: UUID, assistantMessage: string, tokensUsed: number, latency: number}`
  - Logic: 
    1. If no conversationId, create new Conversation
    2. Add user Message to conversation (encrypted)
    3. Load conversation context (last N messages)
    4. Call LM service with conversation history
    5. Add assistant Message to conversation (encrypted)
    6. Save both to database
    7. Return to client
  - Error handling: Azure OpenAI / AI Inference Engine down → 503; invalid conversationId → 404
  - Unit tests: POST valid request → conversation created + messages saved; roundtrip message encryption

- [ ] T030 [P] [US1] Implement conversation REST API in `apps/springboard-backend/src/routes/conversations.ts`
  - `IPC message: conversations` → list all conversations (summary: id, title, lastUpdated, messageCount)
  - `IPC message: conversations/:id` → get single conversation (full: metadata, messageCount)
  - `IPC message: conversations/:id/messages` → get all messages (paginated, limit 100)
  - `IPC message: conversations/:id` → soft delete (mark as deleted, recoverable 30 days)
  - `IPC message: conversations/:id` → update title
  - Error handling: 404 if conversation not found; 403 if unauthorized access (multi-user future)
  - Unit tests: Create → list → get → delete roundtrip; verify message encryption in response

### Electron UI - Chat Interface

- [ ] T031 [US1] Create chat Vue component in `apps/springboard-desktop/src/components/ChatWindow.vue`
  - Component renders: Message list (scrollable), input box (textarea), send button
  - State: Pinia store (currentConversation, messages, loading, error)
  - UX: Auto-scroll to latest message; show "Assistant is typing..." indicator
  - Styling: Tailwind CSS + PrimeVue; clean, minimal design (light/dark mode support via CSS vars)
  - Accessibility: ARIA labels; keyboard shortcuts (Enter to send, Shift+Enter for newline)
  - Unit tests: Mount component → verify message list renders; send button click → dispatches store action

- [ ] T032 [P] [US1] Create conversation list sidebar Vue component in `apps/springboard-desktop/src/components/ConversationList.vue`
  - Component renders: List of conversation summaries (title, lastUpdated, messageCount)
  - Actions: Click to open; right-click context menu (archive, delete, rename)
  - UX: Search bar to filter conversations; "New Chat" button at top
  - State: Pinia store (conversations[], selectedId, searchQuery)
  - Styling: Tailwind + PrimeVue; selected conversation highlighted
  - Integration: Load from IPC message: conversations on mount; refresh on store update
  - Unit tests: Mount component → list renders; click conversation → emits selection event

- [ ] T033 [P] [US1] Implement API client in `apps/springboard-desktop/src/api/chat-client.ts`
  - Purpose: IPC wrapper for backend calls (chat, conversations, permissions, etc.)
  - Methods: `sendMessage()`, `getConversations()`, `getConversation()`, `deleteConversation()`, etc.
  - Configuration: Backend URL from env (default Electron Main IPC)
  - Error handling: Wrap HTTP errors; expose .isNetworkError() for UI to show "offline" state
  - Request/response logging: Via pino logger for debugging
  - Unit tests: Mock axios; verify correct endpoints called with proper payloads

- [ ] T034 [P] [US1] Implement main Electron window in `apps/springboard-desktop/electron/main.ts`
  - Purpose: Electron main process lifecycle + Vite integration
  - Actions: 
    1. Check if backend running (localhost:5000 health check); if not, spawn `npm run dev:python`
    2. Wait for backend ready (retry 10x, 500ms apart)
    3. Create BrowserWindow → load vite dev server (dev mode) or built index.html (prod)
    4. Attach IPC preload bridge (contextBridge in electron/preload.ts)
    5. On app quit, terminate backend child process
  - Window options: 1200x800 minimum; icon from `assets/icon.png`
  - Vite dev: Enable HMR for hot reload during development
  - Error recovery: If backend crashes, show error dialog + offer restart
  - Unit tests: Mock child_process; verify startup sequencing, IPC bridge available

### Local Persistence & Encryption

- [ ] T035 [US1] Implement conversation repository in `apps/springboard-backend/src/repositories/conversation-repository.ts`
  - Methods: `create(userId)`, `getById(id)`, `listByUser(userId)`, `addMessage(conversationId, message)`, `getMessages(conversationId, limit=100)`, `delete(id)`, `update(id, fields)`
  - Database: SQLCipher via encrypted-db wrapper (automatic encryption/decryption)
  - Transactions: Multi-message operations wrapped in DB transaction (atomicity)
  - Validation: Foreign key checks (message.conversationId must exist)
  - Unit tests: Create → add messages → getMessages → verify order; transaction rollback on error

- [ ] T036 [P] [US1] Implement message repository in `apps/springboard-backend/src/repositories/message-repository.ts`
  - Methods: `create(conversationId, author, content, metadata)`, `getByConversationId()`, `getById()`, `update(id, fields)`, `delete(id)`
  - Encryption: Auto-encrypt content on insert via conversation encryption service
  - Queries: Filtered by conversationId + author (for bot vs. user messages)
  - Validation: Content not empty; author in enum
  - Unit tests: Insert encrypted message → retrieve → verify decrypted content matches

- [ ] T037 [P] [US1] Create database migration for chat tables in `apps/springboard-backend/src/db/migrations/001_init_chat.sql`
  - Table: `conversations` (id, created_at, updated_at, title, message_count, encrypted, encryption_version, user_principal_name, metadata_json, deleted_at)
  - Table: `messages` (id, conversation_id, author, content_encrypted, created_at, tokens_used, model_name, metadata_json)
  - Indexes: (conversation_id, created_at) for messages; (user_principal_name, created_at) for conversations
  - Constraints: FK conversation_id → conversations(id) ON DELETE CASCADE; CHECK author IN ('user', 'assistant', 'system')

### Testing for US1

- [ ] T038 [US1] Create unit tests for Conversation model in `apps/springboard-backend/tests/models/conversation.test.ts`
  - Test: Create conversation → getTitle() returns correct value
  - Test: Add message → messageCount incremented
  - Test: Delete conversation → marked as deleted (soft delete)
  - Coverage: >95% of model methods

- [ ] T039 [P] [US1] Create unit tests for LLM service in `apps/springboard-backend/tests/services/lm-service.test.ts`
  - Test: Call complete() with mock Azure OpenAI / AI Inference Engine → response formatted correctly
  - Test: Azure OpenAI / AI Inference Engine unavailable → error handled + user message returned
  - Test: Timeout after 30s
  - Coverage: >90% of service logic

- [ ] T040 [P] [US1] Create contract tests for chat API in `apps/springboard-backend/tests/contracts/chat-api.test.ts`
  - Test: IPC message: chat with valid payload → 200, conversation created, messages encrypted
  - Test: IPC message: conversations → list returned, no plain conversation data
  - Test: IPC message: conversations/:id/messages → messages decrypted transparently
  - Test: IPC message: chat without LLM → 503 error
  - Coverage: All happy paths + error cases

- [ ] T041 [P] [US1] Create integration test for chat flow in `apps/springboard-backend/tests/integration/chat-flow.test.ts`
  - Test: Start backend + frontend → login → send message → verify in conversation history → restart app → history persists
  - Workflow: 5-message conversation → app close → reopen → messages restored with correct order/encryption
  - Timing: Measure response latency; assert <2s perceived time
  - Network: Verify no external network calls logged in audit

### Deliverables for US1

- ✅ **Code**: Conversation + Message models, LLM service, chat endpoints, Electron UI, repositories
- ✅ **Tests**: Unit + contract + integration tests (>85% coverage)
- ✅ **Database**: SQLCipher with conversation + message schema
- ✅ **Documentation**: Architecture diagram in `docs/ARCHITECTURE.md` showing US1 data flow
- ✅ **Demo**: 5-message conversation end-to-end demo script in `scripts/demo-us1.sh`

---

## Phase 4: User Story 2 - Office Automation with Permission Controls (P2)

**User Goal**: User asks assistant to manage Outlook calendar/email and see explicit permission prompts before access

**Independent Test Criteria**:
- ✅ Permission dialog appears when skill requests Office access
- ✅ User can grant/deny; decision persisted to SQLCipher
- ✅ Granted permission allows Graph API calls to Outlook; denied blocks silently
- ✅ User can revoke permission via UI; subsequent access blocked
- ✅ Office resource audited: access logged with timestamp, scope, method (Graph vs. COM)

### Office Integration Models

- [ ] T042 [US2] Implement Office Graph API service in `apps/springboard-backend/src/services/graph-api-service.ts`
  - Purpose: Wrapper around @azure/identity + Microsoft Graph SDK
  - Authentication: Use `MSAL Node` for Entra ID (fallback to device code flow for non-Azure)
  - Methods: `getCalendarEvents(from, to) → OfficeEvent[]`, `createEvent(title, start, end) → OfficeEvent`, `getEmails(filter?) → OfficeEmail[]`, `getDocuments() → OfficeDocument[]`
  - Token refresh: Automatic via Graph SDK (handles refresh_token rotation)
  - Error handling: Auth failure → log audit event + return 401; resource not found → return empty list
  - Permissions: Check permission grant before API call (policy: outlook-calendar-read, outlook-mail-read, etc.)
  - Unit tests: Mock Graph SDK; verify permission checks enforced

- [ ] T043 [P] [US2] Implement Office COM bridge in `services/springboard-python/excel_office_bridge.py`
  - Purpose: Win32 COM wrapper for local Office (fallback to Graph API)
  - Python class: `OfficeComBridge` with methods matching Graph API service interface
  - Libraries: `pywin32` for COM; `win32com.client` for Office object model
  - Methods: `get_calendar_events()`, `create_event()`, `get_emails()`, `get_documents()`
  - Error handling: COM not available → return None (Graph API fallback); invalid Office objects → log + skip
  - Security: No elevation; runs under user context (Windows credentials)
  - Integration: Called from Graph API service if Graph available; fallback if auth fails
  - Unit tests: Mock COM objects; verify methods return expected structures

- [ ] T044 [P] [US2] Implement permission dialog service in `apps/springboard-backend/src/services/permission-dialog-service.ts`
  - Purpose: Request user permission for Office access via Electron IPC
  - Methods: `requestPermission(scope: PermissionScope) → Promise<{granted: boolean, ttl?: number}>`
  - IPC call: Send message to Electron → show dialog → user approves/denies → return response
  - Audit: Log permission request + response (who asked, when, decision)
  - UX: Clear explanation (e.g., "Outlook Calendar Read: The assistant needs to read your calendar to schedule meetings. Grant? [Yes] [No] [Never ask again]")
  - Timeout: 30s (if user doesn't respond, default deny)
  - Unit tests: Mock Electron IPC; verify permission stored on grant

- [ ] T045 [P] [US2] Implement Office resource entity in `apps/springboard-backend/src/models/office-resource.ts`
  - Properties: id, resourceType (calendar|email|document), identifier (event ID, email ID, file path), accessedAt, permissionLevel, accessMethod (graph|com), userPrincipalName
  - Relationships: Many OfficeResources per Conversation (if Office content mentioned)
  - Storage: SQLCipher office_resources table (for audit + analytics)
  - Methods: `toJSON()`, `getAuditData()`

### Office Skills (Conversational Capabilities)

- [ ] T046 [US2] Create "Calendar Daily Briefing" skill in `apps/springboard-backend/src/skills/calendar-briefing/`
  - Entrypoint: `skill.ts` (skill definition, required permissions: outlook-calendar-read)
  - Manifest: `skill.yaml` with metadata, config schema (start_hour: int, default 9)
  - Logic: Fetch calendar events for today → summarize for user (in Message content)
  - Invocation: User asks "What's on my calendar today?" → assistant invokes skill → Graph API call with permission check
  - Permission flow: First invocation → permission dialog → grant → query calendar → return summary
  - Unit tests: Mock Graph API → skill invocation → calendar data summarized

- [ ] T047 [P] [US2] Create "Email Draft Reply" skill in `apps/springboard-backend/src/skills/email-reply-draft/`
  - Manifest: Required permissions [outlook-mail-read, outlook-mail-send] (optional, needed for subsequent Send)
  - Logic: Fetch latest email from user inbox → LLM generates `eriority: draft reply text → return in Message
  - Invocation: User asks "Draft a reply to my latest email" → assistantasks for outlook-mail-read → fetches email → LLM draft → show to user (not sent; send requires additional permission)
  - Skill output: `{type: "draft_email", draftText: "...", originalEmail: {from, subject, timestamp}}`
  - Unit tests: Mock Graph API + LLM service → draft generated

### Permission UI Components

- [ ] T048 [US2] Create permission dialog Vue component in `apps/springboard-desktop/src/components/PermissionDialog.vue`
  - Component: Modal dialog with permission request (scope in human-readable form)
  - Content: "Assistant needs: [scope description]. Grant? [Approve] [Deny] [Never ask again]"
  - UX: Show icon + explanation (e.g., Outlook calendar icon + "Read your calendar to schedule meetings")
  - Actions: Approve (grant immediately), Deny (deny once), Never (deny permanently + don't ask again)
  - State: Pinia store (pendingPermission, dialogVisible)
  - Styling: Tailwind + PrimeVue Dialog for consistency
  - Integration: IPC from backend → emit to parent → parent commits to store
  - Unit tests: Mount component → click buttons → verify emits dispatched

- [ ] T049 [P] [US2] Create permissions manager page Vue component in `apps/springboard-desktop/src/pages/PermissionsPage.vue`
  - Route: /permissions
  - Page shows: DataTable of granted permissions (scope, granted_at, expiry_countdown, resource_filter if any)
  - Actions: [Revoke] button per permission + bulk revoke (revoke all)
  - Columns: Scope | Granted | Expires | Resource | [Revoke]
  - State: Pinia store (grantedPermissions[], filters)
  - Filters: By app (Office, Tools, System) | by status (active, expired, revoked)
  - Refresh: Real-time list from store (subscribed to mutations); optional polling
  - Components: PrimeVue DataTable, Button
  - Unit tests: Page renders → mock permissions → revoke button → dispatches store action

### Office API Endpoints

- [ ] T050 [US2] Implement Office endpoints in `apps/springboard-backend/src/routes/office.ts`
  - `IPC message: office/calendar/events` → {from, to} query params → returns OfficeEvent[] (checks outlook-calendar-read permission)
  - `IPC message: office/calendar/events` → {title, start, end} → creates event → checks outlook-calendar-write permission
  - `IPC message: office/emails` → {filter} → returns OfficeEmail[] (checks outlook-mail-read)
  - `IPC message: office/documents` → returns OfficeDocument[] (checks word-document-read)
  - All endpoints: Check permission before calling Graph/COM; log access to audit log
  - Error handling: 403 Forbidden if permission not granted; 503 if Office unavailable
  - Unit tests: Call with permission granted/denied → verify behavior

### O ffice Integration Testing

- [ ] T051 [US2] Create contract tests for Graph API in `apps/springboard-backend/tests/contracts/graph-api.test.ts`
  - Mock Graph API server (localhost:8002) returning canned calendar/email responses
  - Test: Call getCalendarEvents() → mock responds with attendee list
  - Test: Permission check before call → no permission → call blocked
  - Test: Valid permission → call succeeds
  - Coverage: Happy path + error cases (auth failure, rate limit, timeout)

- [ ] T052 [P] [US2] Create contract tests for COM bridge in `services/springboard-python/tests/test_office_bridge.py`
  - Test: OfficeComBridge initialized → can call get_calendar_events() (mocked COM objects)
  - Test: COM object not available → method returns None
  - Test: Verify output structure matches Graph API format (contract parity)

- [ ] T053 [P] [US2] Create integration test for Office permission flow in `apps/springboard-backend/tests/integration/office-permission-flow.test.ts`
  - Test: User asks "Check my calendar" → permission dialog triggered → user grants → calendar fetched
  - Test: User denies permission → subsequent ask blocked (cached denial)
  - Test: User revokes permission → next calendar request shows dialog again
  - Workflow: Ask → grant → access → revoke → ask again (5 requests total, 2 permission dialogs only)
  - Audit: Verify all 5 interactions logged to audit log

### Deliverables for US2

- ✅ **Code**: Graph API + COM bridge services, Office skills (calendar, email), permission dialogs, Office endpoints
- ✅ **Tests**: Unit + contract + integration tests (>85% coverage)
- ✅ **UI**: Permission dialog + permission manager page
- ✅ **Audit**: All Office access logged to audit trail
- ✅ **Documentation**: Office integration architecture in `docs/ARCHITECTURE.md` with data flow (Graph vs. COM decision tree)
- ✅ **Demo**: Calendar check + email draft demo script in `scripts/demo-us2.sh`

---

## Phase 5: User Story 3 - Safe Tool Execution with Sandboxing (P3)

**User Goal**: User asks assistant to perform local task (read file, list directory, run command) in isolated sandbox environment

**Independent Test Criteria**:
- ✅ Tool execution runs in Windows Sandbox (Windows Sandbox (WSB)) with restricted filesystem mounts
- ✅ Tool output captured + returned to assistant
- ✅ Attempt to escape sandbox (e.g., `cd ..` beyond allowed mount) blocked/logged
- ✅ Tool execution logged to audit trail (command, mounts, exit code, output)
- ✅ User can enable/disable tool categories in settings (block shell, allow filesystem read-only)

### Windows Sandbox (WSB) & Sandboxing Infrastructure

- [ ] T054 [US3] Design Windows Sandbox (WSB) image for tool execution in `apps/springboard-backend/Windows Sandbox (WSB)/Windows Sandbox (WSB)file`
  - Base: Alpine Linux (minimal footprint)
  - Installed: bash, sh, python, curl, jq, grep, sed, awk (standard CLI tools)
  - No: Compilers, package managers, sudo (security)
  - Entry: `/bin/sh` (stateless; each execution spawns fresh container)
  - Size target: <100MB compressed
  - Build: `Windows Sandbox (WSB) build -t springboard-executor:latest -f Windows Sandbox (WSB)/Windows Sandbox (WSB)file .`

- [ ] T055 [P] [US3] Implement Windows Sandbox Executor service in `apps/springboard-backend/src/services/Windows Sandbox (WSB)-executor.ts`
  - Purpose: Spawn + manage sandboxed container execution
  - Methods: `executeCommand(command, mounts) → {output, exitCode, duration}`
  - Windows Sandbox (WSB) API: Use `Windows Sandbox COM/PowerShell API` (Node.js Windows Sandbox (WSB) API client) or HTTP socket to `Windows Sandbox (WSB).sock` (Windows Sandbox (WSB))
  - Mounts: Restrict to user-approved directories (e.g., Documents, Downloads, temp only)
  - Resource limits: Memory 256MB, CPU 0.5 cores, timeout 30s
  - Execution: Create container → exec command → capture stdout/stderr → remove container
  - Error handling: Image not found → pull; container fails → return exit code + error stream
  - Unit tests: Mock Windows Sandbox (WSB) API; verify container started with correct mounts

- [ ] T056 [P] [US3] Implement Windows Sandbox (WSB) integration in `apps/springboard-backend/src/services/wsl-manager.ts`
  - Purpose: Ensure Windows Sandbox (WSB) is running in Windows Sandbox (WSB) before tool execution
  - Methods: `checkWindows Sandbox (WSB)Ready() → boolean`, `startWindows Sandbox (WSB)()`, `getWindows Sandbox (WSB)Socket() → path`
  - Checks: Windows Sandbox (WSB) installed + running; Windows Sandbox (WSB) daemon accessible; Windows Sandbox (WSB) Linux kernel has cgroup v2 (required for Windows Sandbox (WSB) resource limits)
  - Startup: If Windows Sandbox (WSB) not running, execute `wsl -d Windows Sandbox (WSB)-Desktop service Windows Sandbox (WSB) start` (or equivalent)
  - Fallback: If Windows Sandbox (WSB) unavailable, return user error ("Windows Sandbox (WSB) not available; install Windows Sandbox")
  - Health: Periodic check (every 5 min) that Windows Sandbox (WSB) responsive; alert user if fails
  - Unit tests: Mock WSL commands; verify Windows Sandbox (WSB) startup sequencing

### Tool Definitions & Permissions

- [ ] T057 [US3] Create tool definitions in `apps/springboard-backend/src/tools/tool-registry.ts`
  - Tools: filesystem, shell, browser, document-reader
  - Per-tool configuration:
    - **filesystem**: read vs. read-write; allowed paths (Documents, Downloads, Application Data, temp)
    - **shell**: enabled/disabled; allowed commands whitelist (optional)
    - **browser**: enabled/disabled; URL whitelist (optional)
    - **document-reader**: enabled/disabled; file type whitelist (*.pdf, *.docx, *.xlsx, *.txt)
  - Registry: Load from SOUL.md or default values; allow user override in UI settings
  - Unit tests: Load registry → verify tool list; permissions enforced per config

- [ ] T058 [P] [US3] Implement filesystem tool in `apps/springboard-backend/src/tools/filesystem-tool.ts`
  - Methods: `list(path) → {files, dirs}`, `read(path) → string`, `write(path, content)`, `stat(path) → {size, created, modified}`
  - Permissions: Check filesystem-read / filesystem-write before operation
  - Mount: Restrict to user-approved paths only (no access outside mount list)
  - Validation: Normalize paths; prevent `../../` escapes; block access to system paths (C:\Windows, C:\Program Files)
  - Execution: Via Windows Sandbox Executor; safe by design (container can't escape)
  - Unit tests: Read file → write file → verify content; escape attempt blocked

- [ ] T059 [P] [US3] Implement shell tool in `apps/springboard-backend/src/tools/shell-tool.ts`
  - Methods: `execute(command, cwd?: path) → {output, exitCode, duration}`
  - Permissions: Check shell-execute before operation; user must approve command execution (even with permission granted)
  - Execution: Via Windows Sandbox Executor in `/bin/sh` mode
  - Restrictions: No sudo, no package install commands, limited to allowed commands (if whitelist in config)
  - Safety: Command line logged exactly (audit trail); output sanitized for XSS if returned to UI
  - Unit tests: Execute echo command → verify output; attempt `rm -rf` → denied

- [ ] T060 [P] [US3] Implement browser automation tool (stub) in `apps/springboard-backend/src/tools/browser-tool.ts`
  - Methods: `navigate(url) → {title, content}`, `click(selector) → void`, `getScreenshot() → image_bytes`
  - Framework: Puppeteer (headless Chrome) or Playwright
  - Permissions: Check browser-automation before operation
  - Execution: Via Windows Sandbox Executor (Chrome in container via Xvfb or headless mode)
  - Timeout: 30s per page load // 10s per click
  - Unit tests: Navigate to test page → screenshot returned

- [ ] T061 [P] [US3] Implement document reader tool in `apps/springboard-backend/src/tools/document-reader-tool.ts`
  - Supported: .pdf (pdfjs), .docx (docx), .xlsx (xlsx), .txt (plain)
  - Methods: `readDocument(path) → {fullText, metadata, numPages}`
  - Permissions: Check document-reader or specific document-type permission before operation
  - Size limits: Fail on >100MB files (prevent memory exhaustion)
  - Unit tests: Read PDF → extract text; read Excel → extract cell data

### Tool Execution & Audit

- [ ] T062 [US3] Implement tool execution endpoint in `apps/springboard-backend/src/routes/tools.ts`
  - `IPC message: tools/execute` → {tool, parameters, permission} → {output, executedAt, auditId}
  - Flow:
    1. Check permission grant (required scope must be active, not expired)
    2. Log execution request to audit log (audit_log entry: TOOL_EXECUTION_START)
    3. Invoke tool via Windows Sandbox Executor
    4. Capture output + exit code + duration
    5. Log execution result to audit log (TOOL_EXECUTION_END with outcome, output summary)
    6. Return to client
  - Error handling: Permission denied → 403; tool not found → 404; execution timeout → 504
  - Unit tests: Call with permission granted/denied; verify audit logging

- [ ] T063 [P] [US3] Implement ToolExecutionRecord entity in `apps/springboard-backend/src/models/tool-execution-record.ts`
  - Properties: id (UUID), tool, parameters (JSON, user-visible), permission (scope used), result (output text, exit code), executedAt, userApproved (boolean), auditEntryId
  - Relationships: Related to AuditLogEntry (1-to-1); may be mentioned in Message (if assistant ran tool)
  - Storage: SQLCipher tool_executions table (for audit + history)
  - Methods: `toJSON()`, `toAuditData()`, `isSensitiveOutput() → boolean` (contains paths, passwords, etc.; mask in UI)

- [ ] T064 [P] [US3] Run penetration tests for sandbox escape in `apps/springboard-backend/tests/security/sandbox-penetration.test.ts`
  - Test: Attempt relative path escape (`cd /root` from container) → blocked by mount restrictions
  - Test: Attempt symlink escape → blocked
  - Test: Attempt container breakout commands (Windows Sandbox (WSB), privileged escalation) → not allowed by shell whitelist
  - Test: File write outside mount → Windows Sandbox (WSB) layer permissions prevent
  - Result: All escapes logged to audit; no successful breaks
  - Automation: Run tests in CI pipeline

### Tool Permissions & Settings

- [ ] T065 [US3] Create tool settings Vue component in `apps/springboard-desktop/src/components/ToolSettingsPanel.vue`
  - Displays: Accordion sections for each tool (filesystem, shell, browser, document-reader) with controls
  - Per-tool config: 
    - **filesystem**: radio button (read-only / read-write); path list (add/remove directories)
    - **shell**: toggle for enable; optional command whitelist (textarea)
    - **browser**: toggle for enable; optional URL whitelist (textarea)
    - **document-reader**: toggle for enable; file type checkboxes (PDF, DOCX, XLSX, TXT)
  - State: Pinia store (toolSettings, isDirty)
  - Save: Dispatch action to persist to config file
  - Reload: Config change applies immediately via config watcher
  - Components: PrimeVue Accordion, Toggle, InputText, CheckboxGroup
  - Unit tests: Modify settings → verify store action dispatched; reload → settings persist

- [ ] T066 [P] [US3] Create tool execution history Vue component in `apps/springboard-desktop/src/pages/ToolExecutionHistory.vue`
  - Route: /tools/history
  - Displays: DataTable of recent tool executions (tool, command, permission, duration, exitCode, timestamp)
  - State: Pinia store (executionRecords[], filters)
  - Filter: By tool type; by success/failure
  - Details: Click row → expanded view shows full output (truncated if >1000 chars)
  - Audit link: Link to corresponding audit log entry
  - Styling: Tailwind; syntax highlighting for commands/output
  - Unit tests: Render history → mock data; filter actions → tablerows filtered

### Tool Execution Testing

- [ ] T067 [US3] Create contract tests for Windows Sandbox (WSB) API in `apps/springboard-backend/tests/contracts/Windows Sandbox (WSB)-executor.test.ts`
  - Test: Start container → execute echo command → output captured
  - Test: Command timeout after 30s → container stopped + 504 error returned
  - Test: Invalid mount path → Windows Sandbox (WSB) error; logged to audit
  - Test: Container resource limits → memory-hogging process killed
  - Coverage: Happy path + timeout + error cases

- [ ] T068 [P] [US3] Create integration test for tool execution flow in `apps/springboard-backend/tests/integration/tool-execution-flow.test.ts`
  - Test: User asks "List my Documents folder" → assistant invokes filesystem-read permission dialog → user grants → Windows Sandbox (WSB) executes `ls /mnt/documents` → output returned
  - Test: Second request for same tool → no permission dialog (permission still active)
  - Test: Revoke filesystem-read → next request shows dialog again
  - Test: Disabled tool (shell) → invocation blocked + error message
  - Workflow: 5 tool requests, 2 permission dialogs (first ask, after revoke)

### Deliverables for US3

- ✅ **Code**: Windows Sandbox Executor, Windows Sandbox (WSB) manager, tool implementations (filesystem, shell, browser, document reader), tool registry, execution endpoint
- ✅ **Tests**: Unit + contract + integration + penetration tests (>80% coverage)
- ✅ **Windows Sandbox (WSB)**: `Windows Sandbox (WSB)file` + build script; tool image published locally
- ✅ **Security**: Penetration tests verify sandbox cannot be escaped
- ✅ **UI**: Tool settings panel + execution history page
- ✅ **Demo**: File listing + shell command demo script in `scripts/demo-us3.sh`

---

## Phase 6: User Story 4 - Skill Management and Configuration (P4)

**User Goal**: User installs new skills, edits SOUL/AGENTS/USER config files, and manages permissions per skill

**Independent Test Criteria**:
- ✅ Skill manifest installed from folder → appears in skill list
- ✅ Skill manifest validated for required fields (id, name, version, required_permissions, entrypoint)
- ✅ Skill permissions enforced → skill invoked without required permission → blocked + error
- ✅ SOUL/AGENTS/USER.md edited via UI or filesystem → changes applied without app restart
- ✅ Skill uninstall removes all files and configuration; no orphaned data

### Skill Infrastructure

- [ ] T069 [US4] Implement Skill entity in `apps/springboard-backend/src/models/skill.ts`
  - Properties per data-model.md: id, name, description, version, author, enabled, installedAt, updatedAt, manifestPath, requiredPermissions, configSchema, config, metadata
  - Validation: id lowercase alphanumeric + hyphens; version semver; permissions in registry
  - Methods: `enable()`, `disable()`, `updateConfig(newConfig)`, `toJSON()`, `validateManifest()`
  - Storage: SQLCipher skills table + manifest files on filesystem

- [ ] T070 [P] [US4] Implement skill repository in `apps/springboard-backend/src/repositories/skill-repository.ts`
  - Methods: `install(manifestPath) → Skill`, `uninstall(skillId)`, `getById(skillId)`, `listInstalled()`, `listEnabled()`, `updateConfig(skillId, config)`, `enable(skillId)`, `disable(skillId)`
  - File operations: Copy manifest + skill code from staging → `%APPDATA%/SpringBoard/skills/` (organized by core vs. user skills)
  - Audit: Log install/uninstall events
  - Unit tests: Install → verify in list; uninstall → verify removed

- [ ] T071 [P] [US4] Implement skill manifest validator in `apps/springboard-backend/src/services/skill-validator.ts`
  - Purpose: Validate skill.yaml/json manifest against schema
  - Required fields: id, name, description, version, author, required_permissions, entrypoint
  - Optional fields: config_schema, metadata, dependencies
  - Validation:
    - id: non-empty, lowercase alphanumeric + hyphens, <50 chars
    - version: semver format
    - permission: all perms in canonical registry
    - config_schema: valid JSON Schema
  - Error messages: User-friendly (e.g., "Invalid version format; expected semver, got 'foo'")
  - Unit tests: Valid manifest passes; invalid fails with clear error

- [ ] T072 [P] [US4] Implement skill installer endpoint in `apps/springboard-backend/src/routes/skills.ts`
  - `IPC message: skills/install` → {manifestPath: string} → {skillId, name, version, requiredPermissions} (if successful), error message (if validation fails)
  - Flow:
    1. Validate manifest at provided path
    2. Check for conflicts (skill with same id already installed)
    3. Copy skill files to `%APPDATA%/SpringBoard/skills/`
    4. Index in SQLCipher
    5. Log skill install event to audit log
    6. Return skill metadata
  - Error handling: Validation error → 400 + clear message; conflict → 409; file not found → 404
  - Unit tests: Valid install → skill in list; conflict → error; invalid manifest → error

- [ ] T073 [P] [US4] Implement skill uninstaller endpoint in `apps/springboard-backend/src/routes/skills.ts`
  - `IPC message: skills/:skillId` → {success: boolean}
  - Flow:
    1. Check skill exists + is disabled (cannot delete enabled skill)
    2. Delete all files from `%APPDATA%/SpringBoard/skills/`
    3. Delete from SQLCipher
    4. Log skill uninstall event to audit log
    5. Return confirmation
  - Error handling: Skill not found → 404; skill enabled → 409 (disable first); permission denied → 403
  - Unit tests: Delete installed skill → removed from list; attempt delete enabled skill → error

- [ ] T074 [P] [US4] Implement skill execution service in `apps/springboard-backend/src/services/skill-executor.ts`
  - Purpose: Validate + invoke skill entrypoint
  - Methods: `execute(skillId, parameters) → Promise<{output, metadata}>`
  - Flow:
    1. Check permission grants (skill.requiredPermissions all active?)
    2. Check skill enabled
    3. Require user approval for certain high-risk skills (shell-related, write access)
    4. Load skill entrypoint module (Node.js require or Python import)
    5. Execute with parameters + context (conversation, audit logger, permission validator)
    6. Log skill execution result to audit log
    7. Return output
  - Error handling: Skill disabled → error; permission missing → error; execution error → return skill error message
  - Unit tests: Execute enabled skill with permissions → output returned; missing permission → error; disabled skill → error

### Configuration Management (SOUL/AGENTS/USER.md)

- [ ] T075 [US4] Create SOUL.md schema & default config in `apps/springboard-backend/src/config/soul-schema.json`
  - Fields: personality (tone: helpful|formal|casual), proactivity (high|medium|low), response_style (concise|detailed), preferred_model (model name), hybrid_enabled (boolean, future)
  - Example:
    ```yaml
    ---
    personality: helpful
    tone: professional
    proactivity: medium
    response_style: detailed
    preferred_model: mistral-7b
    hybrid_enabled: false
    ---
    I am SpringBoard, your workplace AI assistant...
    ```
  - Validation: JSON Schema validation per fields

- [ ] T076 [P] [US4] Create AGENTS.md schema & default config in `apps/springboard-backend/src/config/agents-schema.json`
  - Fields: agent_list (array of {id, name, description, skills, routing_rule}), orchestration_rules, fallback_agent
  - Example:
    ```yaml
    ---
    default_agent: office-productivity
    agents:
      - id: office-productivity
        name: Office Productivity Assistant
        skills: [calendar-briefing, email-reply-draft, document-summarizer]
        routing_rule: "query CONTAINS ('calendar' OR 'email' OR 'document')"
    ---
    ```
  - Validation: Each skill referenced must exist + be installed

- [ ] T077 [P] [US4] Create USER.md schema & default config in `apps/springboard-backend/src/config/user-schema.json`
  - Fields: working_hours (start, end time), notification_preferences, default_approval (approve_high_risk_tools: true|false), language
  - Example:
    ```yaml
    ---
    working_hours:
      start: "09:00"
      end: "17:00"
    language: en-US
    default_approval: false
    notification_preferences:
      email: true
      desktop: true
    ---
    ```

- [ ] T078 [US4] Create config file editor Vue component in `apps/springboard-desktop/src/components/ConfigEditor.vue`
  - Purpose: Edit SOUL.md, AGENTS.md, USER.md in UI (form-based for non-technical users)
  - UI: Tabs per config file (SOUL | AGENTS | USER)
  - Form fields: Dynamic based on schema (PrimeVue InputText, Dropdown, Toggle, etc.)
  - Raw editor: Secondary tab for power users to edit YAML directly (textarea with syntax validation)
  - State: Pinia store (currentConfig, isDirty, validationErrors)
  - Save: Dispatch store action → trigger server-side watcher → verify reload successful
  - Validation: Client-side (Vue validation) + server-side (on load)
  - Unit tests: Edit config → save → verify store action dispatched; invalid config → error message

- [ ] T079 [P] [US4] Create config hot reload UI indicator Vue component in `apps/springboard-desktop/src/components/ConfigReloadIndicator.vue`
  - Purpose: Show config reload status (loading, success, error)
  - State: Pinia store (reloadStatus, reloadMessage, lastReloadTime)
  - Timing: Appears when config file modified; dismisses after 5s if success
  - Error: If reload fails, show error message + [Retry] button
  - Components: PrimeVue Toast or Badge pattern
  - Integration: Watch store state for config reload events
  - Unit tests: Mount component → simulate store mutations → status updates

### Skill Management UI

- [ ] T080 [US4] Create skill manager page Vue component in `apps/springboard-desktop/src/pages/SkillManagerPage.vue`
  - Route: /skills
  - Displays: DataTable of installed skills (Skill | Version | Status | Permissions | Options)
  - Skill row shows: Icon + name, version, enabled/disabled toggle, required permissions list (icons), [Configure] [Uninstall]
  - Install button: "Install Skill..." → file dialog → choose manifest folder → install
  - State: Pinia store (installedSkills[], searchQuery, selectedSkill)
  - Search: Filter skill list by name/keyword
  - Details pane: Click skill → shows in sidebar with full details (description, author, config options, dependency list)
  - Components: PrimeVue DataTable, Toggle, Button
  - Unit tests: Mount page → render skill list; click skill → details display; install triggers file dialog

- [ ] T081 [P] [US4] Create skill configuration panel Vue component in `apps/springboard-desktop/src/components/SkillConfigPanel.vue`
  - Purpose: Edit per-skill configuration (based on skill's `config_schema`)
  - UI: Dynamic form fields generated from JSON Schema (text, select, toggle, etc. via PrimeVue)
  - State: Pinia store (skillConfig, isDirty, validationErrors)
  - Save: Dispatch store action → IPC message: skills/:skillId/config
  - Validation: Client-side (JSON Schema validation) + server-side (schema enforcement)
  - Components: PrimeVue InputText, Dropdown, Toggle, Button
  - Unit tests: Mount for skill with sample schema → modify field → verify store action dispatched

### Skill Execution & Permissions

- [ ] T082 [US4] Create skill execution endpoint in `apps/springboard-backend/src/routes/skills.ts` (merged with T072)
  - `IPC message: skills/:skillId/execute` → {parameters: object} → {output, metadata, auditId}
  - Flow:
    1. Check skill exists + enabled
    2. Check all required permissions (if any missing, return 403 + permission required error)
    3. For high-risk skills: request user approval + log to audit
    4. Execute skill entrypoint
    5. Log skill execution to audit log
    6. Return output
  - Error handling: Permission denied → 403; skill not found → 404; execution error → 500 + error message
  - Unit tests: Execute with permissions → success; missing permission → 403; execution error → 500

- [ ] T083 [P] [US4] Implement skill test harness in `apps/springboard-backend/tests/skills/skill-test-harness.ts`
  - Purpose: Test harness to execute skills with mocked services
  - Provides: Mock LLM service, mock Graph API, mock Windows Sandbox Executor, test database, mock permission validator
  - Usage: Test skills call correct APIs; handle errors; return expected output format
  - Example test:
    ```typescript
    const harness = createSkillTestHarness();
    const output = await harness.executeSkill('calendar-briefing', {});
    expect(output.summary).toBeTruthy();
    ```

### Configuration Testing

- [ ] T084 [US4] Create unit tests for config services in `apps/springboard-backend/tests/services/config-service.test.ts`
  - Test: Load valid SOUL.md → config object created
  - Test: Load invalid YAML syntax → error with line number
  - Test: Load file with missing required field → error message
  - Test: Apply config changes → validation passes
  - Coverage: >90% of config parsing logic

- [ ] T085 [P] [US4] Create integration test for skill installation flow in `apps/springboard-backend/tests/integration/skill-installation-flow.test.ts`
  - Test: Create sample skill manifest → IPC message: skills/install → skill appears in list
  - Test: Configure skill parameters → IPC message: skills/:skillId/config → settings persisted
  - Test: Execute skill with required permissions → skill invoked successfully
  - Test: Revoke required permission → next execution returns permission error
  - Test: Uninstall skill → no longer in list
  - Workflow: Install → configure → execute (multiple times) → revoke permission → error → uninstall

- [ ] T086 [P] [US4] Create integration test for config hot reload in `apps/springboard-backend/tests/integration/config-reload-flow.test.ts`
  - Test: Modify SOUL.md file → config watcher detects → service reloads → new config in effect
  - Test: Invalid SOUL.md syntax → error logged; previous config retained
  - Test: Modify AGENTS.md → new agent list available
  - Test: Reload <500ms latency (measured)

### Deliverables for US4

- ✅ **Code**: Skill entity, repository, validator, installer/uninstaller, executor, config services (SOUL/AGENTS/USER), config editor, skill manager UI
- ✅ **Tests**: Unit + integration tests for all skill/config operations (>85% coverage)
- ✅ **UI**: Skill manager page, config editor (form + raw), config reload indicator
- ✅ **Schemas**: JSON Schema files for SOUL/AGENTS/USER manifest validation
- ✅ **Demo**: Skill install + execute + config change demo script in `scripts/demo-us4.sh`

---

## Phase 7: User Story 5 - Proactive Heartbeat Scheduling (P5)

**User Goal**: User configures morning briefing task → at 9 AM each day, assistant proactively runs and displays calendar summary

**Independent Test Criteria**:
- ✅ Scheduled task created with cron schedule (e.g., "0 9 * * MON-FRI")
- ✅ At scheduled time (if app running), task executed automatically without user action
- ✅ Task result displayed to user + logged to audit trail
- ✅ If permission required, task uses existing grant (no re-prompting)
- ✅ Failed task logged with error; not blocking to app

### Scheduled Task Infrastructure

- [ ] T087 [US5] Implement ScheduledTask entity in `apps/springboard-backend/src/models/scheduled-task.ts`
  - Properties per data-model.md: id, name, description, skillId, schedule (cron), enabled, requiredPermissions, createdAt, lastExecutedAt, nextScheduledAt, executionTimeoutSeconds, metadata (JSON)
  - Validation: schedule valid cron expression (5–6 field format)
  - Methods: `calculateNextRun(from) → Date`, `isReadyToRun(now) → boolean`, `toJSON()`, `fromManifest(manifest)`
  - State machine: Scheduled → Ready → Running → Completed (or Failed)
  - Unit tests: Create task → calculate next run → verify cron parsed correctly

- [ ] T088 [P] [US5] Implement scheduled task repository in `apps/springboard-backend/src/repositories/scheduled-task-repository.ts`
  - Methods: `create(task)`, `getById(id)`, `listAll()`, `listEnabled()`, `update(id, fields)`, `delete(id)`, `markExecuted(id, result)`
  - Database: SQLCipher scheduled_tasks table
  - Queries: Find next task(s) due within N minutes
  - Unit tests: Create → list → update next run time → verify database consistency

- [ ] T089 [P] [US5] Implement task scheduler service in `apps/springboard-backend/src/services/scheduler-service.ts`
  - Purpose: Poll for tasks due; execute them; handle results
  - Methods: `startScheduler()`, `stopScheduler()`, `trigger(skillId)` (manual trigger)
  - Logic:
    1. Query database for enabled tasks
    2. Check if any task.nextScheduledAt <= now + 2-minute grace window
    3. If yes, execute task via skill executor
    4. Log execution (start + result)
    5. Update nextScheduledAt based on cron expression
    6. Handle errors gracefully (log + continue)
  - Inference-conscious policy: Run deterministic pre-check steps (data fetch/filter/threshold checks) before calling LLM; skip LLM call when pre-check finds no actionable content
  - Polling interval: Every 1 minute (for tasks due within 2-minute window)
  - Resource management: Single scheduler instance; queue for concurrent task execution (max 5 concurrent)
  - Unit tests: Schedule task → mock time → trigger → verify execution logged; verify no LLM call when pre-check returns no new data

- [ ] T090 [US5] Implement scheduled task execution in `apps/springboard-backend/src/services/scheduler-service.ts` (merged with T089)
  - Flow:
    1. Check task enabled + permissions all granted
    2. Run deterministic pre-check automation (fetch inputs, detect deltas, validate thresholds)
    3. Log execution start (SCHEDULED_TASK_START audit event)
    4. Execute LLM step only if pre-check indicates summarization/reasoning is needed
    5. Capture result + duration
    6. Update task.lastExecutedAt + calculate nextScheduledAt
    7. Log execution end (SCHEDULED_TASK_END audit event with outcome and inferenceInvoked flag)
    8. If failed: Log error; don't retry (user can manually trigger or reschedule)
  - Error handling: Permission missing → skip + log; execution timeout → kill + log; skill error → return error message
  - Notification: For certain high-impact tasks (morning briefing), notify user of result
  - Unit tests: Execute enabled task with delta → LLM invoked; execute with no delta → LLM skipped; failed execution → error logged

### Heartbeat UI

- [ ] T091 [US5] Create scheduled tasks page Vue component in `apps/springboard-desktop/src/pages/ScheduledTasksPage.vue`
  - Route: /tasks
  - Displays: DataTable of scheduled tasks (Name | Schedule | Status | Last Run | Next Run | Options)
  - Create button: "Add Task..." → form dialog (step 1: select skill, step 2: set cron schedule, step 3: review + save)
  - Edit: Click task → edit form (change schedule, disable/enable)
  - Delete: [Delete] button (requires confirmation)
  - Test: [Run Now] button to manually trigger task
  - Details: Click task → expanded view shows execution history (last 10 runs)
  - State: Pinia store (scheduledTasks[], selectedTask, filters)
  - Components: ScheduledTaskForm (dialog), PrimeVue DataTable
  - Styling: Tailwind + PrimeVue; cron schedule shown in human-readable form (e.g., "Every weekday at 9:00 AM")
  - Unit tests: Render page → create task → verify in store; edit → changes persisted

- [ ] T092 [P] [US5] Create scheduled task form Vue component in `apps/springboard-desktop/src/components/ScheduledTaskForm.vue`
  - Purpose: Create/edit scheduled task with user-friendly UX (multi-step form)
  - Step 1 (Skill selection): Dropdown of installed skills that support scheduling
  - Step 2 (Schedule): 
    - Radio buttons: Predefined (Daily, Weekdays, Weekly) OR Custom cron
    - Time picker: Hour + minute (9:00, 14:30, etc.)
    - Optional: Advanced cron editor (raw cron expression)
  - Step 3 (Review): Summary (Skill name, schedule, next 3 run times calculated)
  - State: Pinia store (formData, cronValidation, step index)
  - Save: Dispatch store action → IPC message: scheduled-tasks
  - Validation: Client-side (cron syntax validator); server-side (permissions check)
  - Components: PrimeVue Stepper, Dropdown, InputText, Dialog
  - Unit tests: Mount form → fill steps → save → store action dispatched with correct payload

- [ ] T093 [P] [US5] Create task execution history Vue component in `apps/springboard-desktop/src/components/TaskExecutionHistory.vue`
  - Displays: DataTable of last 20 executions (Timestamp | Duration | Status | Output)
  - State: Pinia store (executionHistory[], filters)
  - Status indicators: Success (green badge), Failed (red badge), Skipped (gray badge)
  - Click row: Expanded row shows full result output + link to audit log entry
  - Filter: By status; by date range (reactive)
  - Components: PrimeVue DataTable, Badge, Button
  - Unit tests: Mount component → render mock execution data; filter → rows update correctly

### Scheduled Task API

- [ ] T094 [US5] Implement scheduled tasks endpoints in `apps/springboard-backend/src/routes/scheduled-tasks.ts`
  - `IPC message: scheduled-tasks` → list all enabled tasks (summary view)
  - `IPC message: scheduled-tasks` → {skillId, schedule, name, timeout} → create task
  - `IPC message: scheduled-tasks/:id` → get full task details + execution history
  - `IPC message: scheduled-tasks/:id` → {schedule, enabled, ...} → update task
  - `IPC message: scheduled-tasks/:id` → delete task
  - `IPC message: scheduled-tasks/:id/execute` → trigger manually (returns execution result)
  - `IPC message: scheduled-tasks/:id/executions` → list recent executions (paginated, limit 50)
  - Error handling: Task not found → 404; validation error → 400; permission error → 403
  - Unit tests: CRUD operations; manual execute; list executions

### Notification System

- [ ] T095 [US5] Implement notification service in `apps/springboard-backend/src/services/notification-service.ts`
  - Purpose: Notify user of scheduled task completion (esp. morning briefing)
  - Methods: `notifyTaskComplete(task, result)`, `notifyTaskFailed(task, error)`
  - Channels: Desktop toast notification via Electron IPC + audit log entry
  - Filtering: Check task metadata for `notify_on_complete` flag (default true for briefing tasks)
  - Timeout: Toast disappears after 5s or user dismissal
  - Unit tests: Send notification → IPC message generated; filtered correctly

### Scheduling Testing

- [ ] T096 [US5] Create unit tests for scheduler service in `apps/springboard-backend/tests/services/scheduler-service.test.ts`
  - Test: Create task with cron "0 9 * * *" → nextScheduledAt calculated correctly
  - Test: Run scheduler at 8:58 AM → no execution (not yet due)
  - Test: Run scheduler at 9:05 AM → task executed + logged
  - Test: Execute task with missing permission → error logged; task not executed
  - Test: Execute task timeout → kill after 30s + log timeout error
  - Coverage: >90% of scheduler logic

- [ ] T097 [P] [US5] Create integration test for heartbeat flow in `apps/springboard-backend/tests/integration/heartbeat-flow.test.ts`
  - Test: Create morning briefing task (9 AM weekdays) → scheduler running
  - Test: Advance time to 9:05 AM → task triggered
  - Test: Verify task execution logged to audit trail + result displayed in UI
  - Test: Verify permissions still granted (no re-prompting)
  - Test: Manual trigger via [Run Now] button → task executed immediately
  - Test: Disable task → scheduler skips next run
  - Workflow: Create → auto-execute → verify audit → revoke permission → manual execute → permission error

### Deliverables for US5

- ✅ **Code**: ScheduledTask entity, repository, scheduler service, notification service, CRUD endpoints, execution logic
- ✅ **Tests**: Unit + integration tests for scheduling (>80% coverage)
- ✅ **UI**: Scheduled tasks page, task form (multi-step), execution history
- ✅ **Audit**: All task executions logged with results
- ✅ **Demo**: Create + auto-execute scheduled task demo script in `scripts/demo-us5.sh`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Integration testing, security hardening, performance optimization, documentation, release preparation

### Integration & End-to-End Testing

- [ ] T098 Create end-to-end test suite in `apps/springboard-backend/tests/e2e/`
  - Test: Full workflow (login → chat → Office integration → tool execution → skill → scheduled task)
  - Setup: Spin up Electron + backend + test database + mock servers
  - Scenario: 
    1. User opens app (5s startup)
    2. Send chat message (get response in <2s)
    3. Ask for calendar events (permission dialog → grant)
    4. Execute filesystem read tool (permission → allow)
    5. Install skill + configure it
    6. Set up morning briefing task
    7. Verify all actions audited
  - Measurement: Request latencies, error rates, encryption validation
  - Duration: ~10 min per run
  - CI: Run daily nightly (slower than unit tests)

- [ ] T099 [P] Create cross-browser/platform testing plan in `docs/TESTING.md`
  - Target platforms: Windows 10 (build 21H2), Windows 11 (latest)
  - Matrix: With Windows Sandbox (WSB) Desktop; with Windows Sandbox (WSB) in Linux; fallback (Windows Sandbox)
  - Test matrix: Dev machine (4090) + minimal machine (8GB RAM, integrated GPU)
  - Performance baselines: Script startup <3s, first chat <2s, tool execution <5s
  - Sign-off: Test on 2–3 distinct hardware configurations before release

### Security Hardening & Audit

- [ ] T100 [P] Conduct security audit in `docs/SECURITY_AUDIT.md`
  - Threat model review: Verify 5 principle threats mitigated (data exfiltration, privilege escalation, tool abuse, malicious skills, token theft)
  - Penetration testing: Sandbox escape test, auth bypass test, permission boundary test
  - Code review: Security-critical paths (encryption, permission validation, audit logging)
  - Dependencies: Run `npm audit` + `pip audit`; document findings + remediation
  - Compliance: OWASP Top 10 + Microsoft Secure SDLC checks
  - Sign-off: Security owner approval before release

- [ ] T101 [P] Implement security logging enhancement in `apps/springboard-backend/src/services/audit-logger.ts` (merged with T017)
  - Add event logging for: Auth failure (wrong password, token expiration), permission check failure (missing scope), tool escape attempt, config file tampering detected
  - Event payloads: Include user identity, resource, action, outcome, error details
  - Retention: Ensure 90-day retention + backup (for compliance restoration)
  - Unit tests: Verify security events logged + not truncated

### Performance Optimization

- [ ] T102 Implement caching layer for frequent queries in `apps/springboard-backend/src/lib/cache-service.ts`
  - Cache: Permission grants (1 min TTL), installed skills (5 min TTL), configuration (10 min TTL)
  - Invalidation: On grant/revoke → clear permission cache; on skill update → clear skill cache; on config save → clear config cache
  - Memory management: In-memory cache with size limits (max 1000 entries); evict oldest on overflow
  - Metrics: Cache hit rate (log % of cached vs. fresh queries)
  - Unit tests: Set cache → retrieve → verify TTL expiration → refresh on miss

- [ ] T103 [P] Optimize database queries in `apps/springboard-backend/src/db/`
  - Profile: Identify slow queries (>100ms) via structured logging
  - Indexes: Verify indexes on filtered columns (user_principal_name, conversation_id, created_at)
  - Pagination: All list endpoints return paginated results (default 100); avoid loading 10K+ rows at once
  - Lazy loading: Load messagest-count for conversations lazily (don't JOIN on large tables)
  - Metrics: Log query duration; alert if any >500ms
  - Unit tests: Verify pagination; no N+1 queries

- [ ] T104 [P] Optimize Vue 3 + Vite rendering performance in `apps/springboard-desktop/src/components/`
  - Vue 3 optimization: Use `<script setup>` syntax throughout; reactive() for store state; lazy component loading with defineAsyncComponent()
  - Component library: Lazy-load PrimeVue components only when needed (dynamic imports)
  - Build optimization: Analyze bundle with vite-visualizer plugin; tree-shake unused code; minify templates
  - List rendering: Use vue-virtual-scroller or PrimeVue VirtualScroller for large message lists (50+ items)
  - Vite dev mode: Ensure HMR works efficiently; no full-page reloads
  - Testing: Render 1000-message list → measure scroll FPS (target: 60 FPS on Surface Laptop)
  - Metrics: Monitor bundle size, Time to Interactive (TTI), First Contentful Paint (FCP)
  - Unit tests: Virtual list doesn't render all items upfront; lazy components load on demand

### Documentation & Knowledge Base

- [ ] T105 [P] Create comprehensive API documentation in `docs/API.md`
  - Includes: All endpoints + request/response schemas + error codes
  - Format: OpenAPI/Swagger YAML (auto-generated via comment annotations)
  - Deployment: Host at `Electron Main IPC/docs` via Swagger UI
  - Tools: Generate from jsdoc comments in route files

- [ ] T106 [P] Create developer quickstart guide in `DEVELOPMENT.md` (root)
  - Covers: Prerequisites (Node 20, Python 3.11, Windows Sandbox (WSB), Windows Sandbox (WSB)), environment setup, npm/pip install, running tests, building, debugging
  - Scripts: `npm run dev` (start all services), `npm run test` (run tests), `npm run build` (compile for packaging)
  - Troubleshooting: Common issues (Windows Sandbox (WSB) not running, Azure OpenAI / AI Inference Engine not responding, permission errors)

- [ ] T107 [P] Create operator & deployment guide in `docs/DEPLOYMENT.md`
  - Covers: Production packaging (NSIS installer for Windows), configuration (Entra ID setup, Azure OpenAI for future), audit log backup strategy, security hardening (Windows Defender, UAC)
  - Provides: Installers for different hardware configurations (standard, minimal, GPU-accelerated)

- [ ] T108 [P] Update and finalize ARCHITECTURE.md with complete system design
  - Includes: Deployment diagram (Windows host → Windows Sandbox (WSB) → Windows Sandboxs), sequence diagrams (chat flow, Office integration, tool execution, permission grant), component interactions, data flow for each user story

### Release & Packaging

- [ ] T109 Create Windows installer (NSIS) in `installers/springboard-installer.nsi`
  - Includes: Electron app, Node backend, Python services, required C++ runtime, VS Code (optional)
  - Installs to: `Program Files\SpringBoard\` or `%LOCALAPPDATA%\SpringBoard\` (per-user install preferred)
  - Config: Creates `%APPDATA%\SpringBoard\` directory structure
  - Uninstall: Clean removal (delete AppData folder with option to keep user data)
  - Signing: Code signing certificate for Windows SmartScreen trust
  - Size: Target <500MB (app + runtime)

- [ ] T110 [P] Create GitHub release checklist in `docs/RELEASE_CHECKLIST.md`
  - Pre-release: All tests passing, security audit complete, performance baselines met, documentation updated
  - Release: Tag commit, create GitHub Release, publish installer, publish npm packages (@springboard/contracts, etc.)
  - Post-release: Announce via email, update website, monitor error reporting

- [ ] T111 [P] Set up automated CI/CD pipeline in `.github/workflows/`
  - Build: `npm run build` on every push to main + PRs
  - Test: `npm run test` (unit), `npm run test:contract` (contract), `npm run test:e2e` (nightly)
  - Security: `npm audit` + dependency scanning (Dependabot)
  - Release: Automated installer build + publish on git tag
  - Status: Pass gates before merge (build, test, lint, security)

### Final Testing & Validation

- [ ] T112 Bug fixespass final QA testing in `tests/qa/final-qa.md`
  - Workflow validation: Run all 5 user story demo scripts (T113-T117) sequentially
  - Edge case validation: Corrupted DB recovery, network failure resilience, Office unavailable fallback
  - Performance: Measure on reference hardware (8GB RAM, i7 CPU, SSD); ensure <3s startup, <2s chat response
  - Security: Verify audit logs capture all events; sandbox cannot be escaped
  - Sign-off: QA lead approval before release

- [ ] T113 [P] Create demo script for US1 in `scripts/demo-us1.sh`
  - Steps: (1) Launch app, (2) send 5 messages, (3) close app, (4) reopen, (5) verify history restored
  - Validation: No network calls logged; messages decrypted correctly

- [ ] T114 [P] Create demo script for US2 in `scripts/demo-us2.sh`
  - Steps: (1) Send "Check calendar" request, (2) permission dialog appears, (3) grant, (4) calendar fetched, (5) revoke permission, (6) next request shows dialog again
  - Validation: Calendar events displayed; Office access audited

- [ ] T115 [P] Create demo script for US3 in `scripts/demo-us3.sh`
  - Steps: (1) Send "List Documents folder", (2) permission dialog, (3) grant, (4) Windows Sandbox executes `ls`, (5) output returned
  - Validation: Container executed in Windows Sandbox (WSB); filesystem escape blocked

- [ ] T116 [P] Create demo script for US4 in `scripts/demo-us4.sh`
  - Steps: (1) Install sample skill, (2) configure skill parameters, (3) execute skill, (4) edit SOUL.md, (5) verify config hot-reloaded
  - Validation: Skill installed; config changes apply without restart

- [ ] T117 [P] Create demo script for US5 in `scripts/demo-us5.sh`
  - Steps: (1) Create morning briefing task (9 AM), (2) advance time, (3) task executes, (4) result displayed, (5) disable task
  - Validation: Task executes at scheduled time; permissions still grant; no re-prompting

### Documentation Completion

- [ ] T118 [P] Write SECURITY.md overview in `docs/SECURITY.md`
  - Covers: Threat model, data encryption strategy, permission model, sandboxing approach, audit trail, compliance (SOC 2, HIPAA)
  - Sign-off: Security owner approval

- [ ] T119 [P] Write FAQ in `docs/FAQ.md`
  - Common questions: How to install skills? How to edit SOUL.md? What data is collected? Does it work offline? How is data encrypted?
  - Troubleshooting: Azure OpenAI / AI Inference Engine not responding, Windows Sandbox (WSB) not available, Office integration failing, permission dialogs not showing

- [ ] T120 [P] Write constitutionAlignment document in `docs/CONSTITUTION_ALIGNMENT.md`
  - Verifies: All 5 principles honored in implementation (Microsoft-First, CLI-First, Test-First, Integration Testing, Observability)
  - References: Where each principle validated (tests, code, architecture decisions)
  - Sign-off: Engineering owner approval

- [ ] T121 [P] Validate performance success criteria in `tests/performance/performance-validation.test.ts`
  - Validate SC-001: Install to first conversation <5 minutes (end-to-end timing)
  - Validate SC-002: Chat response <2s perceived time (Azure OpenAI / AI Inference Engine mock, measure UI update)
  - Validate SC-003: App startup <3s (measure main process to ready-to-chat)
  - Validate SC-004: History load <1s for 500+ messages (populate test DB, measure query + render)
  - Validate SC-019: Entra ID (MSAL)/SSO auth <10s (mock Entra ID, measure token acquisition)
  - Validate SC-020: 1000+ messages handled without degradation (stress test conversation DB)
  - Hardware: Test on reference hardware (Windows Surface Laptop spec) and baseline (4090 dev machine)
  - Report: Generate performance baseline report for release checklist

- [ ] T122 [P] Validate network traffic and data residency in `tests/security/network-monitoring.test.ts`
  - Validate SC-005: Zero conversation data leaves local machine during normal operation
  - Method: Use Wireshark/tcpdump to capture all network traffic during test scenarios
  - Test scenarios: (1) Chat with Azure OpenAI / AI Inference Engine, (2) Permission grant, (3) Tool execution, (4) Config reload
  - Assertions: No HTTP/HTTPS requests to external domains except Graph API (when Office permission granted)
  - Validate: Azure OpenAI / AI Inference Engine traffic stays inference endpoint, no telemetry to external services
  - Report: Network traffic audit for security review (T100)

---

## Summary & Task Statistics

**Total Tasks**: 122  
**Organized by phase**:
- Phase 1 (Setup): 8 tasks (T001-T008)
- Phase 2 (Foundational): 17 tasks (T009-T025)
- Phase 3 (US1 - Local Chat): 16 tasks (T026-T041)
- Phase 4 (US2 - Office): 12 tasks (T042-T053)
- Phase 5 (US3 - Sandboxing): 15 tasks (T054-T068)
- Phase 6 (US4 - Skills): 18 tasks (T069-T086)
- Phase 7 (US5 - Scheduling): 11 tasks (T087-T097)
- Phase 8 (Polish): 25 tasks (T098-T122)

**Parallelizable tasks** (marked [P]): ~60% of tasks can run in parallel (different files, no dependencies)

**MVP scope** (Phase 1 + 2 + 3): Complete secure local chat with persistent history (~40 tasks)

**Execution path**:
1. **Week 1**: Complete Phase 1 (Setup) + Phase 2 (Foundational)
2. **Week 2-3**: Complete Phase 3 (US1) in parallel with early Phase 4 tasks
3. **Week 4-5**: Complete Phase 4 (US2) + Phase 5 (US3) in parallel
4. **Week 6-7**: Complete Phase 6 (US4) + Phase 7 (US5) in parallel
5. **Week 8**: Complete Phase 8 (Polish), security audit, documentation, release

**Testing coverage**:
- Unit tests: >85% of backend logic
- Contract tests: All API endpoints validated against specs
- Integration tests: All user story workflows end-to-end
- Security tests: Sandbox escape, privilege escalation, auth boundary
- E2E tests: Full app workflow (nightly CI)

**Dependencies**:
- Phase 2 blocks all user stories
- US1 blocks US2 (Office integration depends on chat foundation)
- US3 can start after Phase 2 + US1
- US4 can start after US1
- US5 depends on US4 (heartbeat invokes skills)

---

## Next Steps

1. **Start Phase 1**: Initialize project structure, configure build tools
2. **Code review**: Get PR review from team for Phase 1/2 scaffolding before starting implementation
3. **Add to GitHub Project**: Link tasks to GitHub issues + kanban board
4. **Weekly standups**: Review completed tasks, remove blockers, adjust estimates as needed
5. **Post-Phase 3**: Conduct code review + security review before moving to US2

