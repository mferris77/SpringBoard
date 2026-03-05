# Development Guide: SpringBoard Local-First AI Assistant

**Last Updated**: March 4, 2026  
**Feature Branch**: `001-local-ai-assistant`  
**Target Platform**: Windows 10/11 (x64)

---

## Quick Start (First Time Setup)

### Prerequisites

Verify your system meets these requirements:

- **Windows 10/11 (x64)**, Pro or Enterprise edition
- **Node.js 20 LTS** ([nodejs.org](https://nodejs.org/)) - includes npm
- **Python 3.11** ([python.org](https://www.python.org/)) - add to PATH
- **Windows Sandbox (WSB)** feature enabled
- **Git** (latest, from [git-scm.com](https://git-scm.com/))
- **Azure OpenAI / Inference Engine** - for LLM inference (compatible with OpenAI API format)
- **Visual Studio Code** (recommended) with extensions:
  - Vue VSCode Snippets
  - Vue - Official
  - TypeScript Vue Plugin
  - Prettier - Code formatter
  - ESLint

**Verification**:
node --version          # v20.x.x or higher
npm --version           # 10.x.x or higher
python --version        # Python 3.11.x
git --version           # git version 2.x.x or higher
```

### Clone & Initialize

```bash
# Clone the feature branch
git clone https://github.com/mferris77/SpringBoard.git
cd SpringBoard
git checkout 001-local-ai-assistant

# Install root dependencies (monorepo)
npm install

# Install backend dependencies
cd apps/springboard-backend
npm install

# Install Python virtual environment & dependencies
cd ../../services/springboard-python
python -m venv venv
# Activate virtual environment:
#   On Windows: venv\Scripts\activate
#   On Windows Sandbox (WSB): source venv/bin/activate
pip install -r requirements.txt

# Return to repo root
cd ../../
```

### Bootstrap Frontend (Owner-Run Setup)

The frontend is bootstrapped using Vite's official Vue 3 template. Do this **once** in Sprint 1:

```bash
# From repo root
npx create-vite@latest apps/springboard-desktop -- --template vue-ts

# Navigate to frontend folder
cd apps/springboard-desktop

# Install dependencies
npm install

# Verify startup
npm run dev
# Should open http://localhost:5173 (Vite dev server with HMR)
```

This creates the exact Vite + Vue 3 + TypeScript structure we test against.

---

## Running Locally

### Start Azure OpenAI / Inference Engine (Required)

Azure OpenAI / Inference Engine runs as a separate process and provides the local inference API.

1. **Open Azure OpenAI / Inference Engine** (native app)
2. **Select a model** from the library (e.g., Mistral 7B, Llama 2 13B)
3. **Load model** into VRAM (watch the load progress)
4. **Start local server** on port 8000 (should show "Server is running at http://localhost:8000")

Verify with:
```bash
curl http://localhost:8000/v1/models
# Should return: {"object":"list","data":[{"id":"<model-name>","object":"model"}]}
```

### Start Backend Services

```bash
# From repo root
npm run backend

# Expected output:
# [backend] Server listening on http://localhost:3000
# [backend] Connected to SQLCipher database at %APPDATA%\SpringBoard\conversations.db
# [backend] Health check endpoint: http://health
```

Verify health:
```bash
curl http://health
# Should return: {"status":"ok","timestamp":"2026-03-04T12:00:00Z"}
```

### Start Python Services (Optional for Phase 2+)

When Office integration (Phase 2) begins:

```bash
# From services/springboard-python
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py

# Expected output:
# * Running on http://127.0.0.1:5000
```

### Start Frontend

```bash
# From apps/springboard-desktop
npm run dev

# Expected output:
# VITE v5.1.x  ready in 234 ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

**Services used**:
- App: Electron (Main + Renderer)
- Inference: http://localhost:8000 (Local LLM or Azure OpenAI endpoint)

### End-to-End Test

1. Open http://localhost:5173 in your browser
2. Type a message: "Hello, what is 2+2?"
3. Verify the AI responds (response from Azure OpenAI / Inference Engine → backend → frontend)
4. Check network logs for no external cloud calls
5. Close browser and reopen; verify message history persists

---

## Development Workflows

### File Structure

```
SpringBoard/
├── apps/
│   ├── springboard-backend/          # Node.js API server
│   │   ├── src/
│   │   │   ├── api/                  # Electron IPC route handlers
│   │   │   ├── models/               # Data models (Conversation, Permission, etc.)
│   │   │   ├── services/             # Business logic (encryption, permission validation)
│   │   │   ├── repositories/         # Database queries
│   │   │   ├── middleware/           # Authentication, logging middleware
│   │   │   └── main.ts               # Electron IPC app initialization
│   │   ├── tests/                    # Jest unit tests
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── springboard-desktop/          # Electron + Vue 3 frontend (created via npx create-vite)
│       ├── electron/
│       │   ├── main.ts               # Electron main process
│       │   ├── preload.ts            # IPC bridge to renderer
│       │   └── security.ts           # Sandbox configuration
│       ├── src/
│       │   ├── components/           # Vue 3 components (.vue files)
│       │   │   ├── ChatWindow.vue
│       │   │   ├── ConversationList.vue
│       │   │   ├── PermissionDialog.vue
│       │   │   └── ...
│       │   ├── stores/               # Pinia stores (state management)
│       │   │   ├── conversationStore.ts
│       │   │   ├── permissionStore.ts
│       │   │   └── skillStore.ts
│       │   ├── App.vue               # Root Vue component
│       │   ├── main.ts               # Vue app entry point
│       │   └── style.css             # Globals + Tailwind
│       ├── vite.config.ts            # Vite build configuration
│       ├── tsconfig.json
│       ├── package.json
│       └── index.html                # HTML entry point
│
├── services/
│   └── springboard-python/           # Python services (Azure OpenAI / AI Inference Engine bridge, Graph API, tools)
│       ├── venv/                     # Virtual environment (in .gitignore)
│       ├── main.py                   # Flask app entry point
│       ├── requirements.txt
│       └── modules/
│           ├── lm_studio_bridge.py
│           ├── graph_api_wrapper.py
│           └── Windows Sandbox (WSB)_executor.py
│
├── packages/
│   └── springboard-contracts/        # Shared TypeScript interfaces
│       ├── src/
│       │   ├── permission-schema.ts
│       │   ├── lm-studio.ts
│       │   ├── sandbox-api.ts
│       │   └── audit-log.ts
│       └── package.json
│
├── specs/001-local-ai-assistant/
│   ├── spec.md                       # Feature specification (5 user stories)
│   ├── plan.md                       # Implementation plan (architecture, constraints)
│   ├── research.md                   # Architecture decisions + alternatives
│   ├── data-model.md                 # 8 entity definitions + SQLCipher schema
│   ├── tasks.md                      # 122 tasks across 8 implementation phases
│   ├── sprint-plan.md                # Sprint roadmap (10 sprints)
│   └── contracts/                    # 4 API contracts (JSON schemas)
│
├── scripts/
│   ├── setup-dev-environment.sh      # Development environment automation
│   ├── init-db.sh                    # Database initialization
│   └── start-services.sh             # Start all local services (Azure OpenAI / Inference Engine, backend, frontend)
│
├── docs/
│   ├── DEVELOPMENT.md                # This file
│   ├── TERMINOLOGY.md                # Canonical terms (sessions, channels, skills, tasks, scripts)
│   ├── THREAT_MODEL.md               # Security threat analysis + mitigations
│   ├── ARCHITECTURE.md               # System diagrams, component overview
│   ├── SECURITY.md                   # Permission model, encryption strategy
│   └── CONTRIBUTING.md               # Code style, testing requirements, PR guidelines
│
├── package.json                      # Root monorepo configuration
├── turbo.json                        # Turbo orchestration config
├── .github/
│   └── workflows/
│       ├── build.yml                 # CI: Build all packages
│       └── test.yml                  # CI: Run all tests
│
└── README.md                         # Project overview
```

### Code Style & Standards

**TypeScript**:
- **Config**: `tsconfig.json` (src/) with `strict: true`
- **Compiler target**: `ES2020`
- **Module**: `ESNext` + Bundled by Vite/tsc
- **Rules**: No `any` types; use explicit types for function parameters and returns

**Vue 3 Components**:
- **Format**: Single-File Components (`.vue` files) with `<script setup>` syntax
- **State management**: Pinia stores (no prop-drilling for global state)
- **Styling**: Scoped Tailwind CSS within components
- **Naming**: PascalCase for components (e.g., `ChatWindow.vue`), camelCase for files in other contexts
- **Example**:
  ```vue
  <script setup lang="ts">
  import { ref } from 'vue'
  import { useConversationStore } from '@/stores/conversationStore'

  const conversationStore = useConversationStore()
  const messages = ref(conversationStore.messages)
  </script>

  <template>
    <div class="chat-window">
      <div v-for="msg in messages" :key="msg.id" class="message">
        {{ msg.content }}
      </div>
    </div>
  </template>

  <style scoped>
  .chat-window {
    @apply flex flex-col h-full bg-gray-50;
  }
  </style>
  ```

**Node.js/Electron IPC**:
- **Format**: TypeScript with strict type checking
- **Naming**: camelCase for variables/functions, PascalCase for classes/models
- **Middleware**: Signature `(req, res, next) => void`
- **Error handling**: Custom error classes extending `Error`; use try/catch in async handlers
- **Example**:
  ```typescript
  // src/models/conversation.ts
  export class Conversation {
    id: string
    title: string
    messages: Message[]
    createdAt: Date
    encryptionKey: string

    constructor(userId: string, title: string) {
      this.id = generateId()
      this.title = title
      this.messages = []
      this.createdAt = new Date()
    }

    addMessage(message: Message): void {
      this.messages.push(message)
    }
  }

  // src/api/conversations.ts
  import express, { Router } from 'express'
  export const router = Router()

  router.get('/:conversationId', (req, res) => {
    const { conversationId } = req.params
    const conversation = conversationStore.get(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: 'Not found' })
    }
    res.json(conversation)
  })
  ```

**Python**:
- **Format**: PEP 8 (black formatter)
- **Type hints**: `from typing import List, Dict, Optional`
- **Async**: Use `asyncio` for I/O-bound work
- **Example**:
  ```python
  # services/springboard-python/modules/lm_studio_bridge.py
  import asyncio
  from typing import Dict, Any
  import aiohttp

  class LMStudioBridge:
      def __init__(self, base_url: str = "http://inference endpoint"):
          self.base_url = base_url

      async def chat_completion(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
          async with aiohttp.ClientSession() as session:
              response = await session.post(
                  f"{self.base_url}/v1/chat/completions",
                  json={"messages": messages, "model": "local"}
              )
              return await response.json()
  ```

### Running Tests

**Unit Tests** (Jest):
```bash
# From repo root
npm test

# Test specific package:
npm test -- --testPathPattern=backend

# Test with coverage:
npm test -- --coverage
```

**Frontend Tests** (Vitest + Vue Test Utils):
```bash
cd apps/springboard-desktop
npm run test

# Watch mode:
npm run test:watch
```

**Integration Tests** (Mocha + Supertest):
```bash
# Backend API contract tests
npm run test:integration

# Verify health endpoint:
curl -X GET http://health
```

---

## Debugging

### VS Code Debugger Setup

**Backend (Node.js)**:

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach Backend",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"],
      "outFiles": ["${workspaceFolder}/apps/springboard-backend/dist/**"]
    }
  ]
}
```

Start backend with inspector:
```bash
node --inspect-brk apps/springboard-backend/dist/main.js
```

Then press F5 in VS Code to attach.

**Frontend (Vue 3 + Vite)**:

Install [Vue DevTools](https://devtools.vuejs.org/):
```bash
npm install -D @vue/devtools
```

Open `http://localhost:5173` in Chrome, press F12, go to Components/Stores tabs (Vue DevTools).

### Logs

**All service logs** go to:
- Frontend: Browser DevTools Console (F12)
- Backend: Console output (`npm run backend`)
- Python: Console output (if running) or `services/springboard-python/logs/` (to be configured)
- Azure OpenAI / Inference Engine: Azure OpenAI / Inference Engine UI
- SQLCipher: `%APPDATA%/SpringBoard/conversations.db` (inspect with [DB Browser for SQLCipher](https://sqlitebrowser.org/))

**Structured Audit Logs** (JSON Lines format):
```bash
# View audit logs
cat %APPDATA%\SpringBoard\audit\audit-20260304.jsonl | jq '.'

# Filter by event type
cat %APPDATA%\SpringBoard\audit\audit-20260304.jsonl | jq 'select(.eventType == "PERMISSION_GRANT")'
```

---

## Common Tasks

### Add a New Vue Component

```bash
# Create component in src/components/
# (e.g., src/components/MyNewComponent.vue)

# Use Pinia store for state:
<script setup lang="ts">
import { useMyStore } from '@/stores/myStore'
const store = useMyStore()
</script>

# Test with:
npm run test
```

### Add a New Backend API Endpoint

```typescript
// src/api/myendpoint.ts
import { Router } from 'express'
import { PermissionValidator } from '../services/permission-validator'

const router = Router()
const validator = new PermissionValidator()

router.post('/my-endpoint', async (req, res) => {
  try {
    await validator.requirePermission('my-feature')
    const result = await myBusinessLogic(req.body)
    res.json(result)
  } catch (err) {
    res.status(403).json({ error: err.message })
  }
})

export default router
```

Register in `src/main.ts`:
```typescript
import myEndpointRouter from './api/myendpoint'
app.use('/api', myEndpointRouter)
```

### Update Database Schema

```bash
# Create migration file
# (e.g., migrations/001_add_column.sql)

# Run migrations
npm run migrate:up

# Rollback
npm run migrate:down
```

---

## Troubleshooting

**"npm install" fails**:
- Check Node version: `node --version` (should be v20.x)
- Clear cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, reinstall

**"Azure OpenAI / Inference Engine connection refused" error**:
- Verify your inference engine is running and server is active.
- Verify port 8000: `curl http://localhost:8000/v1/models`
- If using non-default port, update `.env` file.

**Electron window won't open or crashes**:
- Check Electron logs in DevTools (F12)
- Hard restart: Kill all node processes, restart `npm run dev`

**Vue DevTools not showing**:
- Verify you're running dev mode: `npm run dev` (not production build)
- Open Vue DevTools via Chrome DevTools (tab: Components or Stores)

**Tests failing**:
- Update snapshots: `npm test -- -u`
- Clear Jest cache: `npm test -- --clearCache`
- Check mock servers running (for integration tests): `npm run test:integration`

**Database locked errors**:
- Ensure only one backend instance running
- Delete `%APPDATA%\SpringBoard\` and reinitialize if corrupted: `npm run migrate:fresh`

---

## Performance Profiling

### Frontend (Vite + Vue 3)

Profile component rendering in Vue DevTools:
1. Open DevTools → Vue tab
2. Select component to inspect render time
3. Check virtual scroller performance for large lists (target: <50ms render)

### Backend (Node.js)

Profile with built-in inspector:
```bash
node --prof apps/springboard-backend/dist/main.js

# Stop with Ctrl+C, then analyze:
node --prof-process isolate-*.log > profile.txt
```

### Database Queries

Enable query logging (to be configured):
```typescript
// src/lib/encrypted-db.ts - add logging
if (process.env.LOG_QUERIES === 'true') {
  console.time(`Query: ${sql}`)
  const result = stmt.all()
  console.timeEnd(`Query: ${sql}`)
}
```

---

## Getting Help

- **Questions**? Check existing GitHub issues or create a new one with `[development]` tag
- **Bug reports**: Include OS version, Node version, error logs from console
- **Architecture questions**: Refer to `specs/001-local-ai-assistant/research.md`
- **Terminology questions**: Refer to `docs/TERMINOLOGY.md` before adding/changing terms in specs, tasks, or sprint docs
- **PR reviews**: See `docs/CONTRIBUTING.md` for code style and testing requirements

---

## Next Steps

- [ ] Complete Sprint 0 sign-off on all 5 user stories (specs/001-local-ai-assistant/sprint-0-review.md)
- [ ] Plan Sprint 1 final technical details (T001–T008: setup tasks)
- [ ] Begin Sprint 1 when sign-off complete

**Ready to start coding? Jump to Sprint 1: `npm run backend` + `npm run dev` and follow the tasks in `tasks.md`.**
