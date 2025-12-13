/**
 * Jest セットアップファイル
 * テスト実行時のコンソール出力を抑制
 */

// テスト実行時の console.error と console.log を抑制
// ただし、テストが console メソッドを検証する際は正常に動作する
global.console = {
  ...console,
  // console.error の出力を抑制（エラーテストで大量に出力されるため）
  error: jest.fn(),
  // console.log の出力を抑制（成功ログで大量に出力されるため）
  log: jest.fn(),
  // console.warn は残す（重要な警告を見逃さないため）
  // warn: jest.fn(),
};
