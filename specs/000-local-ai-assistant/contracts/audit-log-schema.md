# Audit Log Schema & Contract

**Version**: 1.0.0 | **Last Updated**: March 3, 2026
**Purpose**: Specification for security audit trail, compliance logging, and event tracking

---

## Overview

The audit log provides a complete record of all security-relevant events for compliance review, incident investigation, and user transparency. All events are:
- **Immutable**: Append-only (no deletion/modification in normal operation)
- **Timestamped**: ISO 8601 with millisecond precision
- **Structured**: JSON Lines format for easy parsing and querying
- **Attributed**: Each event includes actor, resource, action, outcome
- **Rotated**: Daily + size-based rotation (keep 90 days by default)

---

## Event Types & Schemas

### Event: Permission Grant

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "timestamp": "2026-03-03T09:15:23.456Z",
  "event_type": "permission_grant",
  "actor": "mark.ferris@contoso.com",
  "action": "grant",
  "resource_type": "permission",
  "resource_id": "outlook-calendar-read",
  "outcome": "success",
  "severity": "info",
  "details": {
    "scope": "outlook-calendar-read",
    "granted_at": "2026-03-03T09:15:23Z",
    "expires_at": "2026-06-03T09:15:23Z",
    "approval_method": "user_prompt",
    "display_context": "Assistant wants to read your Outlook calendar to check availability",
    "ttl_days": 90
  }
}
```

**Fields**:
- `scope`: Permission granted (canonical PermissionScope enum)
- `approval_method`: How permission was granted ("user_prompt", "skill_declaration", "system_default")
- `expires_at`: When permission expires (null = permanent)
- `ttl_days`: Temporary permission lifetime in days

---

### Event: Permission Revoke

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "timestamp": "2026-03-03T10:45:00.123Z",
  "event_type": "permission_revoke",
  "actor": "mark.ferris@contoso.com",
  "action": "revoke",
  "resource_type": "permission",
  "resource_id": "outlook-mail-read",
  "outcome": "success",
  "severity": "info",
  "details": {
    "scope": "outlook-mail-read",
    "revocation_reason": "user_explicit",
    "was_active": true,
    "revocation_timestamp": "2026-03-03T10:45:00Z"
  }
}
```

**Fields**:
- `scope`: Permission revoked
- `revocation_reason`: Why revoked ("user_explicit", "permission_expired", "skill_uninstall", "compliance_audit", "other")
- `was_active`: Whether permission was active at time of revocation

---

### Event: Permission Check (Inline Audit)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "timestamp": "2026-03-03T11:20:45.789Z",
  "event_type": "permission_check",
  "actor": "springboard:skill:outlook-briefing",
  "action": "check",
  "resource_type": "permission",
  "resource_id": "outlook-calendar-read",
  "outcome": "success",
  "severity": "info",
  "details": {
    "scope": "outlook-calendar-read",
    "granted": true,
    "is_expired": false,
    "permission_check_timestamp": "2026-03-03T11:20:45Z"
  }
}
```

**Use**: Logged on every permission check during skill execution (for transparency, not compliance-critical)

---

### Event: Tool Execution Start

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "timestamp": "2026-03-03T12:00:00.000Z",
  "event_type": "tool_execution_start",
  "actor": "mark.ferris@contoso.com",
  "action": "execute",
  "resource_type": "tool",
  "resource_id": "filesystem-read",
  "outcome": "started",
  "severity": "info",
  "details": {
    "tool_name": "filesystem-read",
    "required_scope": "filesystem-read",
    "parameters": {
      "path": "C:\\Users\\MarkFerris\\Documents"
    },
    "mounts": [
      {
        "host_path": "C:\\Users\\MarkFerris\\Documents",
        "container_path": "/work/documents",
        "read_only": true
      }
    ],
    "timeout_seconds": 30,
    "memory_limit_mb": 512
  }
}
```

**Note**: Sensitive parameters (passwords, keys) are redacted before logging.

---

### Event: Tool Execution Complete

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "timestamp": "2026-03-03T12:00:05.234Z",
  "event_type": "tool_execution_complete",
  "actor": "mark.ferris@contoso.com",
  "action": "execute",
  "resource_type": "tool",
  "resource_id": "filesystem-read",
  "outcome": "success",
  "severity": "info",
  "details": {
    "tool_name": "filesystem-read",
    "exit_code": 0,
    "duration_ms": 5234,
    "container_id": "a1b2c3d4e5f6",
    "output_size_bytes": 1024,
    "output_truncated": false,
    "completion_timestamp": "2026-03-03T12:00:05.234Z"
  }
}
```

**Fields**:
- `exit_code`: Tool exit status (0 = success, non-zero = failure)
- `duration_ms`: Actual execution time
- `container_id`: Windows Sandbox ID (for forensics)
- `output_size_bytes`: Actual output size (before truncation)

---

### Event: Tool Execution Failed

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "timestamp": "2026-03-03T12:01:30.567Z",
  "event_type": "tool_execution_failed",
  "actor": "mark.ferris@contoso.com",
  "action": "execute",
  "resource_type": "tool",
  "resource_id": "shell-execute",
  "outcome": "failure",
  "severity": "warning",
  "details": {
    "tool_name": "shell-execute",
    "error_code": "timeout",
    "error_message": "Tool execution timeout after 30000ms",
    "duration_ms": 30001,
    "failure_timestamp": "2026-03-03T12:01:30Z"
  }
}
```

---

### Event: Tool Execution Denied (Permission)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440007",
  "timestamp": "2026-03-03T12:02:00.111Z",
  "event_type": "tool_execution_denied",
  "actor": "mark.ferris@contoso.com",
  "action": "execute",
  "resource_type": "tool",
  "resource_id": "shell-execute",
  "outcome": "denied",
  "severity": "warning",
  "details": {
    "tool_name": "shell-execute",
    "reason": "permission_not_granted",
    "required_scope": "shell-execute",
    "denial_timestamp": "2026-03-03T12:02:00Z"
  }
}
```

---

### Event: Skill Installation

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440008",
  "timestamp": "2026-03-03T13:00:00.000Z",
  "event_type": "skill_install",
  "actor": "mark.ferris@contoso.com",
  "action": "install",
  "resource_type": "skill",
  "resource_id": "outlook-calendar-briefing:1.0.0",
  "outcome": "success",
  "severity": "info",
  "details": {
    "skill_id": "outlook-calendar-briefing",
    "skill_name": "Outlook Calendar Daily Briefing",
    "skill_version": "1.0.0",
    "author": "contoso-team",
    "required_permissions": [
      "outlook-calendar-read"
    ],
    "install_method": "user_manual",
    "installation_timestamp": "2026-03-03T13:00:00Z"
  }
}
```

---

### Event: Skill Execution

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440009",
  "timestamp": "2026-03-03T14:30:00.000Z",
  "event_type": "skill_execution",
  "actor": "mark.ferris@contoso.com",
  "action": "execute",
  "resource_type": "skill",
  "resource_id": "outlook-calendar-briefing",
  "outcome": "success",
  "severity": "info",
  "details": {
    "skill_id": "outlook-calendar-briefing",
    "skill_version": "1.0.0",
    "invocation_context": "user_request",
    "required_permissions": ["outlook-calendar-read"],
    "permissions_granted": ["outlook-calendar-read"],
    "permissions_missing": [],
    "execution_timestamp": "2026-03-03T14:30:00Z",
    "duration_ms": 2345,
    "result_summary": "Retrieved 5 calendar events for 2026-03-04"
  }
}
```

**Fields**:
- `invocation_context`: How skill was triggered ("user_request", "scheduled_task", "auto_triggered")
- `permissions_granted`: List of permissions actually available at execution time
- `permissions_missing`: List of required permissions that were not granted
- `result_summary`: Outcome of skill execution (not detailed output, just summary)

---

### Event: Configuration Change

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "timestamp": "2026-03-03T15:45:30.000Z",
  "event_type": "config_change",
  "actor": "mark.ferris@contoso.com",
  "action": "modify",
  "resource_type": "config",
  "resource_id": "SOUL.md",
  "outcome": "success",
  "severity": "info",
  "details": {
    "config_file": "SOUL.md",
    "change_type": "content_updated",
    "previous_hash": "abc123def456",
    "new_hash": "789ghi012jkl",
    "schema_version": "1.0.0",
    "validation_status": "valid",
    "change_timestamp": "2026-03-03T15:45:30Z",
    "fields_changed": ["personality.tone", "personality.formality"]
  }
}
```

**Fields**:
- `config_file`: Which config (SOUL.md, AGENTS.md, USER.md)
- `change_type`: "content_updated", "file_created", "file_deleted"
- `previous_hash`: SHA-256 hash of previous content (for integrity checking)
- `fields_changed`: Which config fields changed (for audit trail)

---

### Event: Authentication / Session

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440011",
  "timestamp": "2026-03-03T16:00:00.000Z",
  "event_type": "authentication_success",
  "actor": "mark.ferris@contoso.com",
  "action": "authenticate",
  "resource_type": "session",
  "resource_id": "entra-id",
  "outcome": "success",
  "severity": "info",
  "details": {
    "auth_method": "entra_id",
    "user_principal_name": "mark.ferris@contoso.com",
    "authentication_timestamp": "2026-03-03T16:00:00Z",
    "success": true
  }
}
```

---

### Event: Conversation Created

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440012",
  "timestamp": "2026-03-03T16:15:00.000Z",
  "event_type": "conversation_created",
  "actor": "mark.ferris@contoso.com",
  "action": "create",
  "resource_type": "conversation",
  "resource_id": "conv-abc123def456",
  "outcome": "success",
  "severity": "info",
  "details": {
    "conversation_id": "conv-abc123def456",
    "user_principal_name": "mark.ferris@contoso.com",
    "creation_timestamp": "2026-03-03T16:15:00Z"
  }
}
```

---

## Audit Log File Format

**Location**: `%APPDATA%/SpringBoard/audit/audit-YYYY-MM-DD.jsonl`

**Format**: JSON Lines (one event per line, no formatting):

```jsonl
{"id":"550e8400-e29b-41d4-a716-446655440001","timestamp":"2026-03-03T09:15:23.456Z",...}
{"id":"550e8400-e29b-41d4-a716-446655440002","timestamp":"2026-03-03T10:45:00.123Z",...}
{"id":"550e8400-e29b-41d4-a716-446655440003","timestamp":"2026-03-03T11:20:45.789Z",...}
```

**Rotation Policy**:
- **Daily**: New file created at 00:00 UTC (midnight)
- **Size-based**: Rotate if file > 100 MB
- **Retention**: Keep 90 days of logs by default (configurable in SOUL.md)
- **Archival**: Old logs can be zipped for long-term storage

---

## Audit Logger Implementation

```typescript
// src/services/audit-logger.ts

import * as fs from "fs";
import * as path from "path";

export interface AuditLogEvent {
  id?: string;
  timestamp?: string;
  event_type: string;
  actor: string;
  action: string;
  resource_type: string;
  resource_id: string;
  outcome: "success" | "failure" | "denied" | "started";
  severity: "info" | "warning" | "error" | "critical";
  details: Record<string, any>;
}

export class AuditLogger {
  private auditDir: string;

  constructor(auditDir = `${process.env.APPDATA}/SpringBoard/audit`) {
    this.auditDir = auditDir;
    this.ensureDir();
  }

  async log(event: AuditLogEvent): Promise<void> {
    const fullEvent: AuditLogEvent & { id: string; timestamp: string } = {
      ...event,
      id: event.id || this.generateId(),
      timestamp: event.timestamp || new Date().toISOString(),
    };

    const logFile = this.getLogFilePath();
    const line = JSON.stringify(fullEvent) + "\n";

    // Append to file (async, non-blocking)
    return new Promise((resolve, reject) => {
      fs.appendFile(logFile, line, (err) => {
        if (err) {
          console.error("Audit log write failed:", err);
          reject(err);
        } else {
          // Check for rotation
          this.rotateIfNeeded().catch((e) =>
            console.error("Audit log rotation failed:", e)
          );
          resolve();
        }
      });
    });
  }

  async query(
    eventType?: string,
    actor?: string,
    outcome?: string,
    beforeDate?: Date
  ): Promise<AuditLogEvent[]> {
    const files = fs.readdirSync(this.auditDir).filter((f) => f.startsWith("audit-"));
    const results: AuditLogEvent[] = [];

    for (const file of files) {
      const filePath = path.join(this.auditDir, file);
      const lines = fs
        .readFileSync(filePath, "utf-8")
        .split("\n")
        .filter((l) => l.length > 0);

      for (const line of lines) {
        try {
          const event: AuditLogEvent = JSON.parse(line);
          if (
            (!eventType || event.event_type === eventType) &&
            (!actor || event.actor === actor) &&
            (!outcome || event.outcome === outcome) &&
            (!beforeDate || new Date(event.timestamp!) <= beforeDate)
          ) {
            results.push(event);
          }
        } catch (e) {
          console.warn("Failed to parse audit log line:", line);
        }
      }
    }

    return results.sort((a, b) =>
      new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
    );
  }

  private getLogFilePath(): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.auditDir, `audit-${date}.jsonl`);
  }

  private async rotateIfNeeded(): Promise<void> {
    const logFile = this.getLogFilePath();
    const stats = fs.statSync(logFile);
    if (stats.size > 100 * 1024 * 1024) {
      // 100 MB
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFile = `${logFile}.${timestamp}.bak`;
      fs.renameSync(logFile, backupFile);
      console.info(`Audit log rotated: ${backupFile}`);
    }
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.auditDir)) {
      fs.mkdirSync(this.auditDir, { recursive: true });
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}
```

---

## Query Examples (for compliance review)

```typescript
const auditLogger = new AuditLogger();

// Find all permission grants
const grants = await auditLogger.query("permission_grant");

// Find all tool executions by user in last 7 days
const toolExecs = await auditLogger.query(
  "tool_execution_complete",
  "mark.ferris@contoso.com",
  undefined,
  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
);

// Find failed/denied operations
const failures = await auditLogger.query(undefined, undefined, "failure");
failures.concat(await auditLogger.query(undefined, undefined, "denied"));

// Find specific skill executions
const skillExecs = await auditLogger.query("skill_execution");
```

---

## Compliance & Retention

**HIPAA Compliance**:
- ✅ All access to protected health information logged (if Word/Excel contains PHI)
- ✅ Audit trail immutable (append-only)
- ✅ Retention: 6 years (configure in SOUL.md)
- ✅ Access controls: Audit log queryable only by administrators

**SOC 2 Compliance**:
- ✅ User access (authentication events)
- ✅ Data access (permission grants, tool executions)
- ✅ Configuration changes (SOUL/AGENTS/USER modifications)
- ✅ Security events (permission denials, failed operations)

---

**Next Step**: Implement quickstart.md guide for developers.
