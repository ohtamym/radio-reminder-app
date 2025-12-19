/**
 * useTasks - タスク管理のカスタムフック
 *
 * タスクの取得、ステータス更新、期限切れタスクの処理などを提供
 * - タスク一覧の取得
 * - ステータス更新処理
 * - 期限切れタスクのクリーンアップ
 * - 次回タスクの自動生成
 * - ローディング状態の管理
 * - エラーハンドリング
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { TaskWithProgram, TaskStatus } from '@/types';
import { TaskService, CleanedUpTask } from '@/services/TaskService';
import { useDatabase } from '@/contexts/DatabaseContext';
import { handleError } from '@/utils/errorHandler';
import { formatBroadcastDatetime } from '@/utils/dateUtils';

// ============================================
// 型定義
// ============================================

/**
 * useTasksフックの戻り値の型
 */
export interface UseTasksReturn {
  /** タスク一覧（期限順にソート済み） */
  tasks: TaskWithProgram[];
  /** ローディング中かどうか */
  loading: boolean;
  /** リフレッシュ中かどうか */
  refreshing: boolean;
  /** タスクのステータスを更新 */
  updateStatus: (id: number, status: TaskStatus) => Promise<void>;
  /** タスク一覧を再取得 */
  refresh: () => Promise<void>;
}

// ============================================
// ヘルパー関数
// ============================================

/**
 * クリーンアップ通知を表示
 *
 * 期限切れタスクをクリーンアップしたときに、
 * クリーンアップしたタスクの情報を通知する
 *
 * @param cleanedUpTasks - クリーンアップしたタスクの配列
 */
const showCleanupNotification = (cleanedUpTasks: CleanedUpTask[]): void => {
  // 通知メッセージを作成
  const message = cleanedUpTasks
    .map((task) => {
      const formattedDate = formatBroadcastDatetime(task.broadcastDatetime, 'YYYY/MM/DD(ddd) HH:mm');
      return `${task.stationName}\n${task.programName}\n${formattedDate}`;
    })
    .join('\n\n');

  const title = `期限切れタスク ${cleanedUpTasks.length}件をクリーンアップしました`;

  // 通知を表示
  Alert.alert(title, message, [{ text: 'OK' }]);
};

// ============================================
// カスタムフック
// ============================================

/**
 * タスク管理のカスタムフック
 *
 * アクティブタスクの取得、ステータス更新、期限切れタスクの自動削除を提供
 * タスクは期限の昇順で自動的にソートされる
 *
 * @returns タスク一覧と操作関数
 *
 * @example
 * const { tasks, loading, updateStatus, refresh } = useTasks();
 *
 * // ステータス更新
 * await updateStatus(taskId, 'completed');
 *
 * // 手動リフレッシュ
 * await refresh();
 */
export const useTasks = (): UseTasksReturn => {
  const { db, isReady } = useDatabase();
  const [tasks, setTasks] = useState<TaskWithProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * タスク一覧を取得
   *
   * 1. 期限切れタスクのクリーンアップ
   * 2. アクティブタスクを取得
   * 3. クリーンアップしたタスクがある場合、通知を表示
   */
  const loadTasks = useCallback(async () => {
    if (!db || !isReady) {
      return;
    }

    try {
      // 期限切れタスクをクリーンアップ
      // （繰り返し設定がある場合は次回タスクも自動生成される）
      const cleanedUpTasks = await TaskService.cleanupExpiredTasks(db);

      // アクティブタスクを取得
      const activeTasks = await TaskService.getActiveTasks(db);
      setTasks(activeTasks);

      // クリーンアップしたタスクがある場合、通知を表示
      if (cleanedUpTasks.length > 0) {
        showCleanupNotification(cleanedUpTasks);
      }
    } catch (error) {
      console.error('[useTasks] Failed to load tasks:', error);
      handleError(error);
    }
  }, [db, isReady]);

  /**
   * 初回読み込み
   *
   * データベースが準備完了したら自動的にタスクを読み込む
   */
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadTasks();
      setLoading(false);
    };

    init();
  }, [loadTasks]);

  /**
   * タスク一覧を再取得
   *
   * プルツーリフレッシュなどで使用
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  /**
   * タスクのステータスを更新
   *
   * 1. ステータスを更新
   * 2. completedに変更した場合、繰り返し設定があれば次回タスクを生成
   * 3. タスク一覧を再取得
   *
   * @param id - タスクID
   * @param status - 新しいステータス
   */
  const updateStatus = useCallback(
    async (id: number, status: TaskStatus) => {
      if (!db) {
        return;
      }

      try {
        // ステータスを更新
        await TaskService.updateTaskStatus(db, id, status);

        // completedに変更した場合、繰り返し設定を確認して次回タスクを生成
        if (status === 'completed') {
          // 更新したタスクの情報を取得
          const task = tasks.find((t) => t.id === id);

          if (task && task.repeat_type === 'weekly') {
            // 繰り返し設定がある場合は次回タスクを生成（前回放送日時から1週間後）
            await TaskService.generateNextTask(db, task.program_id, task.broadcast_datetime);
          }
        }

        // タスク一覧を再取得
        await loadTasks();
      } catch (error) {
        console.error('[useTasks] Failed to update status:', error);
        handleError(error);
      }
    },
    [db, tasks, loadTasks]
  );

  /**
   * タスクを期限順にソート
   *
   * useMemoでメモ化し、tasksが変更されたときのみ再計算
   * deadline_datetimeの昇順でソート
   */
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      return a.deadline_datetime.localeCompare(b.deadline_datetime);
    });
  }, [tasks]);

  return {
    tasks: sortedTasks,
    loading,
    refreshing,
    updateStatus,
    refresh,
  };
};
