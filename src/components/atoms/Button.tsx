/**
 * Button - 汎用ボタンコンポーネント
 *
 * プライマリー、セカンダリー、デンジャーの3種類のバリアントを提供
 * - アクセシビリティ対応
 * - disabled状態
 * - fullWidth対応
 */

import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { borderRadius, buttons } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * ボタンのバリアント型
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger';

/**
 * Buttonコンポーネントのプロパティ
 */
export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** ボタンのバリアント */
  variant?: ButtonVariant;
  /** ボタンのテキスト */
  children: string;
  /** ボタンの無効化 */
  disabled?: boolean;
  /** ローディング状態 */
  loading?: boolean;
  /** 全幅表示 */
  fullWidth?: boolean;
  /** カスタムスタイル */
  style?: ViewStyle;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 汎用ボタンコンポーネント
 *
 * 3種類のバリアント（primary, secondary, danger）を提供
 * アクセシビリティ対応済み
 *
 * @example
 * // プライマリーボタン
 * <Button variant="primary" onPress={handlePress}>
 *   保存
 * </Button>
 *
 * // セカンダリーボタン
 * <Button variant="secondary" onPress={handlePress}>
 *   キャンセル
 * </Button>
 *
 * // デンジャーボタン
 * <Button variant="danger" onPress={handlePress}>
 *   削除
 * </Button>
 *
 * // 全幅ボタン
 * <Button variant="primary" fullWidth onPress={handlePress}>
 *   送信
 * </Button>
 *
 * // 無効化ボタン
 * <Button variant="primary" disabled onPress={handlePress}>
 *   無効
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  ...rest
}) => {
  // バリアントに応じたスタイルを取得
  const variantStyle = getVariantStyle(variant);

  // ローディング中は無効化
  const isDisabled = disabled || loading;

  // インジケーターの色を決定（テキスト色と同じ）
  const indicatorColor = variantStyle.text.color;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyle.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={buttons.pressedOpacity}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="small" />
      ) : (
        <Text style={[styles.text, variantStyle.text]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// スタイル
// ============================================

/**
 * 基本スタイル
 */
const styles = StyleSheet.create({
  button: {
    height: buttons.height,
    paddingHorizontal: 24,
    borderRadius: borderRadius.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
});

/**
 * バリアント別スタイル定義
 */
const variantStyles = {
  primary: {
    button: {
      backgroundColor: colors.primary,
    } as ViewStyle,
    text: {
      color: colors.textWhite,
    } as TextStyle,
  },
  secondary: {
    button: {
      backgroundColor: colors.secondary,
    } as ViewStyle,
    text: {
      color: colors.text,
    } as TextStyle,
  },
  danger: {
    button: {
      backgroundColor: colors.error,
    } as ViewStyle,
    text: {
      color: colors.textWhite,
    } as TextStyle,
  },
};

/**
 * バリアントに応じたスタイルを取得
 *
 * @param variant - ボタンのバリアント
 * @returns バリアント別のスタイル
 */
const getVariantStyle = (variant: ButtonVariant) => {
  return variantStyles[variant];
};

// ============================================
// エクスポート
// ============================================

export default memo(Button);
