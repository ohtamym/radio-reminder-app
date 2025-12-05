/**
 * useProgram - 番組管理のカスタムフック
 *
 * 番組の作成、更新、削除を提供
 * - 番組作成処理
 * - 番組更新処理
 * - 番組削除処理
 * - ローディング状態の管理
 * - エラーハンドリング
 */

import { useState, useCallback } from 'react';
import { ProgramFormData } from '@/types';
import { ProgramService } from '@/services/ProgramService';
import { useDatabase } from '@/contexts/DatabaseContext';
import { handleError } from '@/utils/errorHandler';

// ============================================
// 型定義
// ============================================

/**
 * useProgramフックの戻り値の型
 */
export interface UseProgramReturn {
  /** ローディング中かどうか */
  loading: boolean;
  /** 番組を作成 */
  createProgram: (data: ProgramFormData) => Promise<number | null>;
  /** 番組を更新 */
  updateProgram: (id: number, data: ProgramFormData) => Promise<boolean>;
  /** 番組を削除 */
  deleteProgram: (id: number) => Promise<boolean>;
}

// ============================================
// カスタムフック
// ============================================

/**
 * 番組管理のカスタムフック
 *
 * 番組の作成、更新、削除の操作を提供
 * すべての操作はエラーハンドリング付きで、ローディング状態を管理
 *
 * @returns 番組操作関数群
 *
 * @example
 * const { loading, createProgram, updateProgram, deleteProgram } = useProgram();
 *
 * // 番組作成
 * const programId = await createProgram({
 *   station_name: 'TBSラジオ',
 *   program_name: 'アフター6ジャンクション',
 *   day_of_week: 1,
 *   hour: 18,
 *   minute: 0,
 *   repeat_type: 'weekly'
 * });
 *
 * // 番組更新
 * const success = await updateProgram(programId, updatedData);
 *
 * // 番組削除
 * const deleted = await deleteProgram(programId);
 */
export const useProgram = (): UseProgramReturn => {
  const { db } = useDatabase();
  const [loading, setLoading] = useState(false);

  /**
   * 番組を作成
   *
   * 1. 番組をprogramsテーブルに挿入
   * 2. 初回タスクを自動生成
   *
   * @param data - 番組フォームデータ
   * @returns 作成された番組のID、失敗時はnull
   */
  const createProgram = useCallback(
    async (data: ProgramFormData): Promise<number | null> => {
      if (!db) {
        return null;
      }

      setLoading(true);
      try {
        const programId = await ProgramService.createProgram(db, data);
        console.log('[useProgram] Program created successfully:', programId);
        return programId;
      } catch (error) {
        console.error('[useProgram] Failed to create program:', error);
        handleError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  /**
   * 番組を更新
   *
   * 注意: 既存のタスクには影響しない
   * 更新後に生成されるタスクのみが新しい設定を反映
   *
   * @param id - 番組ID
   * @param data - 更新する番組データ
   * @returns 成功時はtrue、失敗時はfalse
   */
  const updateProgram = useCallback(
    async (id: number, data: ProgramFormData): Promise<boolean> => {
      if (!db) {
        return false;
      }

      setLoading(true);
      try {
        await ProgramService.updateProgram(db, id, data);
        console.log('[useProgram] Program updated successfully:', id);
        return true;
      } catch (error) {
        console.error('[useProgram] Failed to update program:', error);
        handleError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  /**
   * 番組を削除
   *
   * FOREIGN KEYのCASCADE設定により、
   * 関連するすべてのタスクも自動的に削除される
   *
   * @param id - 番組ID
   * @returns 成功時はtrue、失敗時はfalse
   */
  const deleteProgram = useCallback(
    async (id: number): Promise<boolean> => {
      if (!db) {
        return false;
      }

      setLoading(true);
      try {
        await ProgramService.deleteProgram(db, id);
        console.log('[useProgram] Program deleted successfully:', id);
        return true;
      } catch (error) {
        console.error('[useProgram] Failed to delete program:', error);
        handleError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [db]
  );

  return {
    loading,
    createProgram,
    updateProgram,
    deleteProgram,
  };
};
