/**
 * TaskListScreen - タスク一覧画面
 *
 * アクティブなタスク一覧を表示
 * - FlatListでタスク一覧表示
 * - 期限切れタスクの自動クリーンアップ
 * - ステータス変更処理
 * - プルツーリフレッシュ
 * - 空状態の表示
 * - ローディング表示
 * - パフォーマンス最適化
 */

import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { TaskCard } from '@/components/organisms';
import { EmptyState, LoadingSpinner } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { useTasks } from '@/hooks/useTasks';
import { TaskWithProgram, TaskStatus } from '@/types';
import { theme } from '@/theme';
import { RootStackParamList } from '@/navigation/types';

// ============================================
// 型定義
// ============================================

/**
 * TaskListScreenのプロパティ型
 *
 * React Navigationのスタック画面プロパティを使用
 */
type TaskListScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

// ============================================
// コンポーネント
// ============================================

/**
 * タスク一覧画面コンポーネント
 *
 * アクティブタスクを一覧表示し、ステータス変更やナビゲーション機能を提供
 * パフォーマンス最適化のため、各コールバックをメモ化
 *
 * @example
 * <TaskListScreen navigation={navigation} />
 */
export const TaskListScreen: React.FC<TaskListScreenProps> = ({ navigation }) => {
  // ============================================
  // State & Hooks
  // ============================================

  const { tasks, loading, refreshing, updateStatus, refresh } = useTasks();

  // ============================================
  // 画面フォーカス時の処理
  // ============================================

  /**
   * 画面がフォーカスされたときにデータを再取得
   *
   * 番組登録後やタスク詳細画面からの戻り時に
   * 最新のデータを表示するため
   */
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  // ============================================
  // イベントハンドラ（useCallbackでメモ化）
  // ============================================

  /**
   * ステータス変更ハンドラ
   *
   * タスクのステータスを更新
   * completedに変更した場合、繰り返し設定があれば次回タスクを自動生成
   */
  const handleStatusChange = useCallback(
    async (taskId: number, status: TaskStatus) => {
      await updateStatus(taskId, status);
    },
    [updateStatus]
  );

  /**
   * タスクタップハンドラ
   *
   * タスク詳細画面へ遷移
   */
  const handleTaskPress = useCallback(
    (taskId: number) => {
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation]
  );

  /**
   * 新規登録ボタンハンドラ
   *
   * 番組登録画面へ遷移
   */
  const handleAddPress = useCallback(() => {
    navigation.navigate('ProgramForm');
  }, [navigation]);

  /**
   * 履歴ボタンハンドラ
   *
   * 履歴画面へ遷移
   */
  const handleHistoryPress = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  /**
   * keyExtractor（メモ化）
   *
   * FlatListの各アイテムに一意のキーを提供
   */
  const keyExtractor = useCallback(
    (item: TaskWithProgram) => item.id.toString(),
    []
  );

  /**
   * renderItem（メモ化）
   *
   * FlatListの各アイテムをレンダリング
   */
  const renderItem = useCallback(
    ({ item }: { item: TaskWithProgram }) => (
      <TaskCard
        task={item}
        onPress={() => handleTaskPress(item.id)}
        onStatusChange={(status) => handleStatusChange(item.id, status)}
      />
    ),
    [handleTaskPress, handleStatusChange]
  );

  // ============================================
  // レンダリング
  // ============================================

  // 初回ローディング中
  if (loading) {
    return <LoadingSpinner message="タスクを読み込んでいます..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="📻"
            message="まだタスクがありません"
            subMessage="右上の[+]ボタンから番組を登録しましょう"
          />
        }
        contentContainerStyle={tasks.length === 0 ? styles.emptyList : styles.list}
        // プルツーリフレッシュ
        onRefresh={refresh}
        refreshing={refreshing}
        // パフォーマンス最適化
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={10}
      />

      {/* フッター: 履歴ボタン */}
      <View style={styles.footer}>
        <Button variant="secondary" onPress={handleHistoryPress} fullWidth>
          履歴を見る
        </Button>
      </View>
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
  list: {
    padding: theme.spacing.lg,
  },
  emptyList: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

// ============================================
// エクスポート
// ============================================

export default TaskListScreen;
