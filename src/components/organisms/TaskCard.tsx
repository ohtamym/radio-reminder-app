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
import dayjs from 'dayjs';

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
  /** 更新処理中かどうか */
  isUpdating?: boolean;
}

// ============================================
// パフォーマンス最適化
// ============================================

/**
 * propsの比較関数
 *
 * タスクID、ステータス、期限、番組名、放送局名、更新状態が変更された場合のみ再レンダリング
 * これにより、不要な再レンダリングを防ぎつつ、番組情報の変更も正しく反映
 *
 * @param prevProps - 前のprops
 * @param nextProps - 次のprops
 * @returns propsが等しい場合はtrue
 */
const arePropsEqual = (prevProps: TaskCardProps, nextProps: TaskCardProps): boolean => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.deadline_datetime === nextProps.task.deadline_datetime &&
    prevProps.task.program_name === nextProps.task.program_name &&
    prevProps.task.station_name === nextProps.task.station_name &&
    prevProps.isUpdating === nextProps.isUpdating
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
const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, onStatusChange, isUpdating = false }) => {
  // 残り日数と色を計算
  const remainingDays = calculateRemainingDays(task.deadline_datetime);
  const deadlineColor = getRemainingDaysColor(remainingDays);

  // 放送日時が未来かどうかを判定
  const isFutureBroadcast = dayjs().isBefore(task.broadcast_datetime);

  // 未来の放送の場合、透明度を下げる
  const contentOpacity = isFutureBroadcast ? 0.5 : 1;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${task.program_name}のタスク、残り${remainingDays}日`}
    >
      {/* ヘッダー: 放送局とステータスバッジ */}
      <View style={[styles.header, { opacity: contentOpacity }]}>
        <View style={styles.stationInfo}>
          <Text style={styles.emoji}>📻</Text>
          <Text style={styles.station}>{task.station_name}</Text>
        </View>
        <Badge status={task.status} />
      </View>

      {/* 番組名 */}
      <Text style={[styles.programName, { opacity: contentOpacity }]} numberOfLines={2}>
        {task.program_name}
      </Text>

      {/* 放送日時 */}
      <Text style={[styles.datetime, { opacity: contentOpacity }]}>
        {formatBroadcastDatetime(task.broadcast_datetime, 'M/D(ddd) HH:mm')}
      </Text>

      {/* 期限情報 */}
      <Text style={[styles.deadline, { color: deadlineColor, opacity: contentOpacity }]}>
        期限: あと{remainingDays}日 ({formatDate(task.deadline_datetime, 'M/D HH:mm')})
      </Text>

      {/* ステータス変更ボタン */}
      <View style={[styles.actions, { opacity: contentOpacity }]}>
        {task.status === 'unlistened' && (
          <>
            <Button
              variant="secondary"
              onPress={() => onStatusChange('listening')}
              disabled={isUpdating}
              loading={isUpdating}
            >
              聴取中へ
            </Button>
            <Button
              variant="primary"
              onPress={() => onStatusChange('completed')}
              disabled={isUpdating}
              loading={isUpdating}
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
              disabled={isUpdating}
              loading={isUpdating}
            >
              未聴取へ
            </Button>
            <Button
              variant="primary"
              onPress={() => onStatusChange('completed')}
              disabled={isUpdating}
              loading={isUpdating}
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
