/**
 * ボーダー半径の設定
 *
 * 画面設計書の3.4 ボタン仕様、3.5 カード仕様に基づく
 */

export const borderRadius = {
  /** ボタンの角丸半径 */
  button: 8,
  /** カードの角丸半径 */
  card: 12,
  /** 小さいコンポーネントの角丸半径（バッジなど） */
  small: 4,
} as const;

export type BorderRadius = typeof borderRadius;
