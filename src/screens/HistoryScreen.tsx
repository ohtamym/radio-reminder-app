/**
 * HistoryScreen - 履歴画面
 *
 * 聴取済みタスクの履歴を表示
 * - FlatListで履歴一覧表示
 * - 完了日時の降順ソート
 * - 空状態の表示
 * - ローディング表示
 * - タップ動作なし（参照のみ）
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { HistoryCard } from '@/components/organisms';
import { EmptyState, LoadingSpinner } from '@/components/molecules';
import { TaskService } from '@/services/TaskService';
import { useDatabase } from '@/contexts/DatabaseContext';
import { TaskWithProgram } from '@/types';
import { theme } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * HistoryScreenのナビゲーションプロパティ
 *
 * 注: ナビゲーション設定が完了したら、適切な型に置き換える
 */
interface HistoryScreenProps {
  navigation?: any;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 履歴画面コンポーネント
 *
 * 聴取済みタスクを完了日時の降順で表示
 * タップ動作はなく、参照のみ
 *
 * @example
 * <HistoryScreen navigation={navigation} />
 */
export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  // ============================================
  // State & Hooks
  // ============================================

  const { db } = useDatabase();
  const [history, setHistory] = useState<TaskWithProgram[]>([]);
  const [loading, setLoading] = useState(false);

  // ============================================
  // データ取得
  // ============================================

  /**
   * 履歴を取得
   */
  const fetchHistory = useCallback(async () => {
    if (!db) {
      return;
    }

    setLoading(true);
    try {
      const fetchedHistory = await TaskService.getHistory(db);
      setHistory(fetchedHistory);
      console.log('[HistoryScreen] History fetched:', fetchedHistory.length);
    } catch (error) {
      console.error('[HistoryScreen] Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ============================================
  // レンダリング関数
  // ============================================

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
    ({ item }: { item: TaskWithProgram }) => <HistoryCard task={item} />,
    []
  );

  // ============================================
  // レンダリング
  // ============================================

  // 初回ローディング中
  if (loading) {
    return <LoadingSpinner message="履歴を読み込んでいます..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="✅"
            message="まだ聴取履歴がありません"
            subMessage="タスクを完了すると、ここに履歴が表示されます"
          />
        }
        contentContainerStyle={
          history.length === 0 ? styles.emptyList : styles.list
        }
        // パフォーマンス最適化
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={10}
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
  list: {
    padding: theme.spacing.lg,
  },
  emptyList: {
    flex: 1,
    padding: theme.spacing.lg,
  },
});

// ============================================
// エクスポート
// ============================================

export default HistoryScreen;
