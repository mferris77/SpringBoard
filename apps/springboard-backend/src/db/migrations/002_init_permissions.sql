-- Permission grants schema
-- Stores granted permissions with TTL and revocation support

CREATE TABLE IF NOT EXISTS permission_grants (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  expires_at TEXT,
  revoked_at TEXT,
  revoke_reason TEXT,
  grant_metadata_json TEXT,
  user_principal_name TEXT NOT NULL
);

CREATE INDEX idx_permissions_scope ON permission_grants(scope, granted_at DESC);
CREATE INDEX idx_permissions_user ON permission_grants(user_principal_name);
CREATE INDEX idx_permissions_active ON permission_grants(scope) 
  WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > datetime('now'));
