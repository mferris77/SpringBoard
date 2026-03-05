# Data Model & Entity Definitions: SpringBoard Local-First AI Assistant

**Status**: Phase 1 Design | **Date**: March 3, 2026
**Purpose**: Formal entity definitions, relationships, state machines, and validation rules

---

## Core Entities

### 1. Conversation

Represents a chat session between a user and the AI assistant.

**Entity Name**: `Conversation`

**Attributes**:
- `id`: UUID (primary key)
- `created_at`: ISO 8601 timestamp
- `updated_at`: ISO 8601 timestamp
- `title`: string (auto-generated or user-provided summary)
- `message_count`: integer
- `encrypted`: boolean (always true; indicates encryption method applied)
- `encryption_version`: string (e.g., "sodium-1.0" for validation on decrypt)
- `user_principal_name`: string (Entra ID identity or local username)
- `metadata`: JSON object (model used, skill context, etc.)

**Relationships**:
- 1 Conversation : N Messages
- Related to Permission Grants (conversation may have required specific permissions)

**Storage**: SQLCipher encrypted database at `%APPDATA%/SpringBoard/conversations.db`

**Validation Rules**:
- `title` must be non-empty and <256 characters
- `message_count` must match actual message count in Messages table
- `encryption_version` must be recognized by decryption service (prevent future format changes)

**State**: 
- **Active**: Conversation open in UI, receiving new messages
- **Archived**: User marked as complete (read-only, still searchable)
- **Deleted**: Soft delete (marked for deletion, recoverable within 30 days)

---

### 2. Message

Represents a single message within a conversation (user or AI response).

**Entity Name**: `Message`

**Attributes**:
- `id`: UUID (primary key)
- `conversation_id`: UUID (foreign key to Conversation)
- `author`: enum ["user", "assistant", "system"]
- `content`: string (message text or JSON for structured tool results)
- `created_at`: ISO 8601 timestamp
- `tokens_used`: integer (approximate, for observability)
- `model_name`: string (e.g., "mistral-7b" for assistant messages; null for user/system)
- `metadata`: JSON object (tool calls, citations, confidence score if applicable)

**Relationships**:
- N Messages : 1 Conversation
- Messages may reference Tool Execution Records (in metadata)

**Storage**: Encrypted in SQLCipher database (same as Conversation)

**Validation Rules**:
- `author` must be one of enum values
- `content` must be non-empty and <64KB (configurable limit)
- `model_name` must be null for user/system, non-null for assistant
- `tokens_used` estimate (actual token count from Azure OpenAI / Inference Engine inference)

**Content Schema (if JSON structure)**:
```json
{
  "type": "text|tool_result|error",
  "body": "visible message text",
  "tool_calls": [
    {
      "tool_id": "outlook-calendar-read",
      "parameters": { "... parsed from LLM ..." },
      "execution_record_id": "UUID ref to Tool Execution Record"
    }
  ]
}
```

---

### 3. Permission Grant

Represents an explicit authorization for a capability.

**Entity Name**: `PermissionGrant`

**Attributes**:
- `id`: UUID (primary key)
- `scope`: string enum (e.g., "outlook-calendar-read", "word-document-read", "shell-execute")
- `granted_at`: ISO 8601 timestamp
- `granted_by`: enum ["user", "system", "imported"] (how permission was granted)
- `expires_at`: ISO 8601 timestamp | null (null = permanent)
- `revoked_at`: ISO 8601 timestamp | null (null = active)
- `revocation_reason`: string | null (why permission was revoked)
- `grant_metadata`: JSON object (e.g., `{"resource_filter": "calendar_id"}` for scoped grants)

**Relationships**:
- Permission Grants : Audit Log Entries (grant event logged)
- Permission Grants : Skill Executions (skill must have required scopes at execution time)

**Storage**: SQLCipher in permissions table

**Validation Rules**:
- `scope` must be in canonical permissions registry (enum)
- `granted_at` < `expires_at` (if expiry set)
- `revoked_at` must be after `granted_at` (logical consistency)
- `grant_metadata` validated against scope (e.g., outlook scopes can have resource_filter)

**State Machine**:
```
[Granted] ──(expires_at reached)--> [Expired]
   ↓
[Active] ──(revoke_permission)--> [Revoked]
```

**Permission Scope Registry** (canonical enum):
```typescript
enum PermissionScope {
  // Outlook
  "outlook-calendar-read",
  "outlook-calendar-write",
  "outlook-mail-read",
  "outlook-mail-send",
  "outlook-contacts-read",
  
  // Word
  "word-document-read",
  "word-document-write",
  
  // Excel
  "excel-worksheet-read",
  "excel-worksheet-write",
  
  // Local Tools
  "filesystem-read",
  "filesystem-write",
  "shell-execute",
  "browser-automation",
  
  // System
  "audit-log-read",
  "config-read",
  "config-write",
  "skill-install",
  "skill-uninstall"
}
```

---

### 4. Skill

Represents a pluggable AI capability or workflow.

**Entity Name**: `Skill`

**Attributes**:
- `id`: string (e.g., "outlook-calendar-daily-briefing")
- `name`: string
- `description`: string (what the skill does)
- `version`: semver string (e.g., "1.2.0")
- `author`: string (person or organization)
- `enabled`: boolean
- `installed_at`: ISO 8601 timestamp
- `updated_at`: ISO 8601 timestamp
- `manifest_path`: string (filesystem path to skill.json or skill.yaml)
- `required_permissions`: PermissionScope[] (declared in manifest)
- `config_schema`: JSON schema (configuration parameters for skill)
- `config`: JSON object (current configuration)
- `metadata`: JSON object (tags, dependencies, compatibility notes)

**Relationships**:
- Skill : PermissionGrants (skill requires declared scopes)
- Skill : SkillExecutionRecords (skill invoked with recorded outcome)

**Storage**: 
- Manifest: YAML/JSON in `%APPDATA%/SpringBoard/skills/{core-skills|user-skills}/{skill-id}/`
- Metadata: Indexed in SQLCipher skills table

**Validation Rules**:
- `id` must be lowercase alphanumeric + hyphens
- `version` must follow semantic versioning
- `required_permissions` must be subset of canonical PermissionScope registry
- `config_schema` must be valid JSON Schema draft 7
- `config` must validate against `config_schema`
- Manifest must contain all required fields (name, description, version, required_permissions)

**Manifest Example** (YAML format):
```yaml
id: outlook-calendar-daily-briefing
name: Outlook Calendar Daily Briefing
description: Summarize calendar events for the day
version: 1.0.0
author: SpringBoard Team
required_permissions:
  - outlook-calendar-read
config_schema:
  type: object
  properties:
    start_hour:
      type: integer
      description: "Hour to run briefing (24-hour format)"
      minimum: 0
      maximum: 23
entrypoint: briefing.js
dependencies:
  - "@azure/identity"
  - "axios"
```

---

### 5. Scheduled Task (Heartbeat)

Represents a proactive task configured to run on a schedule.

**Entity Name**: `ScheduledTask`

**Attributes**:
- `id`: UUID (primary key)
- `name`: string
- `description`: string
- `skill_id`: string (reference to Skill)
- `schedule`: cron expression (e.g., "0 9 * * MON-FRI" = 9 AM weekdays)
- `enabled`: boolean
- `required_permissions`: PermissionScope[] (inherited from skill at task creation)
- `created_at`: ISO 8601 timestamp
- `last_executed_at`: ISO 8601 timestamp | null
- `next_scheduled_at`: ISO 8601 timestamp (calculated from schedule + last_executed_at)
- `execution_timeout_seconds`: integer (max time to run)
- `metadata`: JSON object (last error, retry count, etc.)

**Relationships**:
- ScheduledTask : Skill (task invokes skill)
- ScheduledTask : AuditLogEntry (each execution is logged)

**Storage**: SQLCipher scheduled_tasks table

**Validation Rules**:
- `schedule` must be valid cron expression (5–6 field format)
- `next_scheduled_at` calculated from CronParser; never in past
- If `enabled` = false, scheduler ignores task
- `execution_timeout_seconds` must be > 0 and reasonable (<3600 typical)

**State Machine**:
```
[Scheduled] ──(time arrives + task enabled)--> [Running]
   ↓                                              ↓
[Active]                                    [Completed / Failed]
   ↑                                              ↓
   └──────(user enables/disables)────────────────┘
```

---

### 6. Tool Execution Record

Represents a logged execution of an isolated tool (filesystem, shell, browser).

**Entity Name**: `ToolExecutionRecord`

**Attributes**:
- `id`: UUID (primary key)
- `tool_name`: string enum (e.g., "filesystem-read", "shell-execute", "browser-automation")
- `invoked_at`: ISO 8601 timestamp
- `invoked_by`: string (user principal name or skill_id)
- `parameters`: JSON object (sanitized; redacted if sensitive)
- `granted_scope`: PermissionScope (which permission was checked at execution time)
- `permission_granted`: boolean (permission check result)
- `execution_status`: enum ["success", "failed", "timeout", "permission_denied"]
- `exit_code`: integer | null (0 = success for shell tools)
- `output`: string | null (truncated to 10KB; full output in separate log file)
- `error_message`: string | null
- `execution_duration_ms`: integer
- `Windows Sandbox (WSB)_container_id`: string | null (if executed in container)

**Relationships**:
- ToolExecutionRecord : Message (tool execution associated with message)
- ToolExecutionRecord : AuditLogEntry (execution event logged)

**Storage**: SQLCipher tool_executions table + audit log (same event in both places)

**Validation Rules**:
- `tool_name` must be in canonical tools registry
- `parameters` must not contain passwords, tokens, PII (sanitization applied before logging)
- `execution_duration_ms` > 0 and reasonable (<60000 typical)
- `exit_code` must be integer 0–255 (if tool produces it)

**Parameters Sanitization Example**:
```
Input:  { "command": "Get-Outlook-Email", "password": "SecurePassword123" }
Logged: { "command": "Get-Outlook-Email", "password": "[REDACTED]" }
```

---

### 7. Audit Log Entry

Represents a security-relevant event for compliance tracking.

**Entity Name**: `AuditLogEntry`

**Attributes**:
- `id`: UUID (primary key)
- `timestamp`: ISO 8601 timestamp
- `event_type`: string enum (see EventType registry below)
- `actor`: string (user principal name, system, or skill_id)
- `action`: string (e.g., "grant", "revoke", "execute")
- `resource_type`: string (e.g., "permission", "tool", "config", "skill")
- `resource_id`: string (e.g., permission scope, tool name, config file)
- `outcome`: enum ["success", "failure", "denied"]
- `details`: JSON object (scope-dependent metadata)
- `severity`: enum ["info", "warning", "error", "critical"]

**Relationships**:
- AuditLogEntry : PermissionGrant (permission event)
- AuditLogEntry : ToolExecutionRecord (tool execution event)
- AuditLogEntry : Message (conversation event, optional)

**Storage**: JSON Lines format (append-only) in `%APPDATA%/SpringBoard/audit/audit-*.jsonl` (daily rotation)

**Audit Log Entry Example** (JSON):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-03-03T09:15:23Z",
  "event_type": "permission_grant",
  "actor": "Mark.Ferris@contoso.com",
  "action": "grant",
  "resource_type": "permission",
  "resource_id": "outlook-calendar-read",
  "outcome": "success",
  "details": {
    "permission_scope": "outlook-calendar-read",
    "expires_at": "2026-04-03T09:15:23Z",
    "approval_method": "user_prompt"
  },
  "severity": "info"
}
```

**EventType Registry**:
```typescript
enum EventType {
  "permission_grant",
  "permission_revoke",
  "permission_check",
  "tool_execution_start",
  "tool_execution_complete",
  "skill_install",
  "skill_uninstall",
  "skill_execution",
  "config_change",
  "authentication_success",
  "authentication_failure",
  "conversation_created",
  "conversation_deleted"
}
```

---

### 8. Configuration Profile

Represents user customization in SOUL.md, AGENTS.md, or USER.md.

**Entity Name**: `ConfigurationProfile`

**Attributes**:
- `id`: UUID (primary key)
- `profile_type`: enum ["soul", "agents", "user"]
- `file_path`: string (Windows path)
- `content`: string (YAML/Markdown source)
- `last_modified`: ISO 8601 timestamp
- `validation_status`: enum ["valid", "invalid", "warning"]
- `validation_errors`: string[] (if status = invalid)
- `content_version`: semver string (tracks schema version)
- `active`: boolean (whether profile is currently loaded)

**Relationships**:
- ConfigurationProfile : AuditLogEntry (config change logged on write)

**Storage**: Filesystem in YAML/Markdown format; metadata in SQLCipher config table

**Validation Rules**:
- `profile_type` determines schema expectations (SOUL schema ≠ AGENTS schema ≠ USER schema)
- `content` must parse as valid YAML/Markdown
- `content_version` must be recognized schema version (prevent forward incompatibility)
- `file_path` must be writable by SpringBoard process

---

## Relationship Diagram

```
┌─────────────────┐
│  Conversation   │
├─────────────────┤
│ id (PK)         │
│ created_at      │
│ user_principal  │
└────────┬────────┘
         │ 1:N
         ↓
┌─────────────────┐         ┌──────────────────────┐
│     Message     │◄────────│ ToolExecutionRecord  │
├─────────────────┤ ref     ├──────────────────────┤
│ id (PK)         │         │ id (PK)              │
│ conversation_id │         │ tool_name            │
│ author          │         │ invoked_at           │
│ content         │         │ execution_status     │
│ metadata        │         └──────────────────────┘
└────────┬────────┘                  │
         │                           │ logged
         └────────────────┬──────────┘
                          ↓
                    ┌──────────────────┐
                    │  AuditLogEntry   │
                    ├──────────────────┤
                    │ id (PK)          │
                    │ timestamp        │
                    │ event_type       │
                    │ resource_type    │
                    │ outcome          │
                    └──────────────────┘

┌──────────────────┐
│ PermissionGrant  │
├──────────────────┤
│ id (PK)          │
│ scope            │
│ granted_at       │
│ expires_at       │
│ revoked_at       │
└────────┬─────────┘
         │ required by
         ├──────────────────┐
         │                  ↓
         │            ┌─────────────┐
         │            │   Skill     │
         │            ├─────────────┤
         │            │ id (PK)     │
         │            │ name        │
         │            │ enabled     │
         │            │ required_   │
         │            │ permissions │
         │            └────┬────────┘
         │                 │ invokes
         │                 ↓
         │        ┌──────────────────┐
         │        │ ScheduledTask    │
         │        ├──────────────────┤
         │        │ id (PK)          │
         │        │ skill_id (FK)    │
         │        │ schedule (cron)  │
         │        │ next_scheduled   │
         │        └──────────────────┘
         │
         └──────► (checked during tool execution & skill invocation)

┌──────────────────────────┐
│ ConfigurationProfile     │
├──────────────────────────┤
│ id (PK)                  │
│ profile_type (soul|...)  │
│ content (YAML content)   │
│ last_modified            │
│ validation_status        │
└──────────────────────────┘
```

---

## Data Persistence & Encryption

**Encryption Strategy**:

1. **SQLCipher conversation storage**:
   - Database file encrypted at rest using `crypto` module (AES-256-GCM)
   - Encryption key derived from Windows Credential Manager or DPAPI
   - IV (initialization vector) stored with each encrypted message
   - Decryption happens in Node backend; plaintext never written to disk

2. **Audit logs**:
   - Stored as JSON Lines (plaintext for readability + compliance review)
   - File permissions restricted to SpringBoard user (Windows ACL)
   - Rotation: daily + size-based, e.g., audit-2026-03-03.jsonl, audit-2026-03-02.jsonl

3. **Permission tokens**:
   - Graph API refresh_tokens encrypted in PermissionGrant table
   - Encryption key separate from conversation key (defense in depth)
   - Rotation: refresh_token rotate on each refresh (Graph API standard)

4. **Configuration files**:
   - Plaintext YAML/Markdown for human editability
   - Change tracking via AuditLogEntry (not encrypted configs themselves)
   - User responsible for file-system-level access control

---

## Validation & Constraints

**Database Constraints** (enforced in SQLCipher):
- PK uniqueness for all entities
- FK referential integrity (messages → conversations, etc.)
- NOT NULL for critical fields (created_at, scope, event_type, etc.)
- UNIQUE constraints (e.g., conversation title must be unique per user)

**Application-level Validation**:
- YAML/schema validation for config files (Zod or Joi)
- Cron expression parse + next run calculation (cron-parser)
- Permission scope enum check (prevent invalid scopes)
- Tool parameter sanitization (before audit logging)

**Eventual Consistency Guarantees**:
- Audit log events persistent before API response (durability first)
- Message encryption committed before UI update (no plaintext exposure)
- Permission tokens refreshed atomically (either fully updated or rolled back)

---

## Evolution & Versioning

**Schema Versioning**:
- All schemas versioned semantically (e.g., `encryption_version`, `content_version`)
- Migrations tracked in SQLCipher `schema_migrations` table
- Backward compatibility: application can read older versions; forward reads rejected with clear error

**Example**: If encryption algorithm changes from AES-256-GCM to XChaCha20, stored messages with `encryption_version = "sodium-1.0"` load with correct decryptor; future `encryption_version = "sodium-2.0"` handled by migration script.

---

## Success Criteria (Data Model)

- ✅ All 8 entities defined with clear attributes, relationships, storage location
- ✅ Validation rules specified per entity (constraint, business logic)
- ✅ State machines defined for Conversation, PermissionGrant, ScheduledTask
- ✅ Encryption strategy documented (at-rest, in-transit, key management)
- ✅ Audit trail comprehensive (all security-relevant events captured)
- ✅ Relationships visualized (E/R diagram included)
- ✅ Extensibility clear (versioning, schema evolution path)

---

**Next Step**: Phase 1 contracts/ folder for API schemas and service boundaries.
