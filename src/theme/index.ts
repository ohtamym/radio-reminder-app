/**
 * テーマ設定の統合
 *
 * アプリケーション全体のテーマ設定
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadows } from './shadows';
import { buttons } from './buttons';

/**
 * 統合テーマオブジェクト
 */
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  buttons,
} as const;

// 個別エクスポート
export { colors, typography, spacing, borderRadius, shadows, buttons };

// 型エクスポート
export type Theme = typeof theme;
export type { Colors } from './colors';
export type { Typography } from './typography';
export type { Spacing } from './spacing';
export type { BorderRadius } from './borderRadius';
export type { Shadows } from './shadows';
export type { Buttons } from './buttons';
