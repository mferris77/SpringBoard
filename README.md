# SpringBoard: Local-First AI Assistant

> **Status**: Sprint 1 Complete ✅ - Project foundation established  
> **Current Sprint**: Sprint 2 Starting (Security Foundation)

SpringBoard is a security-first, local-first AI assistant for workplace environments. It prioritizes data privacy by running LLM inference locally (or via private Azure OpenAI endpoints) and storing all conversation data in an encrypted local database.

## Current Status

**Sprint 1 Complete** (Infrastructure Setup):
- ✅ Monorepo structure with npm workspaces
- ✅ Backend service (Node.js/TypeScript) with SQLCipher
- ✅ Frontend scaffold (Electron + Vue 3 + Vite)
- ✅ Python services structure (Flask)
- ✅ Shared TypeScript contracts package
- ✅ Database migrations (4 tables: conversations, permissions, skills, scheduled_tasks)
- ✅ GitHub templates and documentation scaffold

**Next Up** (Sprint 2 - Security Foundation):
- Permission management system
- Encryption services (AES-256-GCM)
- Audit logging (JSON Lines format)
- Configuration hot-reload (SOUL.md, AGENTS.md, USER.md)

## Architecture

> **Note**: Project uses monorepo structure. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

### Workspaces

- **apps/springboard-desktop**: Electron + Vue 3 frontend
- **apps/springboard-backend**: Node.js backend (Electron Main)
- **packages/springboard-contracts**: Shared TypeScript types
- **services/springboard-python**: Python services (LM Studio, Graph API)

### Technology Stack

- **Frontend**: Vue 3 + Vite + Tailwind CSS (Electron Renderer)
- **Backend**: Node.js (Electron Main Process)
- **Database**: SQLCipher with `sqlite-vec` for semantic search
- **Inference**: Azure OpenAI / Local Inference Engine (OpenAI API compatible)
- **Sandboxing**: Windows Sandbox (WSB) for safe tool execution
- **Automation**: Integration with Microsoft Office (Graph API via MSAL Node)

## Prerequisites

- **Windows 10/11 Pro/Enterprise** (for Windows Sandbox support)
- **Node.js 20 LTS**
- **Python 3.11**
- **Windows Sandbox** feature enabled

## Quick Start

1. **Install Dependencies**:
   ```bash
   # Install Node dependencies (all workspaces)
   npm install
   
   # Install Python dependencies
   cd services/springboard-python
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   cd ../..
   
   # Initialize database
   node scripts/init-db.js
   ```

2. **Configure Environment**:
   ```bash
   # Backend environment (apps/springboard-backend/.env)
   DATABASE_PATH=%APPDATA%\SpringBoard\springboard.db
   DATABASE_KEY=your-32-byte-hex-key
   
   # Python environment (services/springboard-python/.env)
   INFERENCE_ENDPOINT=http://localhost:1234/v1
   ```

3. **Start the App**:
   ```bash
   # Development mode (all services)
   npm run dev
   
   # Or start services individually:
   npm run dev:desktop   # Frontend (Electron+Vue)
   npm run dev:backend   # Backend (Node)
   npm run dev:python    # Python services (Flask)
   ```

4. **Verify Setup**:
   ```bash
   # Run tests
   npm test
   
   # Build all workspaces
   npm run build
   ```

## Key Documentation

- [Development Guide](DEVELOPMENT.md) - Detailed setup and workflows
- [Architecture Guide](docs/ARCHITECTURE.md) - System architecture
- [Contributing Guide](docs/CONTRIBUTING.md) - Development standards
- [Sprint Plan](specs/001-local-ai-assistant/sprint-plan.md) - Project roadmap
- [Windows Sandbox Setup](docs/WINDOWS_SANDBOX_SETUP.md) - Sandboxing instructions
- [Terminology](docs/TERMINOLOGY.md) - Canonical definitions

## Compliance & Security

SpringBoard follows the **Local-First Constitution**:
1. Local-First (No mandatory cloud storage)
2. Security-First (Sandboxed tools, encrypted DB)
3. Audit-Ready (100% action logging)
4. Offline Capable (Local LLM support)
