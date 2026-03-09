/**
 * Audit Log Schema - Audit trail event types and structures
 */

export enum AuditEventType {
  PERMISSION_GRANT = 'permission_grant',
  PERMISSION_REVOKE = 'permission_revoke',
  PERMISSION_CHECK = 'permission_check',
  TOOL_EXECUTION_START = 'tool_execution_start',
  TOOL_EXECUTION_END = 'tool_execution_end',
  CONFIG_CHANGE = 'config_change',
  AUTH_FAILURE = 'auth_failure',
  SKILL_INSTALL = 'skill_install',
  SKILL_REMOVE = 'skill_remove',
}

export enum AuditOutcome {
  SUCCESS = 'success',
  FAILURE = 'failure',
  DENIED = 'denied',
  ERROR = 'error',
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  eventType: AuditEventType;
  actor: string; // User or system identifier
  outcome: AuditOutcome;
  details: Record<string, unknown>;
  resourceId?: string;
  resourceType?: string;
}

export interface AuditQueryRequest {
  eventType?: AuditEventType;
  actor?: string;
  fromDate?: string; // ISO 8601
  toDate?: string; // ISO 8601
  limit?: number;
  offset?: number;
}

export interface AuditQueryResponse {
  entries: AuditLogEntry[];
  total: number;
  hasMore: boolean;
}
