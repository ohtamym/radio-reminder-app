/**
 * タイポグラフィ定義
 *
 * 画面設計書の「3.2 タイポグラフィ」に基づく
 */

export const typography = {
  // フォントサイズ
  fontSize: {
    h1: 20, // 見出し1（画面タイトル）
    h2: 18, // 見出し2（番組名）
    body: 16, // 本文
    caption: 14, // 補足テキスト
    small: 12, // 小テキスト
  },

  // フォントウェイト
  fontWeight: {
    regular: '400' as const,
    bold: '700' as const,
  },

  // 行高さ（オプション、必要に応じて使用）
  lineHeight: {
    h1: 28,
    h2: 26,
    body: 24,
    caption: 20,
    small: 18,
  },
} as const;

export type Typography = typeof typography;
