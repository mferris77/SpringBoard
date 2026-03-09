# SpringBoard Contracts

Shared TypeScript contracts and schemas for SpringBoard Local-First AI Assistant.

## Overview

This package provides type-safe contracts for:
- **Permission Schema**: Permission grants, scopes, and validation
- **Audit Schema**: Audit log events and queries
- **LM Studio API**: OpenAI-compatible chat completions
- **Sandbox API**: Docker container execution

## Usage

```typescript
import {
  PermissionScope,
  PermissionGrantRequest,
  AuditEventType,
  LMStudioChatRequest,
  SandboxStartRequest
} from '@springboard/contracts';

// Example: Permission grant
const grantRequest: PermissionGrantRequest = {
  scope: PermissionScope.OUTLOOK_CALENDAR_READ,
  ttl: 3600, // 1 hour
};

// Example: Audit log entry
const auditEntry: AuditLogEntry = {
  id: 'audit-123',
  timestamp: new Date().toISOString(),
  eventType: AuditEventType.PERMISSION_GRANT,
  actor: 'user@example.com',
  outcome: AuditOutcome.SUCCESS,
  details: { scope: 'outlook-calendar-read' },
};
```

## Development

```bash
# Build contracts
npm run build

# Watch mode
npm run dev

# Type check
npm run typecheck
```

## Exports

Modular exports for tree-shaking:

```typescript
import { PermissionScope } from '@springboard/contracts/permission-schema';
import { AuditEventType } from '@springboard/contracts/audit-schema';
import { LMStudioChatRequest } from '@springboard/contracts/lm-studio';
import { SandboxStartRequest } from '@springboard/contracts/sandbox-api';
```
