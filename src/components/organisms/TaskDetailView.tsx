/**
 * TaskDetailView - タスク詳細表示コンポーネント
 *
 * タスクの詳細情報を表示
 * - 放送局名・番組名
 * - 放送日時・視聴期限
 * - ステータス
 * - 繰り返し設定
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge, Text } from '@/components/atoms';
import { DeadlineInfo } from '@/components/molecules';
import { TaskWithProgram } from '@/types';
import { theme } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * TaskDetailViewコンポーネントのプロパティ
 */
export interface TaskDetailViewProps {
  /** タスク情報（番組情報含む） */
  task: TaskWithProgram;
}

// ============================================
// コンポーネント
// ============================================

/**
 * タスク詳細表示コンポーネント
 *
 * タスクの詳細情報を整理して表示
 * 操作ボタン等は含まず、情報表示に特化
 *
 * @example
 * <TaskDetailView task={task} />
 */
const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task }) => {
  // 繰り返し設定のラベル
  const repeatTypeLabel = task.repeat_type === 'weekly' ? '毎週' : 'なし（単発）';

  return (
    <View style={styles.container}>
      {/* 放送局名 */}
      <View style={styles.stationRow}>
        <Text style={styles.emoji}>📻</Text>
        <Text style={styles.station}>{task.station_name}</Text>
      </View>

      {/* 番組名 */}
      <Text style={styles.programName}>{task.program_name}</Text>

      {/* 区切り線 */}
      <View style={styles.divider} />

      {/* 放送日時・視聴期限 */}
      <DeadlineInfo
        broadcastDatetime={task.broadcast_datetime}
        deadline={task.deadline_datetime}
      />

      {/* ステータス */}
      <View style={styles.section}>
        <Text style={styles.label}>ステータス</Text>
        <Badge status={task.status} />
      </View>

      {/* 繰り返し設定 */}
      <View style={styles.section}>
        <Text style={styles.label}>繰り返し設定</Text>
        <Text style={styles.value}>{repeatTypeLabel}</Text>
      </View>
    </View>
  );
};

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  emoji: {
    fontSize: theme.typography.fontSize.body,
    marginRight: theme.spacing.xs,
  },
  station: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
  },
  programName: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text,
  },
});

// ============================================
// エクスポート
// ============================================

// displayNameを設定（デバッグ時に役立つ）
TaskDetailView.displayName = 'TaskDetailView';

// memoでラップしてエクスポート
export default memo(TaskDetailView);
