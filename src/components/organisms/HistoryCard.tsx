/**
 * HistoryCard - 履歴カードコンポーネント
 *
 * 聴取済みタスクの履歴情報を表示
 * - 放送局名・番組名
 * - 完了マーク
 * - 放送日時・聴取日時
 * - タップ動作なし（参照のみ）
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/atoms';
import { TaskWithProgram } from '@/types';
import { formatDate, formatBroadcastDatetime } from '@/utils/dateUtils';
import { theme } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * HistoryCardコンポーネントのプロパティ
 */
export interface HistoryCardProps {
  /** タスク情報（番組情報含む、completed状態のみ） */
  task: TaskWithProgram;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 履歴カードコンポーネント
 *
 * 聴取済みタスクの履歴を表示
 * 放送日時と聴取完了日時を分かりやすく表示
 *
 * @example
 * <HistoryCard task={completedTask} />
 */
const HistoryCard: React.FC<HistoryCardProps> = ({ task }) => {
  return (
    <View style={styles.card}>
      {/* ヘッダー: 放送局と完了マーク */}
      <View style={styles.header}>
        <View style={styles.stationInfo}>
          <Text style={styles.emoji}>📻</Text>
          <Text style={styles.station}>{task.station_name}</Text>
        </View>
        <Text style={styles.completedMark}>✅完了</Text>
      </View>

      {/* 番組名 */}
      <Text style={styles.programName} numberOfLines={2}>
        {task.program_name}
      </Text>

      {/* 放送日時 */}
      <Text style={styles.datetime}>
        放送: {formatBroadcastDatetime(task.broadcast_datetime, 'M/D(ddd) HH:mm')}
      </Text>

      {/* 聴取日時 */}
      {task.completed_at && (
        <Text style={styles.datetime}>聴取: {formatDate(task.completed_at, 'M/D(ddd) HH:mm')}</Text>
      )}
    </View>
  );
};

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    // カードのシャドウ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1, // Android用のシャドウ
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: theme.typography.fontSize.body,
    marginRight: theme.spacing.xs,
  },
  station: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  completedMark: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.bold,
  },
  programName: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  datetime: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
});

// ============================================
// エクスポート
// ============================================

// displayNameを設定（デバッグ時に役立つ）
HistoryCard.displayName = 'HistoryCard';

// memoでラップしてエクスポート
export default memo(HistoryCard);
