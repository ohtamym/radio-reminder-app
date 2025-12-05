/**
 * データベース初期化スクリプト
 *
 * expo-sqliteを使用したSQLiteデータベースの初期化
 * - programsテーブル
 * - tasksテーブル
 * - インデックス
 * - トリガー
 * - バージョン管理
 */

import * as SQLite from 'expo-sqlite';

// ============================================
// データベース設定
// ============================================

/** データベース名 */
const DATABASE_NAME = 'radio_reminder.db';

/** 現在のスキーマバージョン */
const CURRENT_SCHEMA_VERSION = 1;

// ============================================
// データベース接続
// ============================================

/**
 * データベースを開く
 * @returns SQLiteDatabase インスタンス
 */
export const openDatabase = (): SQLite.SQLiteDatabase => {
  return SQLite.openDatabase(DATABASE_NAME);
};

// ============================================
// テーブル作成SQL
// ============================================

/**
 * programsテーブル作成SQL
 */
const CREATE_PROGRAMS_TABLE = `
  CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    hour INTEGER NOT NULL CHECK (hour >= 5 AND hour <= 29),
    minute INTEGER NOT NULL CHECK (minute IN (0, 15, 30, 45)),
    repeat_type TEXT NOT NULL CHECK (repeat_type IN ('none', 'weekly')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

/**
 * tasksテーブル作成SQL
 */
const CREATE_TASKS_TABLE = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    broadcast_datetime TEXT NOT NULL,
    deadline_datetime TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unlistened' CHECK (status IN ('unlistened', 'listening', 'completed')),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
  );
`;

/**
 * schema_versionテーブル作成SQL
 */
const CREATE_SCHEMA_VERSION_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

// ============================================
// インデックス作成SQL
// ============================================

/**
 * programsテーブルのインデックス
 */
const CREATE_PROGRAMS_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_programs_program_name ON programs(program_name);',
  'CREATE INDEX IF NOT EXISTS idx_programs_day_of_week ON programs(day_of_week);',
  'CREATE INDEX IF NOT EXISTS idx_programs_repeat_type ON programs(repeat_type);',
];

/**
 * tasksテーブルのインデックス
 */
const CREATE_TASKS_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_tasks_program_id ON tasks(program_id);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_deadline_datetime ON tasks(deadline_datetime);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_status_deadline ON tasks(status, deadline_datetime);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);',
];

// ============================================
// トリガー作成SQL
// ============================================

/**
 * programs.updated_at 自動更新トリガー
 */
const CREATE_PROGRAMS_TRIGGER = `
  CREATE TRIGGER IF NOT EXISTS update_programs_updated_at
  AFTER UPDATE ON programs
  FOR EACH ROW
  BEGIN
    UPDATE programs
    SET updated_at = datetime('now', 'localtime')
    WHERE id = NEW.id;
  END;
`;

/**
 * tasks.updated_at 自動更新トリガー
 */
const CREATE_TASKS_TRIGGER = `
  CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at
  AFTER UPDATE ON tasks
  FOR EACH ROW
  BEGIN
    UPDATE tasks
    SET updated_at = datetime('now', 'localtime')
    WHERE id = NEW.id;
  END;
`;

// ============================================
// データベース初期化関数
// ============================================

/**
 * データベースを初期化
 *
 * - テーブル作成
 * - インデックス作成
 * - トリガー作成
 * - スキーマバージョン管理
 *
 * @param db - SQLiteDatabaseインスタンス
 * @returns Promise<void>
 */
export const initializeDatabase = (db: SQLite.SQLiteDatabase): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        // 1. programsテーブル作成
        tx.executeSql(CREATE_PROGRAMS_TABLE);

        // 2. programsテーブルのインデックス作成
        CREATE_PROGRAMS_INDEXES.forEach((sql) => {
          tx.executeSql(sql);
        });

        // 3. tasksテーブル作成
        tx.executeSql(CREATE_TASKS_TABLE);

        // 4. tasksテーブルのインデックス作成
        CREATE_TASKS_INDEXES.forEach((sql) => {
          tx.executeSql(sql);
        });

        // 5. トリガー作成
        tx.executeSql(CREATE_PROGRAMS_TRIGGER);
        tx.executeSql(CREATE_TASKS_TRIGGER);

        // 6. スキーマバージョンテーブル作成
        tx.executeSql(CREATE_SCHEMA_VERSION_TABLE);

        // 7. スキーマバージョンの確認と挿入
        tx.executeSql(
          'SELECT version FROM schema_version WHERE version = ?;',
          [CURRENT_SCHEMA_VERSION],
          (_, result) => {
            if (result.rows.length === 0) {
              // 現在のバージョンが未登録の場合は挿入
              tx.executeSql(
                'INSERT INTO schema_version (version) VALUES (?);',
                [CURRENT_SCHEMA_VERSION]
              );
            }
          }
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

/**
 * データベースをドロップ（開発時のみ使用）
 *
 * @param db - SQLiteDatabaseインスタンス
 * @returns Promise<void>
 */
export const dropDatabase = (db: SQLite.SQLiteDatabase): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql('DROP TABLE IF EXISTS tasks;');
        tx.executeSql('DROP TABLE IF EXISTS programs;');
        tx.executeSql('DROP TABLE IF EXISTS schema_version;');
      },
      (error) => {
        console.error('Database drop failed:', error);
        reject(error);
      },
      () => {
        console.log('Database dropped successfully');
        resolve();
      }
    );
  });
};
