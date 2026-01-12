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
// デバッグ用モーダルのインポート（コメントアウト）
// import { NotificationService } from '@/services/NotificationService';
// import * as Notifications from 'expo-notifications';

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

  const { tasks, loading, refreshing, updatingTaskIds, updateStatus, refresh } = useTasks();

  // デバッグ用: スケジュール済み通知の表示（コメントアウト）
  // const [showDebugModal, setShowDebugModal] = useState(false);
  // const [scheduledNotifications, setScheduledNotifications] = useState<
  //   Notifications.NotificationRequest[]
  // >([]);

  // 初回マウント時にスケジュール済み通知を取得（コメントアウト）
  // useEffect(() => {
  //   const fetchScheduledNotifications = async () => {
  //     const notifications = await NotificationService.getScheduledNotifications();
  //     setScheduledNotifications(notifications);
  //     if (notifications.length > 0) {
  //       setShowDebugModal(true);
  //     }
  //   };

  //   fetchScheduledNotifications();
  // }, []);

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
   * デバッグモーダルを閉じる（コメントアウト）
   */
  // const handleCloseDebugModal = useCallback(() => {
  //   setShowDebugModal(false);
  // }, []);

  /**
   * keyExtractor（メモ化）
   *
   * FlatListの各アイテムに一意のキーを提供
   */
  const keyExtractor = useCallback((item: TaskWithProgram) => item.id.toString(), []);

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
        isUpdating={updatingTaskIds.has(item.id)}
      />
    ),
    [handleTaskPress, handleStatusChange, updatingTaskIds]
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

      {/* デバッグ用: スケジュール済み通知モーダル（コメントアウト） */}
      {/* <Modal
        visible={showDebugModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseDebugModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              スケジュール済み通知 ({scheduledNotifications.length}件)
            </Text>

            <ScrollView style={styles.modalScrollView}>
              {scheduledNotifications.length === 0 ? (
                <Text style={styles.modalText}>スケジュール済み通知はありません</Text>
              ) : (
                scheduledNotifications.map((notification, index) => (
                  <View key={notification.identifier} style={styles.notificationItem}>
                    <Text style={styles.notificationIndex}>#{index + 1}</Text>
                    <Text style={styles.notificationId}>ID: {notification.identifier}</Text>
                    <Text style={styles.notificationTitle}>{notification.content.title}</Text>
                    <Text style={styles.notificationBody}>{notification.content.body}</Text>
                    {notification.trigger ? (
                      <View>
                        <Text style={styles.notificationDate}>
                          Trigger型: {(notification.trigger as any).type || '不明'}
                        </Text>
                        {(() => {
                          const trigger = notification.trigger as any;
                          if (trigger.date) {
                            return (
                              <Text style={styles.notificationDate}>
                                日時: {new Date(trigger.date).toLocaleString('ja-JP')}
                              </Text>
                            );
                          }
                          if (trigger.value !== undefined && trigger.value !== null) {
                            return (
                              <Text style={styles.notificationDate}>
                                日時:{' '}
                                {new Date(trigger.value).toLocaleString('ja-JP', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </Text>
                            );
                          }
                          return (
                            <Text style={styles.notificationDate}>日時情報が見つかりません</Text>
                          );
                        })()}
                        {/* デバッグ: trigger構造を表示 */}
                        {/* <Text style={styles.debugText}>
                          Debug: {JSON.stringify(notification.trigger, null, 2)}
                        </Text> */}
                      {/* </View>
                    ) : (
                      <Text style={styles.notificationDate}>Trigger情報なし</Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            <Button variant="primary" onPress={handleCloseDebugModal} fullWidth>
              閉じる
            </Button>
          </View>
        </View>
      </Modal> */}
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
  // デバッグモーダルのスタイル（コメントアウト）
  // modalOverlay: {
  //   flex: 1,
  //   backgroundColor: 'rgba(0, 0, 0, 0.5)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   padding: theme.spacing.lg,
  // },
  // modalContent: {
  //   backgroundColor: theme.colors.background,
  //   borderRadius: 12,
  //   padding: theme.spacing.lg,
  //   width: '100%',
  //   maxHeight: '80%',
  // },
  // modalTitle: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   marginBottom: theme.spacing.md,
  //   color: theme.colors.text,
  // },
  // modalScrollView: {
  //   maxHeight: 400,
  //   marginBottom: theme.spacing.md,
  // },
  // modalText: {
  //   fontSize: 14,
  //   color: theme.colors.textSecondary,
  // },
  // notificationItem: {
  //   backgroundColor: theme.colors.cardBackground,
  //   borderRadius: 8,
  //   padding: theme.spacing.md,
  //   marginBottom: theme.spacing.md,
  //   borderWidth: 1,
  //   borderColor: theme.colors.border,
  // },
  // notificationIndex: {
  //   fontSize: 12,
  //   fontWeight: 'bold',
  //   color: theme.colors.primary,
  //   marginBottom: theme.spacing.xs,
  // },
  // notificationId: {
  //   fontSize: 12,
  //   color: theme.colors.textSecondary,
  //   marginBottom: theme.spacing.xs,
  // },
  // notificationTitle: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   color: theme.colors.text,
  //   marginBottom: theme.spacing.xs,
  // },
  // notificationBody: {
  //   fontSize: 13,
  //   color: theme.colors.text,
  //   marginBottom: theme.spacing.xs,
  // },
  // notificationDate: {
  //   fontSize: 12,
  //   color: theme.colors.textSecondary,
  //   fontStyle: 'italic',
  // },
  // debugText: {
  //   fontSize: 10,
  //   color: theme.colors.error,
  //   fontFamily: 'monospace',
  //   marginTop: theme.spacing.xs,
  // },
});

// ============================================
// エクスポート
// ============================================

export default TaskListScreen;
