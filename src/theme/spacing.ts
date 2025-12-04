/**
 * スペーシング定義
 *
 * 画面設計書の「3.3 スペーシング」に基づく
 */

export const spacing = {
  // 基本スペーシング
  xs: 8, // 要素間余白（小）
  sm: 12, // カード間隔
  md: 16, // 画面余白、カード内余白、要素間余白（中）
  lg: 24, // 要素間余白（大）

  // 個別用途のスペーシング（エイリアス）
  screenPadding: 16, // 画面余白
  cardGap: 12, // カード間隔
  cardPadding: 16, // カード内余白
} as const;

export type Spacing = typeof spacing;
