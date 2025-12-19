/**
 * TaskService - タスクのデータベース操作
 *
 * タスク（tasks）テーブルのCRUD操作と
 * 期限切れタスクの管理、次回タスク生成を提供
 */

import * as SQLite from 'expo-sqlite';
import dayjs from 'dayjs';
import { Task, TaskWithProgram, TaskStatus } from '@/types';
import { getNextBroadcastDatetime, calculateDeadline } from '@/utils/dateUtils';
import { AppError } from '@/utils/errorHandler';
import { NotificationService } from './NotificationService';

// ============================================
// 型定義
// ============================================

/**
 * クリーンアップされたタスクの情報
 */
export interface CleanedUpTask {
  /** 放送局名 */
  stationName: string;
  /** 番組名 */
  programName: string;
  /** 放送日時 */
  broadcastDatetime: string;
}

// ============================================
// TaskService クラス
// ============================================

/**
 * タスクのデータベース操作を提供するサービスクラス
 *
 * すべてのメソッドは静的メソッドとして実装
 * データベースインスタンスを引数として受け取る
 */
export class TaskService {
  // クリーンアップ処理の同時実行を防ぐためのフラグ
  private static isCleanupRunning = false;

  // ============================================
  // READ（読取）
  // ============================================

  /**
   * アクティブなタスクを取得
   *
   * 未完了（unlistened, listening）で期限内のタスクを
   * deadline_datetime の昇順で返す
   *
   * @param db - SQLiteDatabaseインスタンス
   * @returns アクティブタスクの配列
   *
   * @example
   * const tasks = await TaskService.getActiveTasks(db);
   * tasks.forEach(task => {
   *   console.log(task.program_name, task.deadline_datetime);
   * });
   */
  static async getActiveTasks(db: SQLite.SQLiteDatabase): Promise<TaskWithProgram[]> {
    try {
      const tasks = await db.getAllAsync<TaskWithProgram>(
        `SELECT
          t.*,
          p.station_name,
          p.program_name,
          p.repeat_type
        FROM tasks t
        INNER JOIN programs p ON t.program_id = p.id
        WHERE t.status != 'completed'
        AND t.deadline_datetime >= datetime('now', 'localtime')
        ORDER BY t.deadline_datetime ASC`
      );

      return tasks;
    } catch (error) {
      console.error('[TaskService] Get active tasks failed:', error);
      throw new AppError('アクティブタスクの取得に失敗しました', 'GET_ACTIVE_TASKS_FAILED');
    }
  }

  /**
   * IDでタスクを取得
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param id - タスクID
   * @returns タスクデータ（番組情報含む）、見つからない場合はnull
   *
   * @example
   * const task = await TaskService.getTaskById(db, 1);
   * if (task) {
   *   console.log(task.program_name);
   * }
   */
  static async getTaskById(db: SQLite.SQLiteDatabase, id: number): Promise<TaskWithProgram | null> {
    try {
      const task = await db.getFirstAsync<TaskWithProgram>(
        `SELECT
          t.*,
          p.station_name,
          p.program_name,
          p.repeat_type
        FROM tasks t
        INNER JOIN programs p ON t.program_id = p.id
        WHERE t.id = ?`,
        [id]
      );

      return task || null;
    } catch (error) {
      console.error('[TaskService] Get task by id failed:', error);
      throw new AppError('タスクの取得に失敗しました', 'GET_TASK_FAILED');
    }
  }

  // ============================================
  // UPDATE（更新）
  // ============================================

  /**
   * タスクのステータスを更新
   *
   * - completedに変更する場合: completed_atに現在時刻を設定
   * - その他のステータス: completed_atをNULLにリセット
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param id - タスクID
   * @param status - 新しいステータス
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * await TaskService.updateTaskStatus(db, 1, 'completed');
   */
  static async updateTaskStatus(
    db: SQLite.SQLiteDatabase,
    id: number,
    status: TaskStatus
  ): Promise<void> {
    try {
      if (status === 'completed') {
        // completedの場合は completed_at を設定
        await db.runAsync(
          `UPDATE tasks
          SET
            status = ?,
            completed_at = datetime('now', 'localtime'),
            updated_at = datetime('now', 'localtime')
          WHERE id = ?`,
          [status, id]
        );

        // 通知をキャンセル（完了したタスクは通知不要）
        // 通知処理のエラーはステータス更新の失敗とはみなさない
        try {
          await NotificationService.cancelNotification(id);
        } catch (notificationError) {
          // 通知処理のエラーはログのみ出力し、ステータス更新は成功とみなす
          console.error(
            `[TaskService] Notification cancellation failed for task ${id}:`,
            notificationError
          );
        }
      } else {
        // それ以外は completed_at をクリア
        await db.runAsync(
          `UPDATE tasks
          SET
            status = ?,
            completed_at = NULL,
            updated_at = datetime('now', 'localtime')
          WHERE id = ?`,
          [status, id]
        );
      }

      console.log('[TaskService] Task status updated:', id, status);
    } catch (error) {
      console.error('[TaskService] Update task status failed:', error);
      throw new AppError('タスクステータスの更新に失敗しました', 'UPDATE_TASK_STATUS_FAILED');
    }
  }

  // ============================================
  // DELETE（削除）
  // ============================================

  /**
   * タスクを削除
   *
   * 単一タスクのみを削除（番組は残る）
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param id - タスクID
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * await TaskService.deleteTask(db, 1);
   */
  static async deleteTask(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
    try {
      // タスクを削除
      await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);

      console.log('[TaskService] Task deleted:', id);

      // 通知をキャンセル
      // 通知処理のエラーはタスク削除の失敗とはみなさない
      try {
        await NotificationService.cancelNotification(id);
      } catch (notificationError) {
        // 通知処理のエラーはログのみ出力し、タスク削除は成功とみなす
        console.error(
          `[TaskService] Notification cancellation failed for task ${id}:`,
          notificationError
        );
      }
    } catch (error) {
      console.error('[TaskService] Delete task failed:', error);
      throw new AppError('タスクの削除に失敗しました', 'DELETE_TASK_FAILED');
    }
  }

  // ============================================
  // 期限切れタスクの管理
  // ============================================

  /**
   * 期限切れタスクをクリーンアップ
   *
   * 1. 期限切れで未完了のタスクを取得
   * 2. トランザクション内で各タスクを削除
   * 3. 繰り返し設定（weekly）がある場合は次回タスクを生成
   *
   * アプリ起動時に呼び出すことを想定
   *
   * @param db - SQLiteDatabaseインスタンス
   * @returns クリーンアップしたタスクの配列（放送局名、番組名、放送日時を含む）
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * // アプリ起動時
   * const cleanedUpTasks = await TaskService.cleanupExpiredTasks(db);
   * if (cleanedUpTasks.length > 0) {
   *   console.log('クリーンアップしたタスク:', cleanedUpTasks);
   * }
   */
  static async cleanupExpiredTasks(db: SQLite.SQLiteDatabase): Promise<CleanedUpTask[]> {
    // 既に実行中の場合はスキップ（トランザクションの多重実行を防ぐ）
    if (this.isCleanupRunning) {
      console.log('[TaskService] Cleanup already running, skipping...');
      return [];
    }

    this.isCleanupRunning = true;

    try {
      // まず期限切れタスクを取得
      const expiredTasks = await db.getAllAsync<{
        id: number;
        program_id: number;
        broadcast_datetime: string;
        station_name: string;
        program_name: string;
        repeat_type: string;
        day_of_week: number;
        hour: number;
        minute: number;
      }>(
        `SELECT t.id, t.program_id, t.broadcast_datetime, p.station_name, p.program_name, p.repeat_type, p.day_of_week, p.hour, p.minute
        FROM tasks t
        INNER JOIN programs p ON t.program_id = p.id
        WHERE t.status != 'completed'
        AND t.deadline_datetime < datetime('now', 'localtime')`
      );

      if (expiredTasks.length === 0) {
        console.log('[TaskService] No expired tasks to cleanup');
        return [];
      }

      console.log(`[TaskService] Found ${expiredTasks.length} expired tasks`);

      // クリーンアップしたタスクの情報を保存
      const cleanedUpTasks: CleanedUpTask[] = expiredTasks.map((task) => ({
        stationName: task.station_name,
        programName: task.program_name,
        broadcastDatetime: task.broadcast_datetime,
      }));

      // 通知処理用の情報を保存
      type NotificationTask = {
        oldTaskId: number;
        newTaskId?: number;
        programName?: string;
        stationName?: string;
        deadline?: string;
      };
      const notificationTasks: NotificationTask[] = [];

      // トランザクション内でデータベース操作のみ実行
      await db.withTransactionAsync(async () => {
        for (const task of expiredTasks) {
          // タスクを削除
          await db.runAsync('DELETE FROM tasks WHERE id = ?', [task.id]);

          // 繰り返し設定がある場合は次回タスクを生成
          if (task.repeat_type === 'weekly') {
            // 前回放送日時から1週間後を計算
            const nextBroadcast = dayjs(task.broadcast_datetime)
              .add(7, 'day')
              .format('YYYY-MM-DD HH:mm:ss');

            // 期限を計算
            const deadline = calculateDeadline(nextBroadcast, task.hour);

            // 次回タスクを作成
            const result = await db.runAsync(
              `INSERT INTO tasks (
                program_id,
                broadcast_datetime,
                deadline_datetime,
                status
              ) VALUES (?, ?, ?, 'unlistened')`,
              [task.program_id, nextBroadcast, deadline]
            );

            // 通知処理用の情報を保存
            if (result.lastInsertRowId) {
              notificationTasks.push({
                oldTaskId: task.id,
                newTaskId: result.lastInsertRowId,
                programName: task.program_name,
                stationName: task.station_name,
                deadline,
              });
            }
          } else {
            // 繰り返しなしの場合は古いタスクの通知キャンセルのみ
            notificationTasks.push({
              oldTaskId: task.id,
            });
          }
        }
      });

      // トランザクション完了後に通知処理を実行
      // 通知処理のエラーはクリーンアップ全体を失敗させないよう個別に処理
      for (const notifTask of notificationTasks) {
        try {
          // 古いタスクの通知をキャンセル
          await NotificationService.cancelNotification(notifTask.oldTaskId);

          // 新しいタスクの通知をスケジュール
          if (
            notifTask.newTaskId &&
            notifTask.programName &&
            notifTask.stationName &&
            notifTask.deadline
          ) {
            await NotificationService.scheduleReminder(
              notifTask.newTaskId,
              notifTask.programName,
              notifTask.stationName,
              notifTask.deadline
            );
          }
        } catch (notificationError) {
          // 通知処理のエラーはログのみ出力し、処理は継続
          console.error(
            `[TaskService] Notification processing failed for task ${notifTask.oldTaskId}:`,
            notificationError
          );
        }
      }

      console.log('[TaskService] Expired tasks processed successfully');
      return cleanedUpTasks;
    } catch (error) {
      console.error('[TaskService] Cleanup expired tasks failed:', error);
      throw new AppError(
        '期限切れタスクのクリーンアップに失敗しました',
        'CLEANUP_EXPIRED_TASKS_FAILED'
      );
    } finally {
      // 処理完了後、必ずフラグをリセット
      this.isCleanupRunning = false;
    }
  }

  // ============================================
  // 次回タスク生成
  // ============================================

  /**
   * 次回タスクを生成
   *
   * 指定された番組の次回タスクを生成
   * 繰り返し設定（weekly）がある場合に使用
   * 前回放送日時から1週間後のタスクを生成する
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param programId - 番組ID
   * @param previousBroadcastDatetime - 前回放送日時（YYYY-MM-DD HH:mm:ss）
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * // タスク完了時に次回タスクを生成
   * await TaskService.generateNextTask(db, programId, '2024-12-05 18:00:00');
   */
  static async generateNextTask(
    db: SQLite.SQLiteDatabase,
    programId: number,
    previousBroadcastDatetime: string
  ): Promise<void> {
    try {
      // 番組情報を取得（時刻情報が必要）
      const program = await db.getFirstAsync<{
        id: number;
        station_name: string;
        program_name: string;
        day_of_week: number;
        hour: number;
        minute: number;
      }>('SELECT * FROM programs WHERE id = ?', [programId]);

      if (!program) {
        throw new AppError('番組が見つかりません', 'PROGRAM_NOT_FOUND');
      }

      // 前回放送日時から1週間後を計算
      const nextBroadcast = dayjs(previousBroadcastDatetime)
        .add(7, 'day')
        .format('YYYY-MM-DD HH:mm:ss');

      // 期限を計算
      const deadline = calculateDeadline(nextBroadcast, program.hour);

      // タスクを作成
      const result = await db.runAsync(
        `INSERT INTO tasks (
          program_id,
          broadcast_datetime,
          deadline_datetime,
          status
        ) VALUES (?, ?, ?, 'unlistened')`,
        [programId, nextBroadcast, deadline]
      );

      console.log('[TaskService] Next task generated for:', programId);

      // 通知をスケジュール
      // 通知処理のエラーはタスク生成の失敗とはみなさない
      if (result.lastInsertRowId) {
        try {
          await NotificationService.scheduleReminder(
            result.lastInsertRowId,
            program.program_name,
            program.station_name,
            deadline
          );
        } catch (notificationError) {
          // 通知処理のエラーはログのみ出力し、タスク生成は成功とみなす
          console.error(
            `[TaskService] Notification scheduling failed for task ${result.lastInsertRowId}:`,
            notificationError
          );
        }
      }
    } catch (error) {
      console.error('[TaskService] Generate next task failed:', error);
      throw new AppError('次回タスクの生成に失敗しました', 'GENERATE_NEXT_TASK_FAILED');
    }
  }

  // ============================================
  // 履歴管理
  // ============================================

  /**
   * 聴取履歴を取得
   *
   * completed状態で完了日時が1ヶ月以内のタスクを
   * completed_at の降順で返す
   *
   * @param db - SQLiteDatabaseインスタンス
   * @returns 履歴タスクの配列
   *
   * @example
   * const history = await TaskService.getHistory(db);
   * history.forEach(task => {
   *   console.log(task.program_name, task.completed_at);
   * });
   */
  static async getHistory(db: SQLite.SQLiteDatabase): Promise<TaskWithProgram[]> {
    try {
      const history = await db.getAllAsync<TaskWithProgram>(
        `SELECT
          t.*,
          p.station_name,
          p.program_name,
          p.repeat_type
        FROM tasks t
        INNER JOIN programs p ON t.program_id = p.id
        WHERE t.status = 'completed'
        AND t.completed_at >= datetime('now', 'localtime', '-1 month')
        ORDER BY t.completed_at DESC`
      );

      return history;
    } catch (error) {
      console.error('[TaskService] Get history failed:', error);
      throw new AppError('履歴の取得に失敗しました', 'GET_HISTORY_FAILED');
    }
  }

  /**
   * 古い履歴をクリーンアップ
   *
   * 完了日時が1ヶ月より前のタスクを削除
   * アプリ起動時に呼び出すことを想定
   *
   * @param db - SQLiteDatabaseインスタンス
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * // アプリ起動時
   * await TaskService.cleanupOldHistory(db);
   */
  static async cleanupOldHistory(db: SQLite.SQLiteDatabase): Promise<void> {
    try {
      await db.runAsync(
        `DELETE FROM tasks
        WHERE status = 'completed'
        AND completed_at < datetime('now', 'localtime', '-1 month')`
      );

      console.log('[TaskService] Old history cleaned up successfully');
    } catch (error) {
      console.error('[TaskService] Cleanup old history failed:', error);
      throw new AppError('古い履歴のクリーンアップに失敗しました', 'CLEANUP_OLD_HISTORY_FAILED');
    }
  }
}
