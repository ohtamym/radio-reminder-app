/**
 * グローバルエラーハンドラー
 *
 * ErrorBoundaryではキャッチできないエラー（ネイティブエラーなど）を
 * キャッチしてログに記録する
 */

// ErrorUtilsはExpo Goでは利用できない可能性があるため、動的にインポート
let ErrorUtils: any;
try {
  const RN = require('react-native');
  ErrorUtils = RN.ErrorUtils;
} catch (e) {
  // react-nativeが利用できない場合
  ErrorUtils = undefined;
}

// エラー情報を保存するための変数
let globalError: Error | null = null;
let globalErrorInfo: string | null = null;

/**
 * グローバルエラーハンドラー
 *
 * React Nativeのグローバルエラーハンドラーを設定
 * ネイティブエラーやPromiseのrejectionなどもキャッチする
 *
 * 注意: Expo Goの環境ではErrorUtilsが利用できない場合があります
 */
export const setupGlobalErrorHandler = () => {
  try {
    // ErrorUtilsが利用可能かチェック
    if (typeof ErrorUtils !== 'undefined' && ErrorUtils.getGlobalHandler) {
      // 既存のエラーハンドラーを保存
      const originalHandler = ErrorUtils.getGlobalHandler();

      // 新しいエラーハンドラーを設定
      if (ErrorUtils.setGlobalHandler) {
        ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
          // エラー情報を保存
          globalError = error;
          globalErrorInfo = error.stack || error.message;

          // 詳細なエラーログを出力
          console.error('=== GLOBAL ERROR HANDLER ===');
          console.error('Fatal:', isFatal);
          console.error('Error Name:', error.name);
          console.error('Error Message:', error.message);
          console.error('Error Stack:', error.stack);
          console.error('===========================');

          // Android Logcatにも出力（デバッグ用）
          if (__DEV__) {
            console.error('[GLOBAL ERROR]', {
              fatal: isFatal,
              name: error.name,
              message: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
            });
          }

          // 元のエラーハンドラーも実行
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
        });
      }
    } else {
      // ErrorUtilsが利用できない場合（Expo Goなど）
      console.warn(
        '[GlobalErrorHandler] ErrorUtils is not available. Skipping global error handler setup.'
      );
    }
  } catch (error) {
    // エラーハンドラーの設定に失敗した場合
    console.warn('[GlobalErrorHandler] Failed to setup global error handler:', error);
  }
};

/**
 * Promise rejectionハンドラー
 *
 * 未処理のPromise rejectionをキャッチする
 */
export const setupPromiseRejectionHandler = () => {
  // 未処理のPromise rejectionをキャッチ
  if (typeof global !== 'undefined') {
    const originalHandler = (global as any).onunhandledrejection;

    (global as any).onunhandledrejection = (event: PromiseRejectionEvent) => {
      console.error('=== UNHANDLED PROMISE REJECTION ===');
      console.error('Reason:', event.reason);
      if (event.reason instanceof Error) {
        console.error('Error Name:', event.reason.name);
        console.error('Error Message:', event.reason.message);
        console.error('Error Stack:', event.reason.stack);
      }
      console.error('===================================');

      if (originalHandler) {
        originalHandler(event);
      }
    };
  }
};

/**
 * 保存されたエラー情報を取得
 */
export const getGlobalError = (): { error: Error | null; info: string | null } => {
  return { error: globalError, info: globalErrorInfo };
};

/**
 * エラー情報をクリア
 */
export const clearGlobalError = () => {
  globalError = null;
  globalErrorInfo = null;
};
