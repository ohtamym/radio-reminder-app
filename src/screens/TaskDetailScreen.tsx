/**
 * TaskDetailScreen - タスク詳細画面
 *
 * タスクの詳細情報を表示し、操作を提供
 * - タスク詳細の表示
 * - ステータス変更（ラジオボタン）
 * - 番組編集画面への遷移
 * - 削除処理（単発・繰り返し）
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TaskDetailView, DeleteConfirmDialog } from '@/components/organisms';
import { RadioButtonGroup, LoadingSpinner } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { TaskService } from '@/services/TaskService';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useProgram } from '@/hooks/useProgram';
import { TaskWithProgram, TaskStatus } from '@/types';
import { STATUS_CONFIG } from '@/constants';
import { theme } from '@/theme';
import { RootStackParamList } from '@/navigation/types';

// ============================================
// 型定義
// ============================================

/**
 * TaskDetailScreenのプロパティ型
 *
 * React Navigationのスタック画面プロパティを使用
 */
type TaskDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

// ============================================
// コンポーネント
// ============================================

/**
 * タスク詳細画面コンポーネント
 *
 * タスク情報を表示し、ステータス変更、編集、削除の機能を提供
 * completedステータスに変更した場合は自動的に一覧画面に戻る
 *
 * @example
 * <TaskDetailScreen navigation={navigation} route={{ params: { taskId: 1 } }} />
 */
export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  navigation,
  route,
}) => {
  // ============================================
  // State & Hooks
  // ============================================

  const { db } = useDatabase();
  const { deleteProgram } = useProgram();
  const [task, setTask] = useState<TaskWithProgram | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const taskId = route.params.taskId;

  // ============================================
  // データ取得
  // ============================================

  /**
   * タスク情報を取得
   */
  const fetchTask = useCallback(async () => {
    if (!db || !taskId) {
      return;
    }

    setLoading(true);
    try {
      const fetchedTask = await TaskService.getTaskById(db, taskId);
      if (fetchedTask) {
        setTask(fetchedTask);
      } else {
        console.error('[TaskDetailScreen] Task not found:', taskId);
        // タスクが見つからない場合は前画面に戻る
        navigation.goBack();
      }
    } catch (error) {
      console.error('[TaskDetailScreen] Failed to fetch task:', error);
      // エラーが発生した場合も前画面に戻る
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [db, taskId, navigation]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // ============================================
  // イベントハンドラ
  // ============================================

  /**
   * ステータス変更ハンドラ
   *
   * ステータスを即座に更新
   * completedに変更した場合は、タスク一覧画面に自動的に戻る
   */
  const handleStatusChange = useCallback(
    async (status: TaskStatus) => {
      if (!db || !taskId || !task) {
        return;
      }

      setUpdating(true);
      try {
        await TaskService.updateTaskStatus(db, taskId, status);
        console.log('[TaskDetailScreen] Status updated:', status);

        // タスク情報を更新
        setTask({ ...task, status });

        // completedステータスに変更した場合は一覧画面に戻る
        if (status === 'completed') {
          navigation.goBack();
        }
      } catch (error) {
        console.error('[TaskDetailScreen] Failed to update status:', error);
      } finally {
        setUpdating(false);
      }
    },
    [db, taskId, task, navigation]
  );

  /**
   * 編集ボタンハンドラ
   *
   * 番組編集画面へ遷移
   */
  const handleEdit = useCallback(() => {
    if (!task) {
      return;
    }

    navigation.navigate('ProgramForm', { programId: task.program_id });
  }, [task, navigation]);

  /**
   * 削除ボタンハンドラ
   *
   * 削除確認ダイアログを表示
   */
  const handleDeletePress = useCallback(() => {
    setDeleteDialogVisible(true);
  }, []);

  /**
   * 「この回だけ削除」ハンドラ
   *
   * 現在のタスクのみを削除
   */
  const handleDeleteThis = useCallback(async () => {
    if (!db || !taskId) {
      return;
    }

    try {
      await TaskService.deleteTask(db, taskId);
      console.log('[TaskDetailScreen] Task deleted:', taskId);

      // 削除成功後は一覧画面に戻る
      navigation.goBack();
    } catch (error) {
      console.error('[TaskDetailScreen] Failed to delete task:', error);
    } finally {
      setDeleteDialogVisible(false);
    }
  }, [db, taskId, navigation]);

  /**
   * 「繰り返し設定ごと削除」ハンドラ
   *
   * 番組と関連するすべてのタスクを削除
   */
  const handleDeleteAll = useCallback(async () => {
    if (!task) {
      return;
    }

    try {
      const success = await deleteProgram(task.program_id);
      if (success) {
        console.log('[TaskDetailScreen] Program deleted:', task.program_id);

        // 削除成功後は一覧画面に戻る
        navigation.goBack();
      }
    } catch (error) {
      console.error('[TaskDetailScreen] Failed to delete program:', error);
    } finally {
      setDeleteDialogVisible(false);
    }
  }, [task, deleteProgram, navigation]);

  /**
   * ダイアログキャンセルハンドラ
   */
  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogVisible(false);
  }, []);

  // ============================================
  // レンダリング
  // ============================================

  // データ取得中
  if (loading) {
    return <LoadingSpinner message="タスク情報を読み込んでいます..." />;
  }

  // タスクが取得できていない場合は何も表示しない
  // （useEffectで前画面に戻る処理が実行される）
  if (!task) {
    return null;
  }

  // ステータス選択肢
  const statusOptions = [
    {
      label: STATUS_CONFIG.unlistened.label,
      value: 'unlistened' as TaskStatus,
    },
    {
      label: STATUS_CONFIG.listening.label,
      value: 'listening' as TaskStatus,
    },
    {
      label: STATUS_CONFIG.completed.label,
      value: 'completed' as TaskStatus,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* タスク詳細表示 */}
        <TaskDetailView task={task} />

        {/* ステータス変更セクション */}
        <View style={styles.section}>
          <RadioButtonGroup
            label="ステータス変更"
            options={statusOptions}
            value={task.status}
            onChange={handleStatusChange}
          />
        </View>

        {/* 操作ボタン */}
        <View style={styles.actions}>
          <Button
            variant="secondary"
            onPress={handleEdit}
            fullWidth
            disabled={updating}
          >
            番組情報を編集
          </Button>

          <Button
            variant="danger"
            onPress={handleDeletePress}
            fullWidth
            disabled={updating}
          >
            削除
          </Button>
        </View>
      </ScrollView>

      {/* 削除確認ダイアログ */}
      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        repeatType={task.repeat_type}
        onDeleteThis={handleDeleteThis}
        onDeleteAll={handleDeleteAll}
        onCancel={handleDeleteCancel}
      />
    </View>
  );
};

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actions: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});

// ============================================
// エクスポート
// ============================================

export default TaskDetailScreen;
