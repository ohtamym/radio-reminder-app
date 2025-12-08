/**
 * StatusIndicator - ステータスバッジとボタンを表示
 *
 * タスクのステータスを視覚的に表示し、
 * 必要に応じてステータス変更ボタンを提供
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Badge from '@/components/atoms/Badge';
import Button from '@/components/atoms/Button';
import { TaskStatus } from '@/types';
import { spacing } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * StatusIndicatorコンポーネントのプロパティ
 */
export interface StatusIndicatorProps {
  /** 現在のタスクステータス */
  status: TaskStatus;
  /** ステータス変更コールバック */
  onStatusChange?: (status: TaskStatus) => void;
  /** ボタン表示フラグ */
  showButtons?: boolean;
}

// ============================================
// コンポーネント
// ============================================

/**
 * ステータス表示・変更コンポーネント
 *
 * ステータスバッジを表示し、showButtonsがtrueの場合は
 * ステータス変更ボタンも表示
 *
 * @example
 * // バッジのみ表示
 * <StatusIndicator status="unlistened" />
 *
 * @example
 * // バッジ + ボタン表示
 * <StatusIndicator
 *   status="unlistened"
 *   showButtons
 *   onStatusChange={(newStatus) => console.log(newStatus)}
 * />
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = memo(
  ({ status, onStatusChange, showButtons = false }) => {
    return (
      <View style={styles.container}>
        {/* ステータスバッジ */}
        <Badge status={status} />

        {/* ステータス変更ボタン */}
        {showButtons && onStatusChange && (
          <View style={styles.buttons}>
            {status === 'unlistened' && (
              <>
                <Button
                  variant="secondary"
                  onPress={() => onStatusChange('listening')}
                >
                  聴取中へ
                </Button>
                <Button variant="primary" onPress={() => onStatusChange('completed')}>
                  完了
                </Button>
              </>
            )}
            {status === 'listening' && (
              <>
                <Button
                  variant="secondary"
                  onPress={() => onStatusChange('unlistened')}
                >
                  未聴取へ
                </Button>
                <Button variant="primary" onPress={() => onStatusChange('completed')}>
                  完了
                </Button>
              </>
            )}
            {/* completed状態ではボタンは表示しない */}
          </View>
        )}
      </View>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
