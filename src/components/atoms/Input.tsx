/**
 * Input - テキスト入力コンポーネント
 *
 * フォーム入力用のテキストフィールド
 * - エラー表示対応
 * - ラベル表示
 * - プレースホルダー対応
 */

import React, { memo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Text from './Text';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import { borderRadius } from '@/theme/borderRadius';

// ============================================
// 型定義
// ============================================

/**
 * Inputコンポーネントのプロパティ
 */
export interface InputProps extends TextInputProps {
  /** ラベルテキスト */
  label?: string;
  /** エラーメッセージ */
  error?: string;
  /** カスタムスタイル */
  style?: ViewStyle;
}

// ============================================
// コンポーネント
// ============================================

/**
 * テキスト入力コンポーネント
 *
 * ラベルとエラーメッセージ表示に対応
 * テーマの色とスタイルを使用
 *
 * @example
 * // 基本的な使用
 * <Input
 *   label="放送局名"
 *   placeholder="例: TBSラジオ"
 *   value={stationName}
 *   onChangeText={setStationName}
 * />
 *
 * // エラー表示
 * <Input
 *   label="番組名"
 *   placeholder="例: アフター6ジャンクション"
 *   value={programName}
 *   onChangeText={setProgramName}
 *   error="番組名は必須です"
 * />
 */
const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...rest
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
        ]}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontSize: typography.fontSize.caption,
    color: colors.error,
    marginTop: 4,
  },
});

// ============================================
// エクスポート
// ============================================

export default memo(Input);
