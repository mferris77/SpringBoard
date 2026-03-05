# SpringBoard: Local-First AI Assistant

SpringBoard is a security-first, local-first AI assistant for workplace environments. It prioritizes data privacy by running LLM inference locally (or via private Azure OpenAI endpoints) and storing all conversation data in an encrypted local database.

## Architecture

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
   npm install
   ```

2. **Configure Environment**:
   - Create a `.env` file in the root.
   - Set `INFERENCE_ENDPOINT=http://localhost:8000` (or your Azure/LM Studio URL).

3. **Start the App**:
   ```bash
   npm run dev
   ```

## Key Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed setup and workflows
- [Sprint Plan](specs/001-local-ai-assistant/sprint-plan.md) - Project roadmap
- [Windows Sandbox Setup](docs/WINDOWS_SANDBOX_SETUP.md) - Sandboxing instructions
- [Terminology](docs/TERMINOLOGY.md) - Canonical definitions

## Compliance & Security

SpringBoard follows the **Local-First Constitution**:
1. Local-First (No mandatory cloud storage)
2. Security-First (Sandboxed tools, encrypted DB)
3. Audit-Ready (100% action logging)
4. Offline Capable (Local LLM support)
