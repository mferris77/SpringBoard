# Sprint Plan: SpringBoard Local-First AI Assistant

**Feature**: SpringBoard Local-First AI Assistant  
**Branch**: `001-local-ai-assistant`  
**Planning Date**: March 3, 2026  
**Total Duration**: 10 sprints (~20 weeks)  
**Input**: spec.md, plan.md, research.md, data-model.md, tasks.md

---

## Sprint Organization Philosophy

**Planning-First Approach**: Each sprint begins with completed specifications. We do NOT start coding until requirements are finalized and reviewed.

**Sprint Structure**:
- **Sprint 0 (Current)**: Planning & Requirements finalization — NO CODE
- **Sprints 1-8**: Implementation sprints with working deliverables
- **Sprint 9**: Integration, security hardening, polish
- **Sprint 10**: Release preparation & documentation

**Cadence**: 2-week sprints (80 hours per sprint, assuming single developer equivalent)

**Definition of Done** (per sprint):
- ✅ All tasks marked complete in tasks.md
- ✅ Tests passing (unit + contract + integration where applicable)
- ✅ Code reviewed + merged to feature branch
- ✅ Demo script working end-to-end
- ✅ Documentation updated

---

## Sprint 0: Planning & Requirements Finalization (Current Sprint)

**Duration**: March 3-14, 2026 (2 weeks)  
**Goal**: Finalize all operational details and requirements before writing code  
**Team Focus**: Requirements analysis, architecture validation, sprint planning

**Guardrail**: No dependency installation or framework scaffolding in Sprint 0. Frontend/bootstrap installation is deferred to Sprint 1 and performed by project owner using `npx create-vite`.

### Objectives

1. **Complete Requirements Analysis**
   - Review all 5 user stories for completeness
   - Validate 46 functional requirements against real-world scenarios
   - Confirm 20 success criteria are measurable
   - Document edge cases missed in initial specification

2. **Architecture Deep Dive**
   - Validate 5 architectural decisions in research.md
   - Confirm tech stack choices (Electron 28+, Node 20, Python 3.11, Azure OpenAI / AI Inference Engine, Windows Sandbox (WSB)/Windows Sandbox (WSB))
   - Review data model (8 entities) for completeness
   - Validate 4 API contracts (permission schema, Azure OpenAI / AI Inference Engine, Windows Sandbox (WSB), audit log)

3. **Security & Compliance Review**
   - Threat model review (data exfiltration, privilege escalation, tool abuse, malicious skills, token theft)
   - Constitution alignment verification (all 5 principles honored)
   - Audit logging strategy validated
   - Permission model validated with security team (if applicable)

4. **Development Environment Setup**
   - Document prerequisites (Node 20, Python 3.11, Windows Sandbox (WSB), Windows Sandbox, Azure OpenAI / AI Inference Engine)
   - Document bootstrap approach and prerequisites only (no install execution in Sprint 0)
   - Define owner-run setup validation checklist for Sprint 1 kickoff
   - Create troubleshooting guide for common setup issues

5. **Sprint Planning**
   - Break 120 tasks into 8 implementation sprints
   - Identify dependencies and critical path
   - Estimate effort per sprint (realistic capacity)
   - Define deliverables and demo scripts per sprint

### Deliverables (Sprint 0)

- ✅ **sprint-plan.md** (this document) - Sprint roadmap with focus areas
- ✅ **DEVELOPMENT.md** - Developer quickstart guide (environment setup, running locally, debugging)
- ✅ **docs/TERMINOLOGY.md** - Canonical glossary for sessions/channels/platforms/models/skills/tasks/scripts
- ✅ **docs/THREAT_MODEL.md** - Security threat analysis and mitigations
- ✅ **scripts/setup-dev-environment.sh** - Automated dev environment setup script
- ✅ **specs/001-local-ai-assistant/sprint-0-review.md** - Final requirements review sign-off document

### Acceptance Criteria (Sprint 0)

- [ ] All 5 user stories reviewed and approved by stakeholders
- [ ] Architecture decisions documented and approved
- [ ] Bootstrap/install approach documented and approved (`npx create-vite` + owner-run setup)
- [ ] Sprint 1-8 plan reviewed and accepted
- [ ] Security threat model reviewed by security owner (Mark Ferris)
- [ ] Constitution alignment verified (all 5 principles PASS)

### Tasks from Master Backlog

No implementation tasks. Focus on documentation and planning validation.

### Exit Criteria

**Before moving to Sprint 1**:
1. Requirements sign-off from stakeholders
2. Development environment validated on target machines
3. Sprint backlog for Sprints 1-3 finalized
4. Technical risks documented with mitigation plans
5. Team capacity confirmed for Sprint 1

---

## Sprint 1: Project Foundation & Infrastructure

**Duration**: 2 weeks  
**Goal**: Establish project structure, build tools, and testing infrastructure  
**Working Software**: N/A (infrastructure sprint)  
**Demo**: Show project structure, run tests, start backend

### Focus Areas

1. **Project Scaffolding**
   - Monorepo structure (apps, services, packages)
   - TypeScript + Vue 3 + Tailwind configuration (Vite dev server, vue-tsc for type checking)
   - Python virtual environment setup
   - Build tools (turbo, Vite, jest)

2. **Database Infrastructure**
   - SQLCipher setup with migration framework
   - Encrypted database wrapper
   - Initial schema for all 8 entities (stubs)

3. **Testing Infrastructure**
   - Jest unit test framework
   - Mock servers (Azure OpenAI / AI Inference Engine, Graph API, Windows Sandbox (WSB) API)
   - Test database utilities
   - CI/CD pipeline (GitHub Actions)

4. **Shared Contracts Package**
   - TypeScript interfaces for 4 API contracts
   - Type generation for permission schema, Azure OpenAI / AI Inference Engine, Windows Sandbox (WSB) API, audit log

### Tasks from Master Backlog

**Phase 1 (Setup)**: T001-T008 (8 tasks)

- T001: Node.js backend structure
- T002: Electron frontend structure
- T003: Python services structure
- T004: [P] Shared contracts package
- T005: [P] Monorepo tooling
- T006: [P] Database infrastructure
- T007: [P] GitHub templates
- T008: [P] Documentation scaffold

### Deliverables

- ✅ Working monorepo with `npm install` succeeding
- ✅ Backend starts with `npm run backend` (stub endpoints)
- ✅ Frontend starts with `npm run dev` (empty Vue 3 app via Vite)
- ✅ Tests run with `npm test` (smoke tests passing)
- ✅ CI/CD pipeline runs on GitHub Actions
- ✅ README.md with quickstart instructions

### Acceptance Criteria

- [ ] `npm install` completes without errors
- [ ] Backend health endpoint responds at `IPC channel health`
- [ ] Frontend renders at `localhost:5173` (Vite dev server)
- [ ] `npm test` runs and passes (at least 1 smoke test)
- [ ] CI/CD pipeline runs on push to feature branch
- [ ] Documentation includes setup instructions for new developers

### Demo Script

```bash
# Clone repo
git clone <repo> && cd SpringBoard
git checkout 001-local-ai-assistant

# Install dependencies (including Vite + Vue 3 via owner-run create-vite in T002)
npm install

# Start backend
npm run backend
# Verify: curl http://IPC channel health

# Start frontend (separate terminal)
cd apps/springboard-desktop && npm run dev
# Verify: Open browser to http://localhost:5173 (Vite dev server with HMR)

# Run tests
npm test
# Verify: All tests passing
```

---

## Sprint 2: Security Foundation (Permission Manager, Encryption, Audit)

**Duration**: 2 weeks  
**Goal**: Build security-critical foundation that all features depend on  
**Working Software**: Permission grant/revoke API, encrypted storage, audit logging  
**Demo**: Grant permission → revoke → verify audit log entry

### Focus Areas

1. **Permission Management**
   - PermissionGrant entity and repository
   - Permission validation service
   - Grant/revoke/check API endpoints
   - Encrypted permission storage

2. **Encryption Services**
   - Conversation encryption service (AES-256-GCM)
   - Secure credential store (DPAPI wrapper)
   - Token refresh scheduler

3. **Audit Logging**
   - AuditLogEntry entity
   - Audit logger service (JSON Lines format)
   - Audit query service
   - 90-day retention policy

4. **Database Schema**
   - Create migrations for permissions, audit logs
   - Indexes for performance
   - Foreign key constraints

### Tasks from Master Backlog

**Phase 2 (Foundational)**: T009-T025 (17 tasks)

Key tasks:
- T009: SQLCipher wrapper
- T010-T012: PermissionGrant entity, repository, validation
- T013-T015: Encryption service, token refresh, credential store
- T016-T018: AuditLogEntry entity, audit logger, audit query service
- T019-T020: Database migrations and initialization
- T021-T022: Config parser and watcher
- T023-T025: Mock servers and test infrastructure

### Deliverables

- ✅ Permission grant/revoke REST API working
- ✅ SQLCipher database with permission storage
- ✅ Audit log writing to JSON Lines files
- ✅ Unit tests for permission logic (>90% coverage)
- ✅ Contract tests for permission API
- ✅ Documentation: Permission model design in ARCHITECTURE.md

### Acceptance Criteria

- [ ] IPC message: permissions/grant creates grant in encrypted database
- [ ] IPC message: permissions/revoke marks grant as revoked
- [ ] IPC message: permissions/check validates active permissions
- [ ] All permission changes logged to audit trail
- [ ] Encryption validated (database file unreadable without key)
- [ ] Token refresh scheduler handles Graph API token rotation
- [ ] Config watcher reloads SOUL.md changes without restart

### Demo Script

```bash
# Grant permission
curl -X POST http://IPC channel permissions/grant \
  -d '{"scope": "outlook-calendar-read", "ttl": 3600}'
# Response: {permissionId, grantedAt, expiresAt}

# Check permission
curl http://IPC channel permissions/check?scope=outlook-calendar-read
# Response: {active: true}

# Revoke permission
curl -X POST http://IPC channel permissions/revoke \
  -d '{"permissionId": "<id>", "reason": "user request"}'

# Verify audit log
cat %APPDATA%/SpringBoard/audit/audit-20260317.jsonl | grep permission_grant
# Shows grant + revoke events with timestamps
```

---

## Sprint 3: Secure Local Chat MVP (US1 - Priority 1)

**Duration**: 2 weeks  
**Goal**: Deliver working chat interface with encrypted local persistence  
**Working Software**: Full chat application with conversation history  
**Demo**: Multi-turn conversation → close app → reopen → history restored

### Focus Areas

1. **Conversation & Message Models**
   - Conversation and Message entities
   - Repositories with encryption
   - Database migrations for chat tables

2. **LLM Integration**
   - Azure OpenAI / AI Inference Engine service (HTTP client)
   - OpenAI-compatible API integration
   - Model selection and configuration

3. **Chat API**
   - IPC message: chat endpoint
   - IPC message: conversations endpoints
   - Message encryption/decryption

4. **Electron UI**
   - Chat window component (Vue 3)
   - Conversation list sidebar
   - Message rendering with Markdown support

5. **Local Persistence**
   - Encrypted message storage
   - Conversation history loading
   - Performance optimization for large histories

### Tasks from Master Backlog

**Phase 3 (US1 - Secure Local Chat)**: T026-T041 (16 tasks)

Key tasks:
- T026-T027: Conversation and Message entities
- T028-T030: LLM service, chat API, conversation endpoints
- T031-T034: Chat UI components, API client, Electron main process
- T035-T037: Repositories and database migrations
- T038-T041: Unit, contract, and integration tests

### Deliverables

- ✅ Working chat interface (send message → receive response)
- ✅ Conversation history persists across app restarts
- ✅ All messages encrypted at rest (validated)
- ✅ No external network calls except to localhost Azure OpenAI / AI Inference Engine
- ✅ Response time <2s for typical queries
- ✅ Unit + contract + integration tests (>85% coverage)
- ✅ Demo script for end-to-end chat workflow

### Acceptance Criteria

- [ ] User can send message and receive AI response
- [ ] Conversation history loads on app restart
- [ ] Encryption validated (database file unreadable)
- [ ] Network monitoring shows zero external calls
- [ ] Response latency <2s (measured with Azure OpenAI / AI Inference Engine on 4090)
- [ ] 5-message conversation works end-to-end
- [ ] Tests cover happy path + error cases (Azure OpenAI / AI Inference Engine down)

### Demo Script

```bash
# Start Azure OpenAI / AI Inference Engine (separate terminal)
# Load mistral-7b model, start server on inference endpoint

# Start SpringBoard
npm start
# Opens Electron app

# In app:
# 1. Type: "Hello, what can you help me with?"
# 2. Receive response (< 2s)
# 3. Type: "What's the weather like?" (4 more messages)
# 4. Close app

# Reopen app
npm start
# Verify: All 5 messages restored in conversation history

# Verify encryption
cat %APPDATA%/SpringBoard/conversations.db | strings
# Should see encrypted data, not plaintext messages

# Verify no external network
# netstat -ano | findstr :443
# Should show no HTTPS connections during chat
```

### Exit Criteria (MVP Checkpoint)

**This is the MVP release candidate**. Before proceeding to Sprint 4:

1. **Security validation**:
   - [ ] Penetration test: No conversation data leaks to external network
   - [ ] Encryption test: Database file unreadable without app
   - [ ] Audit log test: All chat interactions logged

2. **Performance validation**:
   - [ ] Startup time <3s on reference hardware
   - [ ] Chat response <2s on 4090 with mistral-7b
   - [ ] 500-message history loads <1s

3. **User acceptance**:
   - [ ] Internal dogfooding (use for 1 week)
   - [ ] Collect feedback on UX, performance, bugs
   - [ ] Document known issues and future improvements

**Decision point**: Ship MVP to early adopters OR continue to Sprint 4?

---

## Sprint 4: Office Integration Foundation (US2 - Priority 2)

**Duration**: 2 weeks  
**Goal**: Implement Office automation with permission controls  
**Working Software**: Calendar read, email draft with permission prompts  
**Demo**: Ask for calendar → permission dialog → grant → events displayed

### Focus Areas

1. **Office Integration Services**
   - Graph API service (Microsoft Graph SDK)
   - COM bridge (Python pywin32)
   - Office resource entity

2. **Permission Dialog**
   - Permission dialog UI component (Electron modal)
   - IPC for permission requests (backend ↔ frontend)
   - Permission prompt UX with clear explanations

3. **Office Skills**
   - Calendar daily briefing skill
   - Email draft reply skill
   - Skill invocation from chat

4. **Office API Endpoints**
   - IPC message: office/calendar/events
   - IPC message: office/calendar/events
   - IPC message: office/emails

### Tasks from Master Backlog

**Phase 4 (US2 - Office Automation)**: T042-T053 (12 tasks)

Key tasks:
- T042-T043: Graph API service, COM bridge
- T044-T045: Permission dialog service, Office resource entity
- T046-T047: Calendar and email skills
- T048-T049: Permission dialog UI, permission manager page
- T050: Office endpoints
- T051-T053: Contract and integration tests

### Deliverables

- ✅ "Check my calendar" command works with permission prompt
- ✅ Permission granted → Outlook calendar fetched via Graph API
- ✅ Permission manager UI shows active grants
- ✅ User can revoke permission and verify access blocked
- ✅ All Office access logged to audit trail
- ✅ COM fallback works when Graph API unavailable

### Acceptance Criteria

- [ ] User can authorize Outlook calendar read in <30s
- [ ] Calendar events displayed after permission granted
- [ ] Revoked permission blocks next calendar request
- [ ] Permission dialog shows clear explanation of access requested
- [ ] Office integration gracefully handles missing Office apps
- [ ] Audit log captures all Office resource access

### Demo Script

```bash
# Prerequisites: Microsoft 365 account OR local Outlook installed

# Start SpringBoard
npm start

# In chat:
User: "What's on my calendar this week?"
# System shows permission dialog:
# "Assistant needs: Outlook Calendar Read
#  To view your calendar events.
#  Grant? [Yes] [No] [Never ask again]"

# Click [Yes]
# System fetches calendar from Graph API
# Assistant responds: "You have 3 meetings this week: ..."

# Open Permission Manager (Settings → Permissions)
# See: "outlook-calendar-read | Granted 2 min ago | [Revoke]"

# Click [Revoke]
# Return to chat
User: "Check calendar again"
# Permission dialog shows again (permission revoked)

# Check audit log
cat %APPDATA%/SpringBoard/audit/audit-*.jsonl | grep office
# Shows: permission_grant, calendar_access, permission_revoke events
```

---

## Sprint 5: Tool Sandboxing (US3 - Priority 3)

**Duration**: 2 weeks  
**Goal**: Implement safe tool execution with Windows Sandbox (WSB) sandboxing  
**Working Software**: Filesystem, shell, document reader tools in containers  
**Demo**: List Documents folder → sandboxed execution → output returned

### Focus Areas

1. **Windows Sandbox (WSB) Infrastructure**
   - Windows Sandbox (WSB) image for tool execution (Alpine base)
   - Windows Sandbox Executor service
   - Windows Sandbox (WSB) integration and health checks

2. **Tool Implementations**
   - Filesystem tool (read/write with mount restrictions)
   - Shell tool (bash with command whitelist)
   - Browser automation tool (Puppeteer stub)
   - Document reader tool (PDF, DOCX, XLSX parsers)

3. **Tool Permissions & Settings**
   - Tool registry with per-tool config
   - Tool execution endpoint with permission checks
   - ToolExecutionRecord entity and audit logging

4. **Security Testing**
   - Penetration tests for sandbox escape
   - Privilege escalation tests
   - Filesystem boundary tests

### Tasks from Master Backlog

**Phase 5 (US3 - Tool Sandboxing)**: T054-T068 (15 tasks)

Key tasks:
- T054-T056: Windows Sandbox (WSB) image, executor service, Windows Sandbox (WSB) manager
- T057: Tool definitions registry
- T058-T061: Filesystem, shell, browser, document reader tools
- T062-T064: Tool execution endpoint, entity, penetration tests
- T065-T066: Tool settings UI, execution history
- T067-T068: Contract and integration tests

### Deliverables

- ✅ Filesystem tool reads/writes files in sandboxed environment
- ✅ Shell tool executes commands with restrictions
- ✅ All tool execution logged with command + output
- ✅ Penetration tests confirm sandbox cannot be escaped
- ✅ Tool settings UI allows enable/disable per tool

### Acceptance Criteria

- [ ] Filesystem tool lists directory contents successfully
- [ ] Shell tool executes `echo` command and returns output
- [ ] Sandbox escape attempts blocked and logged
- [ ] Tool execution timeout after 30s
- [ ] User can disable shell tool category
- [ ] All tool operations logged to audit trail

### Demo Script

```bash
# Prerequisites: Windows Sandbox (WSB) Desktop installed

# Start SpringBoard
npm start

# In chat:
User: "List files in my Documents folder"
# System shows permission dialog:
# "Assistant needs: Filesystem Read Access (Documents)
#  Grant? [Yes] [No]"

# Click [Yes]
# System spawns Windows Sandbox
# Executes: ls /mnt/documents
# Returns: "Found 15 files: report.docx, data.xlsx, ..."

# Try escape attempt (internal test, not user-facing):
User: "Read file ../../../../etc/passwd"
# System blocks: Path outside allowed mount
# Audit log: SANDBOX_ESCAPE_ATTEMPT

# Open Tool Execution History (Settings → Tools → History)
# See: Recent executions with command, duration, output

# Open Tool Settings (Settings → Tools → Configuration)
# Disable "Shell Execution"
# Return to chat
User: "Run command: echo hello"
# System: "Shell execution is disabled in settings"
```

---

## Sprint 6: Skill Management (US4 - Priority 4)

**Duration**: 2 weeks  
**Goal**: Implement skill installation, configuration, and hot reload  
**Working Software**: Install sample skill, configure it, execute it  
**Demo**: Install skill → configure → execute → edit SOUL.md → verify reload

### Focus Areas

1. **Skill Infrastructure**
   - Skill entity and repository
   - Skill manifest validator
   - Skill installer/uninstaller

2. **Configuration Management**
   - SOUL.md, AGENTS.md, USER.md schemas
   - Config file editor component (UI + raw YAML)
   - Config hot reload service

3. **Skill Execution**
   - Skill executor service with permission checks
   - Skill test harness for validation
   - Skill execution endpoint

4. **Skill Management UI**
   - Skill manager page (list, install, configure)
   - Skill configuration panel (dynamic forms)
   - Config reload indicator

### Tasks from Master Backlog

**Phase 6 (US4 - Skill Management)**: T069-T086 (18 tasks)

Key tasks:
- T069-T074: Skill entity, repository, validator, installer, executor
- T075-T077: SOUL/AGENTS/USER.md schemas
- T078-T079: Config editor UI, reload indicator
- T080-T083: Skill manager page, config panel, execution endpoint
- T084-T086: Unit and integration tests

### Deliverables

- ✅ Sample skill installed from manifest folder
- ✅ Skill configuration persisted and reloaded
- ✅ SOUL.md edited (via UI or filesystem) → changes applied without restart
- ✅ Skill permissions enforced (missing permission → error)
- ✅ Skill uninstall removes all files cleanly

### Acceptance Criteria

- [ ] Skill manifest validated before installation
- [ ] Installed skill appears in skill manager within 10s
- [ ] Skill configuration changes persist across app restarts
- [ ] SOUL.md modification detected and reloaded <5s
- [ ] Skill execution blocked without required permissions
- [ ] Uninstall removes skill from database and filesystem

### Demo Script

```bash
# Create sample skill manifest
mkdir sample-skill
cat > sample-skill/skill.yaml <<EOF
id: hello-world
name: Hello World Skill
description: Simple greeting skill
version: 1.0.0
author: SpringBoard Team
required_permissions: []
entrypoint: index.js
EOF

# Start SpringBoard
npm start

# Open Skill Manager (Settings → Skills)
# Click [Install Skill...]
# Select sample-skill folder
# System: Validates manifest → installs → shows in list

# Click skill → [Configure]
# Edit config parameter: message = "Hello SpringBoard!"
# Save

# Return to chat
User: "Run hello world skill"
# Assistant: "Hello SpringBoard!" (using configured message)

# Edit SOUL.md (via UI or filesystem)
# Change: personality: helpful → personality: formal
# Wait 5s
# Config reload indicator shows: "Configuration reloaded ✓"

# Send new chat message
# Verify: Assistant tone is now formal (per SOUL.md change)

# Return to Skill Manager
# Click [Uninstall] on hello-world skill
# Confirm
# Verify: Skill removed from list + filesystem
```

---

## Sprint 7: Heartbeat Scheduling (US5 - Priority 5)

**Duration**: 2 weeks  
**Goal**: Implement proactive scheduled tasks  
**Working Software**: Morning briefing task runs automatically at 9 AM  
**Demo**: Create scheduled task → advance time → task executes → result displayed

### Focus Areas

1. **Scheduled Task Infrastructure**
   - ScheduledTask entity and repository
   - Task scheduler service (cron polling)
   - Next run time calculation

2. **Task Execution**
   - Execute scheduled tasks via skill executor
   - Run deterministic pre-check automation before LLM invocation
   - Handle permission checks (use existing grants)
   - Log execution results

3. **Notification System**
   - Desktop toast notifications for task completion
   - Task execution history

4. **Heartbeat UI**
   - Scheduled tasks page (list, create, edit, delete)
   - Task form (skill selection, cron schedule)
   - Execution history component

### Tasks from Master Backlog

**Phase 7 (US5 - Heartbeat Scheduling)**: T087-T097 (11 tasks)

Key tasks:
- T087-T090: ScheduledTask entity, repository, scheduler service, execution
- T091-T093: Scheduled tasks page, form, execution history
- T094: CRUD endpoints for scheduled tasks
- T095: Notification service
- T096-T097: Unit and integration tests

### Deliverables

- ✅ Scheduled task created with cron expression
- ✅ Task executes automatically at scheduled time
- ✅ Task result displayed to user (toast notification)
- ✅ Existing permissions used (no re-prompting)
- ✅ Failed tasks logged with error details

### Acceptance Criteria

- [ ] Task created with "0 9 * * MON-FRI" schedule
- [ ] At 9 AM (simulated), task executes automatically
- [ ] Deterministic pre-check completes before any LLM call; LLM invoked only when summarization/reasoning is required
- [ ] Task execution logged to audit trail
- [ ] Permissions respected (no dialog if already granted)
- [ ] User can manually trigger task via [Run Now] button
- [ ] Disabled tasks skipped by scheduler

### Demo Script

```bash
# Start SpringBoard
npm start

# Open Scheduled Tasks (Settings → Scheduled Tasks)
# Click [Add Task...]
# Step 1: Select skill = "calendar-daily-briefing"
# Step 2: Set schedule = "Weekdays at 9:00 AM"
# Step 3: Review (shows next 3 run times)
# Click [Save]

# Task appears in list: "Calendar Briefing | Weekdays 9:00 AM | Enabled"

# Simulate time advance (internal test helper):
# Set system time to 9:05 AM next business day

# Scheduler poll detects task due
# Executes: calendar-daily-briefing skill
# Desktop notification: "Morning Briefing: You have 3 meetings today..."

# Open Execution History (click task → History tab)
# See: Last execution (timestamp, duration, output)

# Click [Run Now] button
# Task executes immediately (out-of-schedule)
# Result displayed

# Disable task (toggle switch)
# Next scheduled time passes → task NOT executed

# Check audit log
cat %APPDATA%/SpringBoard/audit/audit-*.jsonl | grep scheduled_task
# Shows: SCHEDULED_TASK_START, SCHEDULED_TASK_END with outcomes
```

---

## Sprint 8: Integration & Polish

**Duration**: 2 weeks  
**Goal**: End-to-end testing, performance optimization, bug fixes  
**Working Software**: All 5 user stories working together seamlessly  
**Demo**: Full workflow (chat → Office → tools → skills → scheduling)

### Focus Areas

1. **End-to-End Testing**
   - Full workflow tests (all 5 user stories)
   - Cross-feature integration tests
   - Error recovery and resilience testing

2. **Performance Optimization**
   - Caching layer for frequent queries
   - Database query optimization
   - UI rendering optimization (virtualization)

3. **Bug Fixes**
   - Address issues from Sprints 1-7
   - Edge case handling
   - Error message improvements

4. **User Experience Polish**
   - Loading states and progress indicators
   - Error message clarity
   - Accessibility improvements (ARIA labels, keyboard shortcuts)

### Tasks from Master Backlog

**Phase 8 (Polish)**: T098-T112 (15 tasks)

Key tasks:
- T098-T099: End-to-end test suite, cross-platform testing
- T100-T101: Security audit, security logging enhancements
- T102-T104: Caching, database optimization, UI rendering optimization
- T105-T108: API docs, developer guide, deployment guide, architecture updates
- T109-T112: Installer, release checklist, CI/CD, final QA

### Deliverables

- ✅ E2E test suite passing (10-minute full workflow)
- ✅ Performance baselines met (startup <3s, chat <2s, tool execution <5s)
- ✅ Security audit completed with sign-off
- ✅ All 5 user story demo scripts working end-to-end
- ✅ Bug list triaged (P0/P1 fixed, P2+ documented for future)

### Acceptance Criteria

- [ ] E2E test runs successfully on 2+ hardware configurations
- [ ] Performance benchmarks met on minimal hardware (8GB RAM, integrated GPU)
- [ ] Security audit approved by security owner
- [ ] All P0 and P1 bugs fixed
- [ ] Documentation complete (API docs, developer guide, deployment guide)

### Demo Script

```bash
# Full Workflow Demo (all 5 user stories)

# 1. Secure Local Chat (US1)
User: "Hello, introduce yourself"
Assistant: "I'm SpringBoard, your local-first AI assistant..."
# Close app → reopen → verify history

# 2. Office Automation (US2)
User: "What meetings do I have tomorrow?"
# Permission dialog → grant → calendar fetched
Assistant: "You have 3 meetings: ..."

# 3. Tool Execution (US3)
User: "List files in my Downloads folder"
# Permission dialog → grant → Windows Sandbox executes ls
Assistant: "Found 8 files: ..."

# 4. Skill Management (US4)
# Install custom skill (e.g., "Document Summarizer")
# Configure: max_length = 500 words
User: "Summarize report.docx"
# Skill executes → document read → LLM summarization
Assistant: "The report discusses..."

# 5. Heartbeat Scheduling (US5)
# Scheduled task runs at 9 AM: morning briefing
# Desktop notification: "Good morning! Here's your day..."

# Verify all interactions logged
cat %APPDATA%/SpringBoard/audit/audit-*.jsonl
# Shows: 20+ audit entries across all features

# Performance measurements:
# - App startup: 2.5s ✓
# - Chat response: 1.8s ✓
# - Tool execution: 4.2s ✓
# - Permission dialog: 0.3s ✓
```

---

## Sprint 9: Security Hardening & Documentation

**Duration**: 2 weeks  
**Goal**: Finalize security testing, complete documentation, release preparation  
**Working Software**: Production-ready application  
**Demo**: Security audit results, deployment guide walkthrough

### Focus Areas

1. **Security Testing**
   - Penetration testing (sandbox escape, privilege escalation)
   - Dependency audits (npm audit, pip audit)
   - OWASP Top 10 compliance verification
   - Threat model validation

2. **Documentation Completion**
   - API documentation (OpenAPI/Swagger)
   - Operator guide (deployment, configuration, troubleshooting)
   - Security documentation (threat model, audit strategy)
   - FAQ and troubleshooting guide

3. **Release Preparation**
   - Windows installer (NSIS) with code signing
   - Release checklist validation
   - Automated CI/CD pipeline finalization

4. **Compliance Verification**
   - Constitution alignment document
   - All 5 principles verified in implementation
   - Test-first compliance demonstrated

### Tasks from Master Backlog

**Phase 8 (continued)**: T100-T120 (21 tasks)

Key tasks:
- T100-T101: Security audit, security logging
- T105-T108: Documentation (API, developer, deployment, architecture)
- T109-T111: Installer, release checklist, CI/CD
- T112-T117: Final QA, demo scripts
- T118-T120: Security docs, FAQ, constitution alignment

### Deliverables

- ✅ Security audit report with all findings addressed
- ✅ Complete documentation set (API, developer, operator, security)
- ✅ Windows installer with code signing
- ✅ CI/CD pipeline fully automated
- ✅ Constitution alignment verified and documented

### Acceptance Criteria

- [ ] Security audit approved by security owner (Mark Ferris)
- [ ] All P0/P1 security findings remediated
- [ ] Documentation reviewed and approved
- [ ] Installer tested on 3+ Windows configurations
- [ ] CI/CD pipeline runs without manual intervention
- [ ] All 5 constitution principles verified PASS

### Deliverables

- ✅ **docs/SECURITY_AUDIT.md** - Security audit report
- ✅ **docs/API.md** - Complete API documentation (Swagger)
- ✅ **docs/DEPLOYMENT.md** - Operator guide
- ✅ **docs/FAQ.md** - Troubleshooting and common questions
- ✅ **docs/CONSTITUTION_ALIGNMENT.md** - Principle verification
- ✅ **installers/springboard-installer.exe** - Signed Windows installer

---

## Sprint 10: Release & Launch

**Duration**: 1 week  
**Goal**: Final validation, release to early adopters, launch communications  
**Working Software**: SpringBoard v1.0.0 released  
**Demo**: Installation on clean machine, onboarding experience

### Focus Areas

1. **Final Validation**
   - Install on clean Windows machines (3+ configurations)
   - Onboarding experience validation
   - Performance benchmarks on target hardware
   - Release checklist sign-off

2. **Release Execution**
   - Git tag for v1.0.0
   - GitHub Release with installer and release notes
   - npm package publishing (@springboard/contracts)
   - Website/blog announcement

3. **Launch Communications**
   - Email to early adopters
   - Demo video recording
   - Documentation site publishing

4. **Post-Launch Support**
   - Monitor error reporting
   - Respond to initial feedback
   - Document P2/P3 bugs for future sprints

### Tasks from Master Backlog

- T112: Final QA testing
- Release execution (not in task list - operational)
- Launch communications (not in task list - operational)

### Deliverables

- ✅ **SpringBoard v1.0.0** released on GitHub
- ✅ Windows installer published and signed
- ✅ Release notes published
- ✅ Demo video published
- ✅ Early adopter email sent

### Acceptance Criteria

- [ ] Installer tested on 3+ clean Windows machines
- [ ] Onboarding experience validated (<5 minutes to first chat)
- [ ] Release checklist completed (all items signed off)
- [ ] GitHub Release published with installer and notes
- [ ] Early adopters notified

### Post-Launch Activities

1. **Monitor error reporting** (first 48 hours critical)
2. **Collect user feedback** from early adopters
3. **Triage P2/P3 bugs** for Sprint 11+
4. **Document lessons learned** in retrospective
5. **Plan Sprint 11** (maintenance + enhancements)

---

## Sprint Metrics & Tracking

### Velocity Tracking

**Estimated velocity**: 8-10 tasks per sprint (varies by complexity)

| Sprint | Tasks Planned | Tasks Completed | Velocity | Notes |
|--------|---------------|-----------------|----------|-------|
| 0 | 0 (planning) | - | - | Requirements finalization |
| 1 | 8 | - | - | Infrastructure |
| 2 | 17 | - | - | Security foundation |
| 3 | 16 | - | - | MVP (US1) |
| 4 | 12 | - | - | Office integration |
| 5 | 15 | - | - | Tool sandboxing |
| 6 | 18 | - | - | Skill management |
| 7 | 11 | - | - | Heartbeat scheduling |
| 8 | 15 | - | - | Integration & polish |
| 9 | 21 | - | - | Security & docs |
| 10 | 1 | - | - | Release |

### Sprint Health Indicators

**Green** (on track):
- All planned tasks completed
- Tests passing
- Demo script works end-to-end
- No blocking issues

**Yellow** (at risk):
- 1-2 tasks carried over to next sprint
- Minor test failures
- Demo script requires workarounds
- 1-2 P1 bugs open

**Red** (off track):
- 3+ tasks carried over
- Major test failures or CI broken
- Demo script does not work
- P0 bugs or security issues blocking

### Risk Management

**Top Risks**:

1. **Azure OpenAI / AI Inference Engine integration complexity** (Sprint 3)
   - Mitigation: Mock server for testing, fallback to simpler models
   
2. **Windows Sandbox (WSB) setup variability** (Sprint 5)
   - Mitigation: Comprehensive setup script, fallback to Windows Sandbox

3. **Graph API authentication challenges** (Sprint 4)
   - Mitigation: COM fallback, detailed auth error handling

4. **Performance on minimal hardware** (Sprint 8)
   - Mitigation: Early performance testing, optimization sprint buffer

5. **Security audit findings** (Sprint 9)
   - Mitigation: Security-first design from Sprint 2, buffer time for remediation

### Dependencies & Blockers

**External dependencies**:
- Azure OpenAI / AI Inference Engine availability (Sprint 3)
- Microsoft 365 test account (Sprint 4)
- Windows 11 test machines (Sprint 8)
- Code signing certificate (Sprint 9)

**Internal blockers**:
- Sprint 2 must complete before Sprint 3-7 (security foundation)
- Sprints 3, 4, and 5 can be executed in parallel once Phase 2 is complete.
- Sprint 0 must complete before Sprint 1 (requirements finalized)

---

## Retrospective Schedule

**Cadence**: End of each sprint

**Format**:
1. **What went well?** (celebrate wins)
2. **What didn't go well?** (identify problems)
3. **What should we change?** (action items for next sprint)
4. **Velocity review** (planned vs. actual)
5. **Next sprint planning** (load backlog for upcoming sprint)

**Action items**: Tracked in sprint-retrospectives.md (create per sprint)

---

## Sprint 0 Action Items (Current Sprint)

### Immediate Next Steps (Week 1: March 3-7)

- [ ] **Monday (Mar 3)**: Review this sprint plan with stakeholders
  - Validate sprint structure (10 sprints reasonable?)
  - Confirm focus areas for each sprint
  - Identify any missing requirements or risks

- [ ] **Tuesday (Mar 4)**: Complete requirements review
  - Review all 5 user stories for edge cases
  - Validate 46 functional requirements
  - Document any gaps or ambiguities

- [ ] **Wednesday (Mar 5)**: Architecture validation
  - Deep dive on 5 architectural decisions
  - Validate tech stack choices
  - Review data model and API contracts

- [ ] **Thursday (Mar 6)**: Security & compliance review
  - Threat model walkthrough
  - Constitution alignment verification
  - Document security requirements for Sprint 2

- [ ] **Friday (Mar 7)**: Development environment setup
  - Create setup script (Node, Python, Windows Sandbox (WSB), Windows Sandbox (WSB), Azure OpenAI / AI Inference Engine)
  - Test on 2+ machines
  - Document troubleshooting steps

### Week 2 (March 10-14)

- [ ] **Monday (Mar 10)**: Sprint planning finalization
  - Finalize Sprint 1-3 backlog
  - Identify dependencies and risks
  - Estimate effort and capacity

- [ ] **Tuesday (Mar 11)**: Tool and process setup
  - GitHub Project board setup
  - CI/CD pipeline design
  - Testing strategy finalization

- [ ] **Wednesday (Mar 12)**: Documentation sprint
  - Write DEVELOPMENT.md
  - Write docs/THREAT_MODEL.md
  - Create dev environment setup script

- [ ] **Thursday (Mar 13)**: Sprint 0 review and sign-off
  - Present sprint plan to stakeholders
  - Get approval on architecture decisions
  - Obtain security sign-off

- [ ] **Friday (Mar 14)**: Sprint 1 kick-off preparation
  - Load Sprint 1 backlog into GitHub issues
  - Assign tasks
  - Prepare for Sprint 1 start (March 17)

---

## Summary

**Total Duration**: 10 sprints (~20 weeks)

**MVP Delivery**: End of Sprint 3 (6 weeks from Sprint 1 start)

**Feature Complete**: End of Sprint 7 (14 weeks from Sprint 1 start)

**Release**: End of Sprint 10 (20 weeks from Sprint 1 start)

**Current Status**: Sprint 0 (Planning & Requirements) - Week 1 of 2

**Next Milestone**: Sprint 0 completion (March 14) → Sprint 1 start (March 17)

---

## Appendix: Sprint Template

Use this template for each sprint's documentation:

```markdown
# Sprint N: [Sprint Name]

**Duration**: [Start Date] - [End Date] (2 weeks)
**Goal**: [Primary objective]
**Working Software**: [What can be demo'd]

## Focus Areas
1. [Focus area 1]
2. [Focus area 2]
3. [Focus area 3]

## Tasks
- [ ] T### Task description
- [ ] T### Task description

## Deliverables
- ✅ [Deliverable 1]
- ✅ [Deliverable 2]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Demo Script
```bash
# Steps to demonstrate working software
```

## Retrospective Notes
[Added at end of sprint]
- What went well:
- What didn't go well:
- Action items:
```
