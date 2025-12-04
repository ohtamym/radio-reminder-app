/**
 * カラーパレット定義
 *
 * 画面設計書の「3.1 カラーパレット」に基づく
 */

export const colors = {
  // プライマリーカラー
  primary: '#2196F3', // 青

  // セカンダリーカラー
  secondary: '#FFC107', // 黄

  // ステータスカラー
  error: '#F44336', // 赤
  success: '#4CAF50', // 緑
  warning: '#FFC107', // 黄（セカンダリーと同じ）

  // 背景色
  background: '#FFFFFF', // 白
  cardBackground: '#F5F5F5', // 薄いグレー

  // テキストカラー
  text: '#212121', // 濃いグレー
  textSecondary: '#757575', // グレー
  textWhite: '#FFFFFF', // 白（ボタンテキスト用）

  // ボーダーカラー
  border: '#E0E0E0', // 薄いグレー

  // ステータスインジケーター色
  statusUnlistened: '#F44336', // 未聴取（赤）
  statusListening: '#FFC107', // 聴取中（黄）
  statusCompleted: '#4CAF50', // 聴取済み（緑）

  // 期限表示の色分け
  deadlineUrgent: '#F44336', // 残り1日以内（赤）
  deadlineWarning: '#FFC107', // 残り2-3日（黄）
  deadlineNormal: '#757575', // 残り4日以上（グレー）

  // ボタンカラー（透明）
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;
