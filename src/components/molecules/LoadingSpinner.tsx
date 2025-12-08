/**
 * LoadingSpinner - ローディング表示コンポーネント
 *
 * データ読み込み中の状態を表示
 * ActivityIndicatorとオプションのメッセージを表示
 */

import React, { memo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * LoadingSpinnerコンポーネントのプロパティ
 */
export interface LoadingSpinnerProps {
  /** ローディングメッセージ（オプション） */
  message?: string;
  /** スピナーのサイズ */
  size?: 'small' | 'large';
}

// ============================================
// コンポーネント
// ============================================

/**
 * ローディング表示コンポーネント
 *
 * データ取得中などのローディング状態を表示
 * ActivityIndicatorとオプションメッセージを中央に配置
 *
 * @example
 * // スピナーのみ
 * <LoadingSpinner />
 *
 * @example
 * // メッセージ付き
 * <LoadingSpinner message="読み込み中..." size="large" />
 *
 * @example
 * // 小サイズ
 * <LoadingSpinner size="small" />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(
  ({ message, size = 'large' }) => {
    return (
      <View style={styles.container}>
        <ActivityIndicator size={size} color={colors.primary} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
