/**
 * TaskService - タスクのデータベース操作
 *
 * タスク（tasks）テーブルのCRUD操作と
 * 期限切れタスクの管理、次回タスク生成を提供
 */

import * as SQLite from 'expo-sqlite';
import { Task, TaskWithProgram, TaskStatus } from '@/types';
import { getNextBroadcastDatetime, calculateDeadline } from '@/utils/dateUtils';
import { AppError } from '@/utils/errorHandler';

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
  static getActiveTasks(db: SQLite.SQLiteDatabase): Promise<TaskWithProgram[]> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT
              t.*,
              p.station_name,
              p.program_name,
              p.repeat_type
            FROM tasks t
            INNER JOIN programs p ON t.program_id = p.id
            WHERE t.status != 'completed'
            AND t.deadline_datetime >= datetime('now', 'localtime')
            ORDER BY t.deadline_datetime ASC`,
            [],
            (_, result) => {
              const tasks: TaskWithProgram[] = [];
              for (let i = 0; i < result.rows.length; i++) {
                tasks.push(result.rows.item(i) as TaskWithProgram);
              }
              resolve(tasks);
            }
          );
        },
        (error) => {
          console.error('[TaskService] Get active tasks failed:', error);
          reject(
            new AppError(
              'アクティブタスクの取得に失敗しました',
              'GET_ACTIVE_TASKS_FAILED'
            )
          );
        }
      );
    });
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
  static getTaskById(
    db: SQLite.SQLiteDatabase,
    id: number
  ): Promise<TaskWithProgram | null> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT
              t.*,
              p.station_name,
              p.program_name,
              p.repeat_type
            FROM tasks t
            INNER JOIN programs p ON t.program_id = p.id
            WHERE t.id = ?`,
            [id],
            (_, result) => {
              if (result.rows.length > 0) {
                resolve(result.rows.item(0) as TaskWithProgram);
              } else {
                resolve(null);
              }
            }
          );
        },
        (error) => {
          console.error('[TaskService] Get task by id failed:', error);
          reject(
            new AppError('タスクの取得に失敗しました', 'GET_TASK_FAILED')
          );
        }
      );
    });
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
  static updateTaskStatus(
    db: SQLite.SQLiteDatabase,
    id: number,
    status: TaskStatus
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          if (status === 'completed') {
            // completedの場合は completed_at を設定
            tx.executeSql(
              `UPDATE tasks
              SET
                status = ?,
                completed_at = datetime('now', 'localtime'),
                updated_at = datetime('now', 'localtime')
              WHERE id = ?`,
              [status, id]
            );
          } else {
            // それ以外は completed_at をクリア
            tx.executeSql(
              `UPDATE tasks
              SET
                status = ?,
                completed_at = NULL,
                updated_at = datetime('now', 'localtime')
              WHERE id = ?`,
              [status, id]
            );
          }
        },
        (error) => {
          console.error('[TaskService] Update task status failed:', error);
          reject(
            new AppError(
              'タスクステータスの更新に失敗しました',
              'UPDATE_TASK_STATUS_FAILED'
            )
          );
        },
        () => {
          console.log('[TaskService] Task status updated:', id, status);
          resolve();
        }
      );
    });
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
  static deleteTask(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql('DELETE FROM tasks WHERE id = ?', [id]);
        },
        (error) => {
          console.error('[TaskService] Delete task failed:', error);
          reject(
            new AppError('タスクの削除に失敗しました', 'DELETE_TASK_FAILED')
          );
        },
        () => {
          console.log('[TaskService] Task deleted:', id);
          resolve();
        }
      );
    });
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
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * // アプリ起動時
   * await TaskService.cleanupExpiredTasks(db);
   */
  static cleanupExpiredTasks(db: SQLite.SQLiteDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      // まず期限切れタスクを取得
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT t.*, p.repeat_type
            FROM tasks t
            INNER JOIN programs p ON t.program_id = p.id
            WHERE t.status != 'completed'
            AND t.deadline_datetime < datetime('now', 'localtime')`,
            [],
            (_, result) => {
              const expiredTasks: Array<{
                id: number;
                program_id: number;
                repeat_type: string;
              }> = [];

              for (let i = 0; i < result.rows.length; i++) {
                expiredTasks.push(result.rows.item(i));
              }

              if (expiredTasks.length === 0) {
                console.log('[TaskService] No expired tasks to cleanup');
                resolve();
                return;
              }

              console.log(
                `[TaskService] Found ${expiredTasks.length} expired tasks`
              );

              // 期限切れタスクを削除し、必要に応じて次回タスクを生成
              this.processExpiredTasks(db, expiredTasks)
                .then(() => resolve())
                .catch((error) => reject(error));
            }
          );
        },
        (error) => {
          console.error('[TaskService] Cleanup expired tasks failed:', error);
          reject(
            new AppError(
              '期限切れタスクのクリーンアップに失敗しました',
              'CLEANUP_EXPIRED_TASKS_FAILED'
            )
          );
        }
      );
    });
  }

  /**
   * 期限切れタスクを処理（内部ヘルパー）
   *
   * @private
   */
  private static processExpiredTasks(
    db: SQLite.SQLiteDatabase,
    expiredTasks: Array<{ id: number; program_id: number; repeat_type: string }>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          expiredTasks.forEach((task) => {
            // タスクを削除
            tx.executeSql('DELETE FROM tasks WHERE id = ?', [task.id]);

            // 繰り返し設定がある場合は次回タスクを生成
            if (task.repeat_type === 'weekly') {
              // 番組情報を取得して次回タスクを生成
              tx.executeSql(
                'SELECT * FROM programs WHERE id = ?',
                [task.program_id],
                (_, result) => {
                  if (result.rows.length > 0) {
                    const program = result.rows.item(0);

                    // 次回放送日時を計算
                    const nextBroadcast = getNextBroadcastDatetime(
                      program.day_of_week,
                      program.hour,
                      program.minute
                    );

                    // 期限を計算
                    const deadline = calculateDeadline(nextBroadcast);

                    // 次回タスクを作成
                    tx.executeSql(
                      `INSERT INTO tasks (
                        program_id,
                        broadcast_datetime,
                        deadline_datetime,
                        status
                      ) VALUES (?, ?, ?, 'unlistened')`,
                      [task.program_id, nextBroadcast, deadline]
                    );
                  }
                }
              );
            }
          });
        },
        (error) => {
          console.error('[TaskService] Process expired tasks failed:', error);
          reject(
            new AppError(
              '期限切れタスクの処理に失敗しました',
              'PROCESS_EXPIRED_TASKS_FAILED'
            )
          );
        },
        () => {
          console.log('[TaskService] Expired tasks processed successfully');
          resolve();
        }
      );
    });
  }

  // ============================================
  // 次回タスク生成
  // ============================================

  /**
   * 次回タスクを生成
   *
   * 指定された番組の次回タスクを生成
   * 繰り返し設定（weekly）がある場合に使用
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param programId - 番組ID
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * // タスク完了時に次回タスクを生成
   * await TaskService.generateNextTask(db, programId);
   */
  static generateNextTask(
    db: SQLite.SQLiteDatabase,
    programId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          // 番組情報を取得
          tx.executeSql(
            'SELECT * FROM programs WHERE id = ?',
            [programId],
            (_, result) => {
              if (result.rows.length === 0) {
                reject(
                  new AppError('番組が見つかりません', 'PROGRAM_NOT_FOUND')
                );
                return;
              }

              const program = result.rows.item(0);

              try {
                // 次回放送日時を計算
                const nextBroadcast = getNextBroadcastDatetime(
                  program.day_of_week,
                  program.hour,
                  program.minute
                );

                // 期限を計算
                const deadline = calculateDeadline(nextBroadcast);

                // タスクを作成
                tx.executeSql(
                  `INSERT INTO tasks (
                    program_id,
                    broadcast_datetime,
                    deadline_datetime,
                    status
                  ) VALUES (?, ?, ?, 'unlistened')`,
                  [programId, nextBroadcast, deadline]
                );
              } catch (error) {
                console.error('[TaskService] Date calculation failed:', error);
                reject(
                  new AppError(
                    '日時の計算に失敗しました',
                    'DATE_CALCULATION_FAILED'
                  )
                );
              }
            }
          );
        },
        (error) => {
          console.error('[TaskService] Generate next task failed:', error);
          reject(
            new AppError(
              '次回タスクの生成に失敗しました',
              'GENERATE_NEXT_TASK_FAILED'
            )
          );
        },
        () => {
          console.log('[TaskService] Next task generated for:', programId);
          resolve();
        }
      );
    });
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
  static getHistory(db: SQLite.SQLiteDatabase): Promise<TaskWithProgram[]> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `SELECT
              t.*,
              p.station_name,
              p.program_name,
              p.repeat_type
            FROM tasks t
            INNER JOIN programs p ON t.program_id = p.id
            WHERE t.status = 'completed'
            AND t.completed_at >= datetime('now', 'localtime', '-1 month')
            ORDER BY t.completed_at DESC`,
            [],
            (_, result) => {
              const tasks: TaskWithProgram[] = [];
              for (let i = 0; i < result.rows.length; i++) {
                tasks.push(result.rows.item(i) as TaskWithProgram);
              }
              resolve(tasks);
            }
          );
        },
        (error) => {
          console.error('[TaskService] Get history failed:', error);
          reject(
            new AppError('履歴の取得に失敗しました', 'GET_HISTORY_FAILED')
          );
        }
      );
    });
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
  static cleanupOldHistory(db: SQLite.SQLiteDatabase): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            `DELETE FROM tasks
            WHERE status = 'completed'
            AND completed_at < datetime('now', 'localtime', '-1 month')`
          );
        },
        (error) => {
          console.error('[TaskService] Cleanup old history failed:', error);
          reject(
            new AppError(
              '古い履歴のクリーンアップに失敗しました',
              'CLEANUP_OLD_HISTORY_FAILED'
            )
          );
        },
        () => {
          console.log('[TaskService] Old history cleaned up successfully');
          resolve();
        }
      );
    });
  }
}
