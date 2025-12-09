/**
 * ProgramFormScreen - 番組登録/編集画面
 *
 * 新規番組の登録または既存番組の編集を行う
 * - 新規登録モード: programIdがない場合
 * - 編集モード: programIdがある場合
 * - ProgramFormコンポーネントを使用
 * - useProgramフックで作成/更新処理
 * - エラーハンドリング
 * - ローディング表示
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProgramForm } from '@/components/organisms';
import { LoadingSpinner } from '@/components/molecules';
import { useProgram } from '@/hooks/useProgram';
import { useDatabase } from '@/contexts/DatabaseContext';
import { ProgramService } from '@/services/ProgramService';
import { Program, ProgramFormData } from '@/types';
import { theme } from '@/theme';
import { RootStackParamList } from '@/navigation/types';

// ============================================
// 型定義
// ============================================

/**
 * ProgramFormScreenのプロパティ型
 *
 * React Navigationのスタック画面プロパティを使用
 */
type ProgramFormScreenProps = NativeStackScreenProps<RootStackParamList, 'ProgramForm'>;

// ============================================
// コンポーネント
// ============================================

/**
 * 番組登録/編集画面コンポーネント
 *
 * programIdの有無で新規登録モードと編集モードを切り替える
 * 編集モードの場合は、番組情報を取得してフォームに初期値として設定
 *
 * @example
 * // 新規登録
 * <ProgramFormScreen navigation={navigation} />
 *
 * @example
 * // 編集
 * <ProgramFormScreen navigation={navigation} route={{ params: { programId: 1 } }} />
 */
export const ProgramFormScreen: React.FC<ProgramFormScreenProps> = ({
  navigation,
  route,
}) => {
  // ============================================
  // State & Hooks
  // ============================================

  const { db } = useDatabase();
  const { loading, createProgram, updateProgram } = useProgram();
  const [program, setProgram] = useState<Program | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  const programId = route.params?.programId;
  const isEditMode = programId !== undefined;

  // ============================================
  // データ取得（編集モードの場合）
  // ============================================

  useEffect(() => {
    if (!isEditMode || !db) {
      return;
    }

    const fetchProgram = async () => {
      setFetchLoading(true);
      try {
        const fetchedProgram = await ProgramService.getProgramById(db, programId);
        if (fetchedProgram) {
          setProgram(fetchedProgram);
        } else {
          console.error('[ProgramFormScreen] Program not found:', programId);
          // プログラムが見つからない場合は前画面に戻る
          navigation.goBack();
        }
      } catch (error) {
        console.error('[ProgramFormScreen] Failed to fetch program:', error);
        // エラーが発生した場合も前画面に戻る
        navigation.goBack();
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProgram();
  }, [isEditMode, db, programId, navigation]);

  // ============================================
  // イベントハンドラ
  // ============================================

  /**
   * フォーム送信ハンドラ
   *
   * 新規登録または編集モードに応じて適切な処理を実行
   * 成功後は前画面に戻る
   */
  const handleSubmit = useCallback(
    async (data: ProgramFormData) => {
      let success = false;

      if (isEditMode) {
        // 編集モード: 番組を更新
        success = await updateProgram(programId, data);
      } else {
        // 新規登録モード: 番組を作成
        const createdId = await createProgram(data);
        success = createdId !== null;
      }

      if (success) {
        // 保存成功後は前画面に戻る
        navigation.goBack();
      }
    },
    [isEditMode, programId, createProgram, updateProgram, navigation]
  );

  /**
   * キャンセルハンドラ
   *
   * 前画面に戻る
   */
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ============================================
  // レンダリング
  // ============================================

  // 編集モードでデータ取得中
  if (fetchLoading) {
    return <LoadingSpinner message="番組情報を読み込んでいます..." />;
  }

  // 編集モードでデータが取得できていない場合は何も表示しない
  // （useEffectで前画面に戻る処理が実行される）
  if (isEditMode && !program) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ProgramForm
        initialData={isEditMode ? (program || undefined) : undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
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
});

// ============================================
// エクスポート
// ============================================

export default ProgramFormScreen;
