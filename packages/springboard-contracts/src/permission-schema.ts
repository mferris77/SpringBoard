/**
 * Permission Schema - Permission grants and scopes
 */

export enum PermissionScope {
  // Outlook permissions
  OUTLOOK_CALENDAR_READ = 'outlook-calendar-read',
  OUTLOOK_CALENDAR_WRITE = 'outlook-calendar-write',
  OUTLOOK_MAIL_READ = 'outlook-mail-read',
  OUTLOOK_MAIL_WRITE = 'outlook-mail-write',
  OUTLOOK_MAIL_SEND = 'outlook-mail-send',
  
  // Office document permissions
  WORD_READ = 'word-read',
  WORD_WRITE = 'word-write',
  EXCEL_READ = 'excel-read',
  EXCEL_WRITE = 'excel-write',
  
  // Filesystem permissions
  FILESYSTEM_READ = 'filesystem-read',
  FILESYSTEM_WRITE = 'filesystem-write',
  
  // Shell execution
  SHELL_EXECUTE = 'shell-execute',
  
  // Browser automation
  BROWSER_NAVIGATE = 'browser-navigate',
  BROWSER_INTERACT = 'browser-interact',
}

export interface PermissionGrantRequest {
  scope: PermissionScope;
  ttl?: number; // Time-to-live in seconds
  metadata?: Record<string, unknown>;
}

export interface PermissionGrantResponse {
  id: string;
  scope: PermissionScope;
  grantedAt: string; // ISO 8601 timestamp
  expiresAt?: string; // ISO 8601 timestamp
  metadata?: Record<string, unknown>;
}

export interface PermissionCheckRequest {
  scope: PermissionScope;
}

export interface PermissionCheckResponse {
  active: boolean;
  grant?: PermissionGrantResponse;
}

export interface PermissionRevokeRequest {
  id: string;
  reason?: string;
}

export interface PermissionRevokeResponse {
  success: boolean;
  revokedAt: string; // ISO 8601 timestamp
}
