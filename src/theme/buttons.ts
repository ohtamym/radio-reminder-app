/**
 * ボタン仕様の設定
 *
 * 画面設計書の3.4 ボタン仕様に基づく
 */

export const buttons = {
  /** ボタンの高さ */
  height: 48,
  /** 押下時の透過度 */
  pressedOpacity: 0.8,
} as const;

export type Buttons = typeof buttons;
