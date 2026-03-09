-- Skills registry schema
-- Stores installed skills and their metadata

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  version TEXT NOT NULL,  installed_at TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  manifest_json TEXT NOT NULL,
  config_json TEXT,
  last_updated TEXT NOT NULL
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_enabled ON skills(enabled) WHERE enabled = 1;
