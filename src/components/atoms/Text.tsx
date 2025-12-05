/**
 * Text - 汎用テキストコンポーネント
 *
 * アプリケーション全体で使用する統一されたテキストコンポーネント
 * - テーマのタイポグラフィを適用
 * - 複数のバリアント（h1, h2, body, caption, small）
 * - 色のカスタマイズ対応
 */

import React, { memo } from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { typography } from '@/theme/typography';
import { colors } from '@/theme/colors';

// ============================================
// 型定義
// ============================================

/**
 * テキストのバリアント型
 */
export type TextVariant = 'h1' | 'h2' | 'body' | 'caption' | 'small';

/**
 * Textコンポーネントのプロパティ
 */
export interface TextProps extends RNTextProps {
  /** テキストのバリアント */
  variant?: TextVariant;
  /** テキストの色 */
  color?: string;
  /** 太字表示 */
  bold?: boolean;
  /** 子要素（テキスト内容） */
  children: React.ReactNode;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 汎用テキストコンポーネント
 *
 * テーマのタイポグラフィ設定を適用
 * 5種類のバリアントを提供
 *
 * @example
 * // 見出し1
 * <Text variant="h1">画面タイトル</Text>
 *
 * // 見出し2
 * <Text variant="h2">番組名</Text>
 *
 * // 本文（デフォルト）
 * <Text>本文テキスト</Text>
 *
 * // 補足テキスト
 * <Text variant="caption" color={colors.textSecondary}>
 *   補足情報
 * </Text>
 *
 * // 小テキスト
 * <Text variant="small">小さいテキスト</Text>
 *
 * // 太字
 * <Text bold>太字テキスト</Text>
 */
const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  bold = false,
  style,
  children,
  ...rest
}) => {
  const variantStyle = getVariantStyle(variant);
  const fontWeight = bold ? typography.fontWeight.bold : typography.fontWeight.regular;

  return (
    <RNText
      style={[
        styles.text,
        variantStyle,
        { fontWeight },
        color && { color },
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};

// ============================================
// スタイル
// ============================================

/**
 * 基本スタイル
 */
const styles = StyleSheet.create({
  text: {
    color: colors.text,
  },
});

/**
 * バリアント別スタイル定義
 */
const variantStyles = StyleSheet.create({
  h1: {
    fontSize: typography.fontSize.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.fontWeight.bold,
  },
  h2: {
    fontSize: typography.fontSize.h2,
    lineHeight: typography.lineHeight.h2,
    fontWeight: typography.fontWeight.bold,
  },
  body: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
  },
  caption: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
  },
  small: {
    fontSize: typography.fontSize.small,
    lineHeight: typography.lineHeight.small,
  },
});

/**
 * バリアントに応じたスタイルを取得
 *
 * @param variant - テキストのバリアント
 * @returns バリアント別のスタイル
 */
const getVariantStyle = (variant: TextVariant): TextStyle => {
  return variantStyles[variant];
};

// ============================================
// エクスポート
// ============================================

export default memo(Text);
