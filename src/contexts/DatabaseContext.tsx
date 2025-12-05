/**
 * DatabaseContext - データベース接続のグローバル管理
 *
 * アプリケーション全体でデータベース接続を共有するためのContext
 * - データベースの初期化
 * - 接続状態の管理
 * - エラーハンドリング
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { openDatabase, initializeDatabase } from '@/services/database';
import { handleError } from '@/utils/errorHandler';

// ============================================
// 型定義
// ============================================

/**
 * DatabaseContextの値の型
 */
interface DatabaseContextValue {
  /** データベースインスタンス */
  db: SQLite.SQLiteDatabase | null;
  /** データベースが準備完了かどうか */
  isReady: boolean;
}

/**
 * DatabaseProviderのProps型
 */
interface DatabaseProviderProps {
  /** 子コンポーネント */
  children: ReactNode;
}

// ============================================
// Context作成
// ============================================

/**
 * DatabaseContext
 *
 * デフォルト値として null と false を設定
 */
const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
});

// ============================================
// Provider コンポーネント
// ============================================

/**
 * DatabaseProvider
 *
 * アプリケーションのルートでラップして使用
 * データベースの初期化と接続管理を行う
 *
 * @example
 * <DatabaseProvider>
 *   <App />
 * </DatabaseProvider>
 */
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    /**
     * データベース初期化処理
     *
     * 1. データベースを開く
     * 2. テーブル・インデックス・トリガーを作成
     * 3. 準備完了状態にする
     */
    const initDb = async () => {
      try {
        console.log('[DatabaseContext] Initializing database...');

        // データベースを開く
        const database = openDatabase();

        // テーブル・インデックス・トリガーを作成
        await initializeDatabase(database);

        // 状態を更新
        setDb(database);
        setIsReady(true);

        console.log('[DatabaseContext] Database initialized successfully');
      } catch (error) {
        console.error('[DatabaseContext] Failed to initialize database:', error);
        handleError(error);
      }
    };

    initDb();
  }, []);

  // データベースが準備できるまでは何も表示しない
  // 将来的にはLoadingSpinnerを表示することも可能
  if (!isReady) {
    return null;
  }

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
};

// ============================================
// Custom Hook
// ============================================

/**
 * useDatabase - データベース接続を取得するカスタムフック
 *
 * DatabaseProvider内でのみ使用可能
 * Provider外で使用した場合はエラーをスロー
 *
 * @returns データベース接続とready状態
 *
 * @example
 * const { db, isReady } = useDatabase();
 * if (db && isReady) {
 *   // データベース操作
 * }
 *
 * @throws DatabaseProvider外で使用した場合
 */
export const useDatabase = (): DatabaseContextValue => {
  const context = useContext(DatabaseContext);

  // Provider外で使用された場合のエラーチェック
  if (context === undefined) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }

  // データベースが準備完了しているが接続がない場合もエラー
  if (!context.db && context.isReady) {
    throw new Error('Database connection is not available');
  }

  return context;
};
