# SpringBoard Backend

Node.js backend service for SpringBoard Local-First AI Assistant.

## Overview

This backend runs in the Electron main process and provides:
- Permission management and validation
- LLM integration (LM Studio API)
- Database operations (SQLCipher)
- Configuration management (SOUL.md, AGENTS.md, USER.md)
- Audit logging
- Tool orchestration

## Development

```bash
# Install dependencies
npm install

# Run in development mode (hot reload)
npm run dev

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Lint and format
npm run lint
npm run format

# Build
npm run build
```

## Architecture

- **IPC Communication**: Electron IPC for frontend-backend communication
- **Database**: SQLCipher for encrypted local storage
- **Logging**: Pino for structured JSON logging
- **Config**: File-based YAML/Markdown configuration with hot-reload

## Tests

- Unit tests: `tests/unit/**/*.test.ts`
- Integration tests: `tests/integration/**/*.test.ts`
- Contract tests: `__mocks__/**/*.ts`
