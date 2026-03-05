# SpringBoard Phase 1 Quickstart & Architecture Overview

**Status**: Phase 1 Design | **Date**: March 3, 2026
**Audience**: Developers, architects, security reviewers

---

## 10-Minute Architecture Overview

### What is SpringBoard?

**SpringBoard** is a **security-first, local-first AI desktop assistant** that helps Windows workers stay productive while keeping their data private.

```
User (Windows Desktop)
    │
    ├─→ Opens SpringBoard app (Electron)
    │   └─→ "What meetings do I have tomorrow?"
    │
    └─→ App thinks: "I need your Outlook calendar"
        └─→ You grant permission (only once)
        └─→ Generates response using Azure OpenAI / Inference Engine (local model)
        └─→ All your conversation data stays on your computer
```

**Key promises**:
- ✅ **Zero cloud data leakage**: Conversations never leave your machine
- ✅ **Explicit permissions**: Every Office/tool action requires your approval
- ✅ **Sandboxed tools**: File/shell operations run isolated, can't break your system
- ✅ **Enterprise-ready**: Entra ID integration, audit trail for compliance

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Windows PC                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────┐                 │
│  │      SpringBoard Electron App          │                 │
│  │    (Chat UI, Permission Dialogs)       │                 │
│  └────────────────┬───────────────────────┘                 │
│                   │ IPC                                       │
│  ┌────────────────▼───────────────────────┐                 │
│  │    Node.js Backend (Electron IPC API)       │                 │
│  │  - Permission Management               │                 │
│  │  - Message Encryption/Storage          │                 │
│  │  - Skill Orchestration                 │                 │
│  │  - Tool Execution                      │                 │
│  └────────────────┬───────────────────────┘                 │
│                   │                                           │
│    ┌──────────────┼──────────────┬────────────────┐         │
│    │              │              │                │         │
│    │              │              │                │         │
│    ▼              ▼              ▼                ▼         │
│  Azure OpenAI / Inference Engine    Graph API      Windows Sandbox (WSB)/Windows Sandbox (WSB)   Config Files   │
│ (localhost    (Outlook,       (Sandbox)     (SOUL.md,     │
│  :8000)       Word, Excel)                  AGENTS.md)    │
│                                                             │
│  ┌──────────────────────────────────────┐                 │
│  │     All Data Stored Locally          │                 │
│  │  (Encrypted conversations, tokens)   │                 │
│  └──────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. **Electron Frontend** (Vue 3 + TypeScript)
- **Purpose**: Desktop UI for chat, permission dialogs, settings
- **Files**: 
  - `src/components/ChatWindow.vue` — message display + input
  - `src/components/PermissionDialog.vue` — permission prompts
  - `src/pages/SkillManagerPage.vue` — manage installed skills
- **Communication**: IPC (process) to Node backend

### 2. **Node.js Backend** (Electron IPC + TypeScript)
- **Purpose**: Core orchestration — permissions, LLM chat, tool execution, audit logging
- **Routes**:
  - `IPC message: chat` — send message, get response
  - `GET/IPC message: permissions/*` — manage active permissions
  - `IPC message: tools/execute` — run filesystem/shell tools in sandbox
  - `IPC message: audit/logs` — view audit trail (admin)
  - `IPC message: config/reload` — reload SOUL.md, AGENTS.md, USER.md
- **Services**:
  - Permission Manager: Grant/revoke/check permissions
  - LLM Service: Call Azure OpenAI / Local fallback HTTP API
  - Office Service: Call Graph API or COM for Outlook/Word/Excel
  - Sandbox Orchestrator: Launch Windows Sandboxs for tool isolation
  - Config Manager: Parse and watch SOUL.md, AGENTS.md, USER.md

### 3. **Python Services** (Optional, Phase 1+)
- **Purpose**: Azure OpenAI / AI Inference Engine bridge, Office COM adapter, tool utilities
- **Examples**:
  - `lm_studio_bridge.py` — HTTP client to Azure OpenAI / Inference Engine with retry logic
  - `office_com_bridge.py` — Python/COM wrapper for local Word/Excel/Outlook
  - `Windows Sandbox (WSB)_executor.py` — Container lifecycle management

### 4. **Local Data Storage**
- **Conversations**: SQLCipher at `%APPDATA%/SpringBoard/conversations.db`
- **Permissions**: Encrypted permission grants in SQLCipher
- **Tokens**: Cached Graph API refresh tokens (encrypted with DPAPI)
- **Audit Log**: JSON Lines at `%APPDATA%/SpringBoard/audit/audit-*.jsonl`
- **Config**: YAML files in `%APPDATA%/SpringBoard/config/`

### 5. **External Services** (User Needs Approval)
- **Azure OpenAI / Inference Engine**: Local HTTP server running local model (Mistral 7B, Llama 70B, etc.)
- **Graph API**: Microsoft's cloud API for Outlook/Word/Excel (requires Entra ID auth)
- **Windows Sandbox (WSB)/Windows Sandbox (WSB)**: Linux container runtime for sandboxing

---

## Development Environment Setup (Windows)

### Prerequisites
```powershell
# 1. Node.js 20 LTS
# Download from https://nodejs.org -> install

# 2. Python 3.11+
# Download from https://python.org -> install (add to PATH)

# 3. Windows Sandbox (WSB) Desktop
# Required for tool sandboxing
# https://docs.microsoft.com/en-us/windows/wsl/install
# Then install Windows Sandbox for Windows

# 4. Azure OpenAI / Inference Engine (for local LLM inference)
# Download from https://lmstudio.ai
# Open, download a model (Mistral 7B recommended), start server on :8000
```

### Quick Start
```bash
# Clone repo
git clone https://github.com/yourorg/SpringBoard
cd SpringBoard

# Install dependencies
npm install
cd apps/springboard-backend && npm install
cd ../springboard-desktop && npm install

# Start development servers
# Terminal 1: Node backend
cd apps/springboard-backend
npm run dev   # Starts on http://Electron Main IPC

# Terminal 2: Electron app
cd apps/springboard-desktop
npm start     # Opens Electron window

# Terminal 3: Azure OpenAI / Inference Engine
# Open local inference engine -> Settings -> Server -> Start Server

# Test in Electron: Type "Hi" in chat, wait for response
# Backend should:
#   1. Send message to Azure OpenAI / Inference Engine 
#   2. Get response back
#   3. Store encrypted in local DB
#   4. Log to audit trail
#   5. Display in UI
```

---

## Key Data Flows

### Flow 1: Simple Chat (No Permissions)

```
User: "What is the capital of France?"
    ↓
[Electron UI] broadcasts to Node backend
    ↓
[Backend Message Handler]
  - Create Message record (user message)
  - Call LLM Service → Azure OpenAI / Inference Engine 
    (no permissions needed, purely local)
  - Get response: "Paris"
  - Create Message record (assistant response)
  - Encrypt and store in conversation DB
  - Log chat event to audit trail
    ↓
[Electron UI] displays response
```

### Flow 2: Office Integration (With Permissions)

```
User: "What meetings do I have tomorrow?"
    ↓
[Electron UI] broadcasts to Node backend
    ↓
[Backend Message Handler]
  - Check: Does user have "outlook-calendar-read" permission?
  - Permission NOT found
    ↓
    [Electron UI] shows dialog:
      "Assistant wants to read your Outlook calendar. Allow? [Yes/No]"
    ↓
    User clicks [Yes]
    ↓
  - Create PermissionGrant record (scope: "outlook-calendar-read")
  - Log permission_grant event to audit trail
  - Call Office Service → Graph API
    (using Entra ID token, automatically refreshes if expired)
  - Get calendar events for tomorrow
    ↓
  - Call LLM Service with system context
    System: "User has these calendar events: [list]"
    User: "What meetings do I have tomorrow?"
  - LLM generates: "You have 3 meetings tomorrow: ..."
  - Store encrypted, log to audit
    ↓
[Electron UI] displays response
```

### Flow 3: Tool Execution (Sandboxed)

```
User: "Show me files in my Downloads folder"
    ↓
[Electron UI] → [Backend]
    ↓
[Backend Tool Handler]
  - Check: Does user have "filesystem-read" permission?
  - If not, show permission dialog (like above)
  - If yes, proceed
    ↓
  - Create ToolExecutionRequest: 
    { tool: "filesystem-read", path: "Downloads", ... }
    ↓
  - Validate mount path (only allow user-safe dirs like Documents, Downloads)
    ↓
  - Call Sandbox Orchestrator
    ├─ Create Windows Sandbox from alpine image
    ├─ Mount Downloads folder (read-only)
    ├─ Run: find /work/downloads -type f -ls
    ├─ Capture stdout/stderr
    ├─ Container exits
    └─ Clean up
    ↓
  - Get output: "total 2048 ... file1.pdf file2.txt ..."
    ↓
  - Log tool_execution_complete to audit trail
    {
      "tool_name": "filesystem-read",
      "exit_code": 0,
      "output_size": 1024,
      "container_id": "a1b2c3d4"
    }
    ↓
  - Call LLM Service with tool output
    System: "Here are the files in Downloads: [list]"
    User: "Show me files in my Downloads folder"
  - LLM generates: "I found 2 files in your Downloads folder: ..."
    ↓
[Electron UI] displays response
```

---

## Permission Model Explained

### Permission Scopes (Canonical List)

| Scope | Meaning | Example Use |
|-------|---------|---------|
| `outlook-calendar-read` | Read calendar events | "Check availability for meeting" |
| `outlook-calendar-write` | Create/modify events | "Schedule a meeting" |
| `outlook-mail-read` | Read email messages | "Read latest email" |
| `outlook-mail-send` | Send emails | "Send an email for me" |
| `word-document-read` | Read Word docs | "Summarize document" |
| `word-document-write` | Modify Word docs | "Edit document" |
| `filesystem-read` | Read files locally | "List downloads folder" |
| `shell-execute` | Run commands | "Run PowerShell script" |

### Permission Lifecycle

```
1. User asks something that needs permission
   └─→ Backend checks PermissionGrant table
   
2. Permission NOT found or REVOKED
   └─→ Show Electron dialog: "Grant permission? [Yes/No]"
   
3. User clicks [Yes]
   └─→ Create PermissionGrant DB record
   └─→ Log permission_grant event to audit
   └─→ Proceed with request
   
4. Permission is active
   └─→ Use for all future requests (until user revokes)
   
5. User goes to Settings → Permissions
   └─→ See all active permissions
   └─→ Can click [Revoke] on any
   └─→ Logs permission_revoke event to audit
```

### Why Explicit Permissions?

- **Security**: No hidden data access; every capability visible
- **Trust**: User controls what assistant can do
- **Compliance**: Audit trail proves permission flow for HIPAA/SOC2
- **Enterprise Viability**: Meets corporate data governance requirements

---

## Configuration Files

### SOUL.md (AI Personality)

```yaml
# Defines assistant behavior & personality
name: "SpringBoard Assistant"
personality:
  tone: "helpful"        # helpful|formal|casual|technical
  formality: "medium"    # high|medium|low
  proactivity: "low"     # low|medium|high  (suggest tasks?)

llm:
  provider: "lm_studio"  # or "hybrid" to allow cloud fallback
  model: "mistral-7b"
  temperature: 0.7
  max_tokens: 500

guidelines:
  - "Always ask for permission before accessing Office"
  - "Explain what you're about to do before doing it"
  - "If unsure, ask the user for clarification"
```

### AGENTS.md (Skill Orchestration)

```yaml
# Defines available skills & workflows
skills:
  - id: "outlook-briefing"
    name: "Outlook Daily Briefing"
    enabled: true
    schedule: "0 9 * * MON-FRI"  # 9 AM weekdays
    
  - id: "document-summarizer"
    name: "Document Summarizer"
    enabled: true
    triggers: ["user_request"]

workflows:
  morning_routine:
    description: "Run morning tasks"
    steps:
      - skill: "outlook-briefing"
      - skill: "weather-report"
```

### USER.md (User Preferences)

```yaml
# Defines user settings
timezone: "America/New_York"
working_hours:
  start: "09:00"
  end: "17:00"
  
notifications:
  enabled: true
  quiet_hours: "18:00-09:00"

preferences:
  auto_save_conversations: true
  conversation_retention_days: 90
  audit_log_retention_days: 365
```

---

## Testing Strategy

### Unit Tests (Jest)
```bash
npm test -- permission-manager.test.ts
npm test -- llm-service.test.ts
npm test -- audit-logger.test.ts
```

### Contract Tests (Mocked Services)
```bash
npm test -- contract/graph-api.test.ts  # Mock Graph API
npm test -- contract/lm-studio.test.ts  # Mock Azure OpenAI / Inference Engine
npm test -- contract/sandbox-api.test.ts # Mock Windows Sandbox (WSB)
```

### Integration Tests
```bash
npm run test:integration # Full flow: chat → permission → office → audit
```

### Manual Testing
1. Start backend: `npm run dev` in `apps/springboard-backend`
2. Start Electron: `npm start` in `apps/springboard-desktop`
3. Ensure Azure OpenAI / Inference Engine running on inference endpoint
4. Try example flows:
   - Chat without permissions (simple question)
   - Check permissions without granting (denial dialog)
   - Grant permission and check Office integration
   - Try filesystem tool (if Windows Sandbox (WSB) available)

---

## Security Checklist (Pre-Deploy)

- [ ] All conversation data encrypted at rest
- [ ] Graph API tokens secured (DPAPI encryption)
- [ ] Permission checks enforced on every Office API call
- [ ] Tool execution runs in Windows Sandbox (WSB) (not host)
- [ ] Audit log append-only (no deletion in UI)
- [ ] No sensitive data in logs (passwords redacted)
- [ ] Skill manifest validation (no arbitrary code execution)
- [ ] Windows firewall rules document (if applicable)

---

## Debugging Tips

### Logs Location
```
%APPDATA%/SpringBoard/
├── audit/               # Audit trail (JSON Lines)
└── conversations.db     # Encrypted message store
```

### Check Backend Running
```powershell
# Should return 200 OK
curl http://Electron Main IPC/health

# Should list available models
curl http://inference endpoint/api/models
```

### Check Permission State
```bash
# Query audit log for permission events
cat %APPDATA%\SpringBoard\audit\audit-*.jsonl | findstr "permission_grant"
```

### Enable Debug Logging
```javascript
// In src/app.ts
import * as pino from "pino";
const logger = pino({ level: "debug" });
// Now all logs include timestamps, context
```

---

## Next Steps (Developers Starting Phase 1)

1. **Set up local environment** (above)
2. **Read data-model.md** to understand entity structure
3. **Review contracts/** folder for API specifications
4. **Start with permission manager** (core security feature)
5. **Implement LLM service** (call Azure OpenAI / Inference Engine)
6. **Add Office integration** (Graph API calls)
7. **Implement sandbox orchestrator** (Windows Sandbox (WSB) tool execution)
8. **Add audit logging** (every security event)
9. **Build UI components** (permission dialogs, chat, settings)
10. **Write tests** (unit, contract, integration)

---

## Terminology

- **Scope**: A permission type (e.g., "outlook-calendar-read")
- **Grant**: An active permission record (user allowed access)
- **Revoke**: Removing an active permission
- **Skill**: A pluggable AI capability (e.g., "Outlook Briefing")
- **Tool**: A system capability (filesystem, shell, browser) in sandbox
- **Sandbox**: Windows Sandbox for isolated tool execution
- **Audit Trail**: Immutable log of all security events
- **SOUL/AGENTS/USER**: Configuration files for personality + workflows + preferences

---

**For questions**: See research.md for architectural decisions, data-model.md for schema details, contracts/ for API specifications.

Ready to code? Clone the repo and follow "Quick Start" above. 🚀
