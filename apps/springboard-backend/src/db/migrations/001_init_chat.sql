-- Initial schema for conversations and messages
-- SQLCipher database with AES-256-GCM encryption

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  title TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  encrypted INTEGER NOT NULL DEFAULT 1,
  encryption_version TEXT NOT NULL DEFAULT 'v1',
  user_principal_name TEXT NOT NULL,
  metadata_json TEXT,
  deleted_at TEXT
);

CREATE INDEX idx_conversations_user ON conversations(user_principal_name, created_at DESC);
CREATE INDEX idx_conversations_deleted ON conversations(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  author TEXT NOT NULL CHECK(author IN ('user', 'assistant', 'system')),
  content_encrypted TEXT NOT NULL,
  created_at TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model_name TEXT,
  metadata_json TEXT,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX idx_messages_author ON messages(conversation_id, author);
