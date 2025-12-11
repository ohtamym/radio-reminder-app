/**
 * TaskCard - タスクカードコンポーネント
 *
 * タスク一覧画面で使用するタスクカード
 * - タスク情報の表示
 * - ステータスバッジ
 * - 期限情報
 * - ステータス変更ボタン
 * - パフォーマンス最適化（React.memo with custom comparison）
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Button, Badge } from '@/components/atoms';
import { TaskWithProgram, TaskStatus } from '@/types';
import {
  formatDate,
  formatBroadcastDatetime,
  calculateRemainingDays,
  getRemainingDaysColor,
} from '@/utils/dateUtils';
import { theme } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * TaskCardコンポーネントのプロパティ
 */
export interface TaskCardProps {
  /** タスク情報（番組情報含む） */
  task: TaskWithProgram;
  /** カードタップ時のコールバック */
  onPress: () => void;
  /** ステータス変更時のコールバック */
  onStatusChange: (status: TaskStatus) => void;
}

// ============================================
// パフォーマンス最適化
// ============================================

/**
 * propsの比較関数
 *
 * タスクID、ステータス、期限が変更された場合のみ再レンダリング
 * これにより、不要な再レンダリングを防ぎ、FlatListのパフォーマンスを向上
 *
 * @param prevProps - 前のprops
 * @param nextProps - 次のprops
 * @returns propsが等しい場合はtrue
 */
const arePropsEqual = (
  prevProps: TaskCardProps,
  nextProps: TaskCardProps
): boolean => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.deadline_datetime === nextProps.task.deadline_datetime
  );
};

// ============================================
// コンポーネント
// ============================================

/**
 * タスクカードコンポーネント
 *
 * タスク情報を表示し、ステータス変更やタップ操作を処理
 * カスタム比較関数により、FlatListでの不要な再レンダリングを防止
 *
 * @example
 * <TaskCard
 *   task={task}
 *   onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
 *   onStatusChange={(status) => handleStatusChange(task.id, status)}
 * />
 */
const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onStatusChange }) => {
  // 残り日数と色を計算
  const remainingDays = calculateRemainingDays(task.deadline_datetime);
  const deadlineColor = getRemainingDaysColor(remainingDays);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${task.program_name}のタスク、残り${remainingDays}日`}
    >
      {/* ヘッダー: 放送局とステータスバッジ */}
      <View style={styles.header}>
        <View style={styles.stationInfo}>
          <Text style={styles.emoji}>📻</Text>
          <Text style={styles.station}>{task.station_name}</Text>
        </View>
        <Badge status={task.status} />
      </View>

      {/* 番組名 */}
      <Text style={styles.programName} numberOfLines={2}>
        {task.program_name}
      </Text>

      {/* 放送日時 */}
      <Text style={styles.datetime}>
        {formatBroadcastDatetime(task.broadcast_datetime, 'M/D(ddd) HH:mm')}
      </Text>

      {/* 期限情報 */}
      <Text style={[styles.deadline, { color: deadlineColor }]}>
        期限: あと{remainingDays}日 ({formatDate(task.deadline_datetime, 'M/D HH:mm')})
      </Text>

      {/* ステータス変更ボタン */}
      <View style={styles.actions}>
        {task.status === 'unlistened' && (
          <>
            <Button
              variant="secondary"
              onPress={() => onStatusChange('listening')}
            >
              聴取中へ
            </Button>
            <Button
              variant="primary"
              onPress={() => onStatusChange('completed')}
            >
              完了
            </Button>
          </>
        )}
        {task.status === 'listening' && (
          <>
            <Button
              variant="secondary"
              onPress={() => onStatusChange('unlistened')}
            >
              未聴取へ
            </Button>
            <Button
              variant="primary"
              onPress={() => onStatusChange('completed')}
            >
              完了
            </Button>
          </>
        )}
      </View>
    </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Android用のシャドウ
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
  },
  emoji: {
    fontSize: theme.typography.fontSize.body,
    marginRight: 6,
  },
  station: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
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
    marginBottom: theme.spacing.xs,
  },
  deadline: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: '600', // semiBoldに相当
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});

// ============================================
// エクスポート
// ============================================

// displayNameを設定（デバッグ時に役立つ）
TaskCard.displayName = 'TaskCard';

// memoでラップしてエクスポート
export default memo(TaskCard, arePropsEqual);
