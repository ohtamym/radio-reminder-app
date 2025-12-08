/**
 * EmptyState - 空状態表示コンポーネント
 *
 * データがない状態を視覚的に表示
 * アイコン、メッセージ、サブメッセージで構成
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * EmptyStateコンポーネントのプロパティ
 */
export interface EmptyStateProps {
  /** アイコン（絵文字または文字列） */
  icon: string;
  /** メインメッセージ */
  message: string;
  /** サブメッセージ（補足説明） */
  subMessage?: string;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 空状態表示コンポーネント
 *
 * リストが空の場合などに表示
 * アイコンとメッセージで状態を説明
 *
 * @example
 * <EmptyState
 *   icon="📻"
 *   message="まだタスクがありません"
 *   subMessage="右上の[+]ボタンから番組を登録しましょう"
 * />
 *
 * @example
 * // サブメッセージなし
 * <EmptyState
 *   icon="✓"
 *   message="すべてのタスクが完了しました"
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = memo(
  ({ icon, message, subMessage }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{message}</Text>
        {subMessage && <Text style={styles.subMessage}>{subMessage}</Text>}
      </View>
    );
  }
);

EmptyState.displayName = 'EmptyState';

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
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subMessage: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.body,
  },
});
