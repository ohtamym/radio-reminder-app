/**
 * ProgramService - 番組のデータベース操作
 *
 * 番組（programs）テーブルのCRUD操作と
 * 関連するタスク生成処理を提供
 */

import * as SQLite from 'expo-sqlite';
import dayjs from 'dayjs';
import { Program, ProgramFormData } from '@/types';
import { getNextBroadcastDatetime, calculateDeadline } from '@/utils/dateUtils';
import { AppError } from '@/utils/errorHandler';
import { NotificationService } from './NotificationService';

// ============================================
// ProgramService クラス
// ============================================

/**
 * 番組のデータベース操作を提供するサービスクラス
 *
 * すべてのメソッドは静的メソッドとして実装
 * データベースインスタンスを引数として受け取る
 */
export class ProgramService {
  // ============================================
  // CREATE（作成）
  // ============================================

  /**
   * 番組を作成し、初回タスクを生成
   *
   * トランザクション内で以下を実行:
   * 1. 番組をprogramsテーブルに挿入
   * 2. 初回タスクをtasksテーブルに生成
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param data - 番組フォームデータ
   * @returns 作成された番組のID
   *
   * @throws AppError - データベースエラー、制約違反など
   *
   * @example
   * const programId = await ProgramService.createProgram(db, {
   *   station_name: 'TBSラジオ',
   *   program_name: 'アフター6ジャンクション',
   *   day_of_week: 1,
   *   hour: 18,
   *   minute: 0,
   *   repeat_type: 'weekly'
   * });
   */
  static async createProgram(
    db: SQLite.SQLiteDatabase,
    data: ProgramFormData
  ): Promise<number> {
    try {
      let createdProgramId: number | undefined;
      let createdTaskId: number | undefined;
      let taskDeadline: string | undefined;

      await db.withTransactionAsync(async () => {
        // 1. 番組を作成
        const result = await db.runAsync(
          `INSERT INTO programs (
            station_name,
            program_name,
            day_of_week,
            hour,
            minute,
            repeat_type
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            data.station_name,
            data.program_name,
            data.day_of_week,
            data.hour,
            data.minute,
            data.repeat_type,
          ]
        );

        createdProgramId = result.lastInsertRowId;

        // 2. 初回タスクを生成
        let broadcast = getNextBroadcastDatetime(
          data.day_of_week,
          data.hour,
          data.minute
        );

        // 繰り返し設定が「毎週」の場合は、前回（1週間前）の放送日時にする
        // 理由: タスク作成時には、前回放送の聴取期限がまだ来ていないため
        if (data.repeat_type === 'weekly') {
          const broadcastDayjs = dayjs(broadcast);
          broadcast = broadcastDayjs.subtract(7, 'day').format('YYYY-MM-DD HH:mm:ss');
        }

        const deadline = calculateDeadline(broadcast, data.hour);
        taskDeadline = deadline;

        const taskResult = await db.runAsync(
          `INSERT INTO tasks (
            program_id,
            broadcast_datetime,
            deadline_datetime,
            status
          ) VALUES (?, ?, ?, 'unlistened')`,
          [createdProgramId, broadcast, deadline]
        );

        createdTaskId = taskResult.lastInsertRowId;
      });

      if (createdProgramId === undefined) {
        throw new AppError('番組IDの取得に失敗しました', 'PROGRAM_ID_NOT_FOUND');
      }

      console.log('[ProgramService] Program created:', createdProgramId);

      // トランザクション完了後に通知をスケジュール
      // 通知処理のエラーは番組作成の失敗とはみなさない
      if (createdTaskId && taskDeadline) {
        try {
          await NotificationService.scheduleReminder(
            createdTaskId,
            data.program_name,
            data.station_name,
            taskDeadline
          );
        } catch (notificationError) {
          // 通知処理のエラーはログのみ出力し、番組作成は成功とみなす
          console.error(`[ProgramService] Notification scheduling failed for task ${createdTaskId}:`, notificationError);
        }
      }

      return createdProgramId;
    } catch (error) {
      console.error('[ProgramService] Create program failed:', error);
      throw new AppError('番組の作成に失敗しました', 'CREATE_PROGRAM_FAILED');
    }
  }

  // ============================================
  // READ（読取）
  // ============================================

  /**
   * IDで番組を取得
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param id - 番組ID
   * @returns 番組データ、見つからない場合はnull
   *
   * @example
   * const program = await ProgramService.getProgramById(db, 1);
   * if (program) {
   *   console.log(program.program_name);
   * }
   */
  static async getProgramById(
    db: SQLite.SQLiteDatabase,
    id: number
  ): Promise<Program | null> {
    try {
      const result = await db.getFirstAsync<Program>(
        'SELECT * FROM programs WHERE id = ?',
        [id]
      );

      return result || null;
    } catch (error) {
      console.error('[ProgramService] Get program failed:', error);
      throw new AppError('番組の取得に失敗しました', 'GET_PROGRAM_FAILED');
    }
  }

  // ============================================
  // UPDATE（更新）
  // ============================================

  /**
   * 番組を更新
   *
   * 注意: 既存のタスクには影響しない
   * 更新後に生成されるタスクのみが新しい設定を反映
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param id - 番組ID
   * @param data - 更新する番組データ
   *
   * @throws AppError - データベースエラー、制約違反など
   *
   * @example
   * await ProgramService.updateProgram(db, 1, {
   *   station_name: 'TBSラジオ',
   *   program_name: 'アフター6ジャンクション',
   *   day_of_week: 2,
   *   hour: 18,
   *   minute: 0,
   *   repeat_type: 'weekly'
   * });
   */
  static async updateProgram(
    db: SQLite.SQLiteDatabase,
    id: number,
    data: ProgramFormData
  ): Promise<void> {
    try {
      await db.runAsync(
        `UPDATE programs
        SET
          station_name = ?,
          program_name = ?,
          day_of_week = ?,
          hour = ?,
          minute = ?,
          repeat_type = ?,
          updated_at = datetime('now', 'localtime')
        WHERE id = ?`,
        [
          data.station_name,
          data.program_name,
          data.day_of_week,
          data.hour,
          data.minute,
          data.repeat_type,
          id,
        ]
      );

      console.log('[ProgramService] Program updated:', id);
    } catch (error) {
      console.error('[ProgramService] Update program failed:', error);
      throw new AppError('番組の更新に失敗しました', 'UPDATE_PROGRAM_FAILED');
    }
  }

  // ============================================
  // DELETE（削除）
  // ============================================

  /**
   * 番組を削除
   *
   * FOREIGN KEY の CASCADE 設定により、
   * 関連するすべてのタスクも自動的に削除される
   * 削除前に関連タスクの通知をすべてキャンセルする
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param id - 番組ID
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * await ProgramService.deleteProgram(db, 1);
   */
  static async deleteProgram(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
    try {
      // 削除前に関連タスクのIDを取得
      const tasks = await db.getAllAsync<{ id: number }>(
        'SELECT id FROM tasks WHERE program_id = ?',
        [id]
      );

      // 番組を削除（CASCADE により関連タスクも削除される）
      await db.runAsync('DELETE FROM programs WHERE id = ?', [id]);

      console.log('[ProgramService] Program deleted:', id);

      // 削除されたタスクの通知をキャンセル
      // 通知処理のエラーは番組削除の失敗とはみなさない
      for (const task of tasks) {
        try {
          await NotificationService.cancelNotification(task.id);
        } catch (notificationError) {
          // 通知処理のエラーはログのみ出力し、番組削除は成功とみなす
          console.error(`[ProgramService] Notification cancellation failed for task ${task.id}:`, notificationError);
        }
      }

      console.log(`[ProgramService] Canceled ${tasks.length} notifications for program:`, id);
    } catch (error) {
      console.error('[ProgramService] Delete program failed:', error);
      throw new AppError('番組の削除に失敗しました', 'DELETE_PROGRAM_FAILED');
    }
  }

  // ============================================
  // タスク生成
  // ============================================

  /**
   * 初回タスクを生成
   *
   * createProgramメソッド内で使用されるため、
   * 通常は直接呼び出す必要はない
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param programId - 番組ID
   * @param data - 番組データ
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * // createProgram内で自動的に呼ばれる
   * await ProgramService.generateFirstTask(db, programId, formData);
   */
  static async generateFirstTask(
    db: SQLite.SQLiteDatabase,
    programId: number,
    data: ProgramFormData
  ): Promise<void> {
    try {
      // 次回放送日時を計算
      const nextBroadcast = getNextBroadcastDatetime(
        data.day_of_week,
        data.hour,
        data.minute
      );

      // 期限を計算（8日後の5:00）
      const deadline = calculateDeadline(nextBroadcast, data.hour);

      const result = await db.runAsync(
        `INSERT INTO tasks (
          program_id,
          broadcast_datetime,
          deadline_datetime,
          status
        ) VALUES (?, ?, ?, 'unlistened')`,
        [programId, nextBroadcast, deadline]
      );

      console.log('[ProgramService] First task generated for:', programId);

      // 通知をスケジュール
      // 通知処理のエラーはタスク生成の失敗とはみなさない
      if (result.lastInsertRowId) {
        try {
          await NotificationService.scheduleReminder(
            result.lastInsertRowId,
            data.program_name,
            data.station_name,
            deadline
          );
        } catch (notificationError) {
          // 通知処理のエラーはログのみ出力し、タスク生成は成功とみなす
          console.error(`[ProgramService] Notification scheduling failed for task ${result.lastInsertRowId}:`, notificationError);
        }
      }
    } catch (error) {
      console.error('[ProgramService] Generate first task failed:', error);
      throw new AppError(
        'タスクの生成に失敗しました',
        'GENERATE_TASK_FAILED'
      );
    }
  }
}
