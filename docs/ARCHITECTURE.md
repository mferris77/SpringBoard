# SpringBoard Architecture

## System Overview

SpringBoard is a local-first AI assistant built with Electron, Node.js, and Python.

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (Electron + Vue 3 + Vite)                  │
└────────────────────┬────────────────────────────────────┘
                     │ IPC
┌────────────────────┴────────────────────────────────────┐
│                  Backend Services                        │
│              (Node.js in Electron Main)                 │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐ │
│  │ Permission   │ │ LLM Service │ │ Config Manager   │ │
│  │ Manager      │ │             │ │                  │ │
│  └──────────────┘ └─────────────┘ └──────────────────┘ │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐ │
│  │ Audit Logger │ │ Skill Loader│ │ Database (SQLite)│ │
│  └──────────────┘ └─────────────┘ └──────────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────┴────────────────────────────────────┐
│              Python Services (Isolated)                  │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────────┐ │
│  │ LM Studio    │ │ Graph API   │ │ Docker Executor  │ │
│  │ Bridge       │ │ Adapter     │ │                  │ │
│  └──────────────┘ └─────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Frontend (Electron Renderer)
- Vue 3 + Vite for fast development
- PrimeVue components for UI
- Pinia for state management
- IPC communication with backend

### Backend (Electron Main / Node.js)
- Permission management and validation
- SQLCipher encrypted database
- Configuration file watching (SOUL.md, AGENTS.md, USER.md)
- Audit logging (JSON Lines)
- Skill orchestration

### Python Services
- LM Studio HTTP client
- Microsoft Graph API adapter
- Windows COM automation
- Docker container management

## Data Flow

1. **User Request** → Frontend (Vue component)
2. **IPC Call** → Backend (Node.js handler)
3. **Permission Check** → Permission Manager
4. **LLM Inference** → Python → LM Studio
5. **Response** → Backend → Frontend
6. **Audit Log** → JSON Lines file

## Security Model

- **Zero Cloud Transmission**: All data stays local by default
- **Encrypted Storage**: SQLCipher with AES-256-GCM
- **Permission Gates**: Explicit grants for all resources
- **Sandboxed Execution**: Docker containers for tools
- **Audit Trail**: Complete logging of all actions

## Testing Strategy

- **Unit Tests**: Jest for TypeScript, pytest for Python
- **Contract Tests**: Mock external APIs
- **Integration Tests**: End-to-end flows
- **Security Tests**: Permission boundary validation

## Deployment Target

- **Platform**: Windows 10/11 (x64)
- **Packaging**: electron-builder
- **Distribution**: MSIX/EXE installer
- **Auto-update**: Electron updater (future)
