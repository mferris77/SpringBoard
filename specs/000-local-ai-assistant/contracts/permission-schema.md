# Permission Grant Contract

**Version**: 1.0.0 | **Last Updated**: March 3, 2026
**Purpose**: Specification for permission request/grant/revoke API and data structures

---

## Permission Grant Workflow

```
User Action: "Can I access Outlook calendar?"
    ↓
App: Check PermissionGrant table for scope "outlook-calendar-read"
    ├─ FOUND + active + not expired → [Granted, proceed]
    └─ NOT FOUND or revoked → [Prompt user]
    ↓
UI: Show permission dialog with scope explanation
    ├─ User clicks [Grant] → Call IPC message: permissions/grant
    ├─ User clicks [Deny] → Call IPC message: permissions/deny
    └─ User clicks [NeverAsk] → Deny + add to AGENTS.md exclusion list
    ↓
Backend: Create/update PermissionGrant record + audit log
    ├─ Success → Return 200 { granted: true, expires_at: "..." }
    └─ Failure → Return 403 { error: "permission_denied" }
    ↓
Continue: Proceed with Office API call (using cached/refreshed Graph token)
```

---

## HTTP API Endpoints

### 1. Check Permission
```
IPC message: permissions/check?scope=:scope
```

**Request**:
- Query param: `scope` (string, required) — e.g., "outlook-calendar-read"

**Response 200 (Granted)**:
```json
{
  "granted": true,
  "scope": "outlook-calendar-read",
  "granted_at": "2026-03-01T10:00:00Z",
  "expires_at": "2026-06-03T10:00:00Z",
  "grant_metadata": {
    "approval_method": "user_prompt"
  }
}
```

**Response 403 (Not Granted)**:
```json
{
  "granted": false,
  "scope": "outlook-calendar-read",
  "reason": "permission_not_granted",
  "requires_user_prompt": true
}
```

---

### 2. Request Permission (User Prompt)
```
IPC message: permissions/grant
```

**Request**:
```json
{
  "scope": "outlook-calendar-read",
  "expiry_days": 30,  // optional, null = permanent
  "display_context": "Assistant wants to read your Outlook calendar to check availability",
  "resource_filter": {
    "calendar_id": "optional_specific_calendar_id"
  }
}
```

**Response 200 (User Approved)**:
```json
{
  "granted": true,
  "permission_id": "550e8400-e29b-41d4-a716-446655440000",
  "scope": "outlook-calendar-read",
  "granted_at": "2026-03-03T09:15:23Z",
  "expires_at": "2026-04-03T09:15:23Z",
  "token_info": {
    "graph_token_valid": true,
    "next_refresh_at": "2026-03-10T09:15:23Z"
  }
}
```

**Response 403 (User Denied)**:
```json
{
  "granted": false,
  "permission_id": "550e8400-e29b-41d4-a716-446655440000",
  "scope": "outlook-calendar-read",
  "reason": "user_denied"
}
```

**Response 400 (Invalid Scope)**:
```json
{
  "error": "invalid_scope",
  "message": "Unknown permission scope: invalid-scope",
  "valid_scopes": [
    "outlook-calendar-read",
    "outlook-calendar-write",
    "word-document-read",
    ...
  ]
}
```

---

### 3. Revoke Permission
```
IPC message: permissions/revoke
```

**Request**:
```json
{
  "scope": "outlook-calendar-read",
  "revocation_reason": "user_explicit"
}
```

**Response 200 (Revoked)**:
```json
{
  "revoked": true,
  "scope": "outlook-calendar-read",
  "revoked_at": "2026-03-03T09:20:00Z"
}
```

**Response 404 (Not Found)**:
```json
{
  "error": "permission_not_found",
  "scope": "outlook-calendar-read"
}
```

---

### 4. List User Permissions
```
IPC message: permissions/list
```

**Response 200**:
```json
{
  "permissions": [
    {
      "scope": "outlook-calendar-read",
      "granted_at": "2026-03-01T10:00:00Z",
      "expires_at": "2026-06-03T10:00:00Z",
      "is_active": true,
      "is_expired": false
    },
    {
      "scope": "word-document-read",
      "granted_at": "2026-02-28T14:30:00Z",
      "expires_at": null,
      "is_active": true,
      "is_expired": false
    },
    {
      "scope": "shell-execute",
      "granted_at": "2026-02-27T08:00:00Z",
      "expires_at": "2026-02-27T18:00:00Z",
      "is_active": false,
      "is_expired": true
    }
  ],
  "total": 3
}
```

---

## Data Schema (TypeScript)

```typescript
// Canonical permission scopes
export type PermissionScope =
  // Outlook
  | "outlook-calendar-read"
  | "outlook-calendar-write"
  | "outlook-mail-read"
  | "outlook-mail-send"
  | "outlook-contacts-read"
  // Word
  | "word-document-read"
  | "word-document-write"
  // Excel
  | "excel-worksheet-read"
  | "excel-worksheet-write"
  // Local Tools
  | "filesystem-read"
  | "filesystem-write"
  | "shell-execute"
  | "browser-automation"
  // System
  | "audit-log-read"
  | "config-read"
  | "config-write"
  | "skill-install"
  | "skill-uninstall";

export interface PermissionGrant {
  id: string; // UUID
  scope: PermissionScope;
  granted_at: string; // ISO 8601
  granted_by: "user" | "system" | "imported";
  expires_at: string | null; // ISO 8601 or null
  revoked_at: string | null; // ISO 8601 or null
  revocation_reason?: string;
  
  grant_metadata?: {
    approval_method?: "user_prompt" | "system" | "skill_declaration";
    display_context?: string;
    resource_filter?: {
      calendar_id?: string; // for outlook-calendar scopes
      document_id?: string; // for word/excel scopes
      directory_path?: string; // for filesystem scopes
    };
  };
}

export interface PermissionCheckResponse {
  granted: boolean;
  scope: PermissionScope;
  granted_at?: string;
  expires_at?: string | null;
  grant_metadata?: PermissionGrant["grant_metadata"];
  reason?: "permission_not_granted" | "permission_expired" | "permission_revoked";
  requires_user_prompt?: boolean;
}

export interface PermissionGrantRequest {
  scope: PermissionScope;
  expiry_days?: number; // null = permanent
  display_context?: string;
  resource_filter?: PermissionGrant["grant_metadata"]["resource_filter"];
}

export interface PermissionRevokeRequest {
  scope: PermissionScope;
  revocation_reason: "user_explicit" | "permission_expired" | "skill_uninstall" | "other";
}
```

---

## Graph API Token Refresh Strategy

When a permission for Outlook/Word/Excel is granted, the backend obtains and caches a Graph refresh_token.

### Refresh Flow
```
[Call Office API]
    ↓
[Check access_token expiry]
    ├─ Still valid → Use token
    └─ Expired → POST /oauth2/v2.0/token
        ├─ Send refresh_token
        ├─ Receive new access_token + new refresh_token
        ├─ Store new refresh_token + expiry
        └─ Retry Office API call
```

### Encryption of Refresh Tokens
- Tokens stored in `%APPDATA%/SpringBoard/tokens/` directory
- Encrypted using Windows DPAPI OR sodium.js XChaCha20 (config-dependent)
- Decryption happens only in secure backend context (not exposed to Electron renderer)
- Audit log: Token refresh event recorded (but not token content)

### Token Rotation & Expiration
- Access token: ~1 hour lifetime (Graph API default)
- Refresh token: Infinite lifetime unless user revokes permission
- Preemptive refresh: 5 minutes before expiry (no user-facing delays)
- Failure handling: If refresh fails, emit audit event + notify user (permission revocation notice)

---

## Permission Validation Rules

**Trust-But-Verify**:
1. UI requests permission → Backend checks PermissionGrant table
2. User approves → Backend creates PermissionGrant record + audit entry
3. Skill/tool checks permission → Backend verifies record active + not expired
4. Execution proceeds only if check passes (permission_check middleware in Electron IPC)

**Expiration Handling**:
- If `expires_at <= NOW`, permission treated as invalid
- Background job (hourly): Mark expired permissions as inactive (optional)
- Audit log: expiration event recorded (info severity)

**Revocation Handling**:
- If `revoked_at` is non-null, permission treated as revoked
- Any active operation using revoked scope fails with permission_denied error
- UI: revocation reason displayed to user in permission history

**Graph Token Failure Recovery**:
- If token refresh fails 3x → Emit warning audit event + notify user
- User prompted to re-authenticate via Entra ID login screen
- User must explicitly re-grant permission (no auto re-request)

---

## Testing Strategy (Contract Tests)

### Mock Graph API Server
```javascript
// test/contract/graph-api.mock.js
const mockGraph = Electron IPC();

// POST /oauth2/v2.0/token
mockGraph.post("/oauth2/v2.0/token", (req, res) => {
  res.json({
    access_token: "mock_access_token",
    refresh_token: "mock_refresh_token",
    expires_in: 3600,
    token_type: "Bearer"
  });
});

// GET /me/calendar/events
mockGraph.get("/me/calendar/events", (req, res) => {
  if (!req.headers.authorization?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized" });
  }
  res.json({
    value: [
      {
        id: "event1",
        subject: "Team Meeting",
        start: { dateTime: "2026-03-04T10:00:00Z" },
        end: { dateTime: "2026-03-04T11:00:00Z" }
      }
    ]
  });
});
```

### Unit Test Example
```typescript
// test/unit/permission-manager.test.ts
describe("PermissionManager", () => {
  it("should grant permission and create audit log entry", async () => {
    const pm = new PermissionManager();
    const grant = await pm.grantPermission({
      scope: "outlook-calendar-read",
      expiry_days: 30
    });

    expect(grant.granted).toBe(true);
    expect(grant.expires_at).toBeDefined();

    const auditLog = await db.query(
      `SELECT * FROM audit_log WHERE permission_id = ?`,
      [grant.permission_id]
    );
    expect(auditLog[0].event_type).toBe("permission_grant");
  });

  it("should reject expired permission", async () => {
    const grant = await pm.checkPermission("outlook-calendar-read");
    await db.query(`UPDATE permissions SET expires_at = ? WHERE scope = ?`,
      [new Date(Date.now() - 1000), "outlook-calendar-read"]
    );

    const check = await pm.checkPermission("outlook-calendar-read");
    expect(check.granted).toBe(false);
  });
});
```

---

## Backward Compatibility

**Future Schema Changes**:
- New permission scopes added: enum extended, existing grants unaffected
- New grant_metadata fields: backward compatible (extra fields ignored)
- Token refresh strategy updated: handled transparently in refresh flow

**Migration Path**:
- If new requirements demand per-calendar permissions instead of calendar-read/write blanket:
  - Define new scopes: outlook-calendar-event-xxx
  - Old grants still valid but logged as partial-match
  - New policies enforce new scopes going forward
  - Migration API allows bulk scope upgrade

---

**Next Step**: Implement permission middleware in Electron IPC backend to enforce on every Office API call.
