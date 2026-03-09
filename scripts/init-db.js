#!/usr/bin/env node
/**
 * Database initialization script
 * Usage: node scripts/init-db.js
 */

import { SpringBoardDatabase } from '../apps/springboard-backend/src/db/database.js';
import { randomBytes } from 'crypto';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const APPDATA_DIR = join(homedir(), 'AppData', 'Roaming', 'SpringBoard');
const DB_PATH = join(APPDATA_DIR, 'conversations.db');
const KEY_PATH = join(APPDATA_DIR, 'db.key');

// Ensure AppData directory exists
if (!existsSync(APPDATA_DIR)) {
  mkdirSync(APPDATA_DIR, { recursive: true });
  console.log(`Created directory: ${APPDATA_DIR}`);
}

// Generate or load encryption key
let encryptionKey: string;

if (existsSync(KEY_PATH)) {
  encryptionKey = require('fs').readFileSync(KEY_PATH, 'utf-8').trim();
  console.log('Loaded existing encryption key');
} else {
  encryptionKey = randomBytes(32).toString('hex');
  writeFileSync(KEY_PATH, encryptionKey, { mode: 0o600 });
  console.log(`Generated new encryption key: ${KEY_PATH}`);
}

// Initialize database
const db = new SpringBoardDatabase({
  dbPath: DB_PATH,
  encryptionKey,
});

// Run migrations
await db.runMigrations();

// Verify database is ready
if (db.isReady()) {
  console.log('✅ Database initialized successfully');
  console.log(`   Path: ${DB_PATH}`);
  console.log(`   Key:  ${KEY_PATH}`);
} else {
  console.error('❌ Database initialization failed');
  process.exit(1);
}

db.close();
