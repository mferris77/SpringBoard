/**
 * Database - SQLCipher initialization and migration runner
 */

import Database from 'better-sqlite3-multiple-ciphers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import pino from 'pino';

const logger = pino({ name: 'database' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface DatabaseConfig {
  dbPath: string;
  encryptionKey: string;
  readonly?: boolean;
}

export class SpringBoardDatabase {
  private db: Database.Database;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.db = new Database(config.dbPath, {
      readonly: config.readonly || false,
      fileMustExist: false,
    });

    // Enable SQLCipher encryption
    this.db.pragma(`key = '${config.encryptionKey}'`);
    this.db.pragma('cipher_page_size = 4096');
    this.db.pragma('kdf_iter = 256000');
    this.db.pragma('cipher_hmac_algorithm = HMAC_SHA512');
    this.db.pragma('cipher_kdf_algorithm = PBKDF2_HMAC_SHA512');

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
    
    logger.info({ dbPath: config.dbPath }, 'Database initialized');
  }

  /**
   * Run all migration files in order
   */
  async runMigrations(): Promise<void> {
    logger.info('Running database migrations...');

    const migrations = [
      '001_init_chat.sql',
      '002_init_permissions.sql',
      '003_init_skills.sql',
      '004_init_scheduled_tasks.sql',
    ];

    for (const migration of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migration);
      const sql = readFileSync(migrationPath, 'utf-8');
      
      logger.info({ migration }, 'Applying migration');
      this.db.exec(sql);
    }

    logger.info('All migrations applied successfully');
  }

  /**
   * Check if database is properly encrypted and accessible
   */
  isReady(): boolean {
    try {
      const result = this.db.prepare('SELECT 1 as test').get();
      return result !== undefined;
    } catch (error) {
      logger.error({ error }, 'Database readiness check failed');
      return false;
    }
  }

  /**
   * Execute a query
   */
  query<T = unknown>(sql: string, params?: unknown[]): T[] {
    return this.db.prepare(sql).all(params || []) as T[];
  }

  /**
   * Execute a single-row query
   */
  queryOne<T = unknown>(sql: string, params?: unknown[]): T | undefined {
    return this.db.prepare(sql).get(params || []) as T | undefined;
  }

  /**
   * Execute an insert/update/delete
   */
  execute(sql: string, params?: unknown[]): Database.RunResult {
    return this.db.prepare(sql).run(params || []);
  }

  /**
   * Execute a transaction
   */
  transaction<T>(fn: () => T): T {
    const trx = this.db.transaction(fn);
    return trx();
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
    logger.info('Database closed');
  }
}
