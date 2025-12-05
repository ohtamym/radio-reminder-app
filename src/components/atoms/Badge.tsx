/**
 * Badge - ステータスバッジコンポーネント
 *
 * タスクのステータスを視覚的に表示
 * - 絵文字表示
 * - ステータスに応じた色分け
 * - 3種類のステータス（unlistened, listening, completed）
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { TaskStatus } from '@/types';
import { STATUS_CONFIG } from '@/constants';
import { typography } from '@/theme/typography';
import { borderRadius } from '@/theme';
import { spacing } from '@/theme/spacing';

// ============================================
// 型定義
// ============================================

/**
 * Badgeコンポーネントのプロパティ
 */
export interface BadgeProps {
  /** タスクのステータス */
  status: TaskStatus;
  /** カスタムスタイル */
  style?: ViewStyle;
}

// ============================================
// コンポーネント
// ============================================

/**
 * ステータスバッジコンポーネント
 *
 * STATUS_CONFIGを使用してステータスに応じた
 * 絵文字、色、ラベルを表示
 *
 * @example
 * // 未聴取バッジ
 * <Badge status="unlistened" />
 *
 * // 聴取中バッジ
 * <Badge status="listening" />
 *
 * // 聴取済バッジ
 * <Badge status="completed" />
 */
const Badge: React.FC<BadgeProps> = ({ status, style }) => {
  const config = STATUS_CONFIG[status];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.color },
        style,
      ]}
    >
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
};

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
    gap: 4,
  },
  emoji: {
    fontSize: typography.fontSize.caption,
  },
  label: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF', // 背景色が濃いため常に白文字
  },
});

// ============================================
// エクスポート
// ============================================

export default memo(Badge);
