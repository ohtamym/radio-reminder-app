/**
 * DeadlineInfo - 期限情報表示コンポーネント
 *
 * 放送日時、視聴期限、残り日数を表示
 * 残り日数に応じて色分け表示
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  formatDate,
  formatBroadcastDatetime,
  calculateRemainingDays,
  getRemainingDaysColor,
} from '@/utils/dateUtils';
import { colors, spacing } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * DeadlineInfoコンポーネントのプロパティ
 */
export interface DeadlineInfoProps {
  /** 視聴期限（ISO8601形式） */
  deadline: string;
  /** 放送日時（ISO8601形式） */
  broadcastDatetime: string;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 期限情報表示コンポーネント
 *
 * 放送日時と視聴期限を表示し、残り日数を色分けして表示
 * - 残り日数が少ないほど警告色で表示
 *
 * @example
 * <DeadlineInfo
 *   broadcastDatetime="2024-01-15T18:00:00+09:00"
 *   deadline="2024-01-23T05:00:00+09:00"
 * />
 */
export const DeadlineInfo: React.FC<DeadlineInfoProps> = memo(({ deadline, broadcastDatetime }) => {
  const remainingDays = calculateRemainingDays(deadline);
  const color = getRemainingDaysColor(remainingDays);

  return (
    <View style={styles.container}>
      {/* 放送日時 */}
      <View style={styles.row}>
        <Text style={styles.label}>放送日時</Text>
        <Text style={styles.value}>
          {formatBroadcastDatetime(broadcastDatetime, 'YYYY/MM/DD(ddd) HH:mm')}
        </Text>
      </View>

      {/* 視聴期限 */}
      <View style={styles.row}>
        <Text style={styles.label}>視聴期限</Text>
        <View>
          <Text style={styles.value}>{formatDate(deadline, 'YYYY/MM/DD(ddd) HH:mm')}</Text>
          <Text style={[styles.remaining, { color }]}>あと{remainingDays}日</Text>
        </View>
      </View>
    </View>
  );
});

DeadlineInfo.displayName = 'DeadlineInfo';

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: colors.text,
  },
  remaining: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 4,
  },
});
