/**
 * エラーハンドリングの共通処理
 *
 * アプリケーション全体で統一されたエラー処理を提供
 */

import { Alert } from 'react-native';

// ============================================
// カスタムエラークラス
// ============================================

/**
 * アプリケーション固有のエラークラス
 *
 * 標準のErrorクラスを拡張し、エラーコードやHTTPステータスコードを保持
 */
export class AppError extends Error {
  /**
   * @param message - エラーメッセージ
   * @param code - エラーコード（オプション）
   * @param statusCode - HTTPステータスコード（オプション）
   */
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';

    // TypeScriptのトランスパイル対策
    // https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ============================================
// エラーハンドリング関数
// ============================================

/**
 * エラーを処理してユーザーにアラートを表示
 *
 * - AppErrorの場合: カスタムメッセージを表示
 * - Errorの場合: 予期しないエラーとして表示
 * - その他: 不明なエラーとして表示
 *
 * @param error - 処理するエラー
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   handleError(error);
 * }
 */
export const handleError = (error: unknown): void => {
  if (error instanceof AppError) {
    // アプリケーション固有のエラー
    Alert.alert('エラー', error.message);
    logError(error);
  } else if (error instanceof Error) {
    // 標準のエラー
    Alert.alert('予期しないエラー', error.message);
    logError(error);
  } else {
    // 不明なエラー
    Alert.alert('エラー', '不明なエラーが発生しました');
    console.error('[ERROR] Unknown error:', error);
  }
};

/**
 * エラーをコンソールにログ出力
 *
 * 本番環境ではSentryなどのエラー追跡サービスに送信することを推奨
 *
 * @param error - ログ出力するエラー
 */
const logError = (error: Error): void => {
  const errorInfo = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  };

  // 開発環境ではコンソールに詳細を出力
  if (__DEV__) {
    console.error('[ERROR]', errorInfo);
  } else {
    // 本番環境ではエラー追跡サービスに送信
    // 例: Sentry.captureException(error);
    console.error('[ERROR]', errorInfo);
  }
};

// ============================================
// ユーティリティ関数
// ============================================

/**
 * エラーメッセージを取得
 *
 * unknown型のエラーから安全にメッセージを抽出
 *
 * @param error - エラー
 * @returns エラーメッセージ
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '不明なエラーが発生しました';
};
