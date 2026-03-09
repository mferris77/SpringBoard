-- Scheduled tasks schema
-- Stores heartbeat/scheduled task definitions

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  schedule_cron TEXT NOT NULL,
  skill_id TEXT,
  action TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  last_run_at TEXT,
  next_run_at TEXT,
  config_json TEXT,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
);

CREATE INDEX idx_scheduled_tasks_next_run ON scheduled_tasks(next_run_at) 
  WHERE enabled = 1 AND next_run_at IS NOT NULL;
