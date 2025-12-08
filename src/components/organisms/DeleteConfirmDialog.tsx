/**
 * DeleteConfirmDialog - 削除確認ダイアログコンポーネント
 *
 * タスク削除時の確認ダイアログ
 * - 繰り返し設定によって表示内容を変更
 * - 単発（repeat_type='none'）: シンプルな削除確認
 * - 繰り返し（repeat_type='weekly'）: 削除方法を選択
 */

import React, { memo } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { Button, Text } from '@/components/atoms';
import { RepeatType } from '@/types';
import { theme } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * DeleteConfirmDialogコンポーネントのプロパティ
 */
export interface DeleteConfirmDialogProps {
  /** ダイアログの表示状態 */
  visible: boolean;
  /** 繰り返し設定（削除方法の選択肢を変更） */
  repeatType: RepeatType;
  /** 「この回だけ削除」または「削除」ボタン押下時のコールバック */
  onDeleteThis: () => void;
  /** 「繰り返し設定ごと削除」ボタン押下時のコールバック（repeat_type='weekly'のみ） */
  onDeleteAll: () => void;
  /** キャンセルボタン押下時のコールバック */
  onCancel: () => void;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 削除確認ダイアログコンポーネント
 *
 * 繰り返し設定によって表示内容を動的に変更
 * - repeat_type='none': シンプルな削除確認
 * - repeat_type='weekly': 削除方法の選択肢を表示
 *
 * @example
 * // 単発タスクの削除
 * <DeleteConfirmDialog
 *   visible={isVisible}
 *   repeatType="none"
 *   onDeleteThis={handleDelete}
 *   onDeleteAll={() => {}}
 *   onCancel={handleCancel}
 * />
 *
 * @example
 * // 繰り返しタスクの削除
 * <DeleteConfirmDialog
 *   visible={isVisible}
 *   repeatType="weekly"
 *   onDeleteThis={handleDeleteTask}
 *   onDeleteAll={handleDeleteProgram}
 *   onCancel={handleCancel}
 * />
 */
const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  visible,
  repeatType,
  onDeleteThis,
  onDeleteAll,
  onCancel,
}) => {
  // ============================================
  // 単発タスクの削除確認（repeat_type='none'）
  // ============================================

  if (repeatType === 'none') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>削除確認</Text>
            <Text style={styles.message}>このタスクを削除しますか？</Text>

            <View style={styles.actions}>
              <View style={styles.buttonWrapper}>
                <Button variant="secondary" onPress={onCancel}>
                  キャンセル
                </Button>
              </View>
              <View style={styles.buttonWrapper}>
                <Button variant="danger" onPress={onDeleteThis}>
                  削除
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // ============================================
  // 繰り返しタスクの削除方法選択（repeat_type='weekly'）
  // ============================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>削除方法を選択</Text>
          <Text style={styles.message}>
            この番組のタスクは{'\n'}繰り返し設定されています
          </Text>

          {/* 削除方法の選択肢 */}
          <View style={styles.options}>
            <Button variant="secondary" onPress={onDeleteThis} fullWidth>
              この回だけ削除
            </Button>
            <Button variant="danger" onPress={onDeleteAll} fullWidth>
              繰り返し設定ごと削除
            </Button>
          </View>

          {/* キャンセルボタン */}
          <Button variant="secondary" onPress={onCancel} fullWidth>
            キャンセル
          </Button>
        </View>
      </View>
    </Modal>
  );
};

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  dialog: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    // ダイアログ用のシャドウ（cardより強調）
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.body,
  },
  options: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});

// ============================================
// エクスポート
// ============================================

// displayNameを設定（デバッグ時に役立つ）
DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';

// memoでラップしてエクスポート
export default memo(DeleteConfirmDialog);
