/**
 * ProgramService - 番組のデータベース操作
 *
 * 番組（programs）テーブルのCRUD操作と
 * 関連するタスク生成処理を提供
 */

import * as SQLite from 'expo-sqlite';
import { Program, ProgramFormData } from '@/types';
import { getNextBroadcastDatetime, calculateDeadline } from '@/utils/dateUtils';
import { AppError } from '@/utils/errorHandler';

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
  static createProgram(
    db: SQLite.SQLiteDatabase,
    data: ProgramFormData
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      let createdProgramId: number | null = null;

      db.transaction(
        (tx) => {
          // 1. 番組を作成
          tx.executeSql(
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
            ],
            (_, result) => {
              createdProgramId = result.insertId;

              // 2. 初回タスクを生成
              const nextBroadcast = getNextBroadcastDatetime(
                data.day_of_week,
                data.hour,
                data.minute
              );
              const deadline = calculateDeadline(nextBroadcast);

              tx.executeSql(
                `INSERT INTO tasks (
                  program_id,
                  broadcast_datetime,
                  deadline_datetime,
                  status
                ) VALUES (?, ?, ?, 'unlistened')`,
                [createdProgramId, nextBroadcast, deadline]
              );
            }
          );
        },
        (error) => {
          console.error('[ProgramService] Create program failed:', error);
          reject(
            new AppError('番組の作成に失敗しました', 'CREATE_PROGRAM_FAILED')
          );
        },
        () => {
          if (createdProgramId !== null) {
            console.log('[ProgramService] Program created:', createdProgramId);
            resolve(createdProgramId);
          } else {
            reject(
              new AppError('番組IDの取得に失敗しました', 'PROGRAM_ID_NOT_FOUND')
            );
          }
        }
      );
    });
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
  static getProgramById(
    db: SQLite.SQLiteDatabase,
    id: number
  ): Promise<Program | null> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM programs WHERE id = ?',
            [id],
            (_, result) => {
              if (result.rows.length > 0) {
                resolve(result.rows.item(0) as Program);
              } else {
                resolve(null);
              }
            }
          );
        },
        (error) => {
          console.error('[ProgramService] Get program failed:', error);
          reject(
            new AppError('番組の取得に失敗しました', 'GET_PROGRAM_FAILED')
          );
        }
      );
    });
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
  static updateProgram(
    db: SQLite.SQLiteDatabase,
    id: number,
    data: ProgramFormData
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql(
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
        },
        (error) => {
          console.error('[ProgramService] Update program failed:', error);
          reject(
            new AppError('番組の更新に失敗しました', 'UPDATE_PROGRAM_FAILED')
          );
        },
        () => {
          console.log('[ProgramService] Program updated:', id);
          resolve();
        }
      );
    });
  }

  // ============================================
  // DELETE（削除）
  // ============================================

  /**
   * 番組を削除
   *
   * FOREIGN KEY の CASCADE 設定により、
   * 関連するすべてのタスクも自動的に削除される
   *
   * @param db - SQLiteDatabaseインスタンス
   * @param id - 番組ID
   *
   * @throws AppError - データベースエラー
   *
   * @example
   * await ProgramService.deleteProgram(db, 1);
   */
  static deleteProgram(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx) => {
          tx.executeSql('DELETE FROM programs WHERE id = ?', [id]);
        },
        (error) => {
          console.error('[ProgramService] Delete program failed:', error);
          reject(
            new AppError('番組の削除に失敗しました', 'DELETE_PROGRAM_FAILED')
          );
        },
        () => {
          console.log('[ProgramService] Program deleted:', id);
          resolve();
        }
      );
    });
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
  static generateFirstTask(
    db: SQLite.SQLiteDatabase,
    programId: number,
    data: ProgramFormData
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 次回放送日時を計算
        const nextBroadcast = getNextBroadcastDatetime(
          data.day_of_week,
          data.hour,
          data.minute
        );

        // 期限を計算（8日後の5:00）
        const deadline = calculateDeadline(nextBroadcast);

        db.transaction(
          (tx) => {
            tx.executeSql(
              `INSERT INTO tasks (
                program_id,
                broadcast_datetime,
                deadline_datetime,
                status
              ) VALUES (?, ?, ?, 'unlistened')`,
              [programId, nextBroadcast, deadline]
            );
          },
          (error) => {
            console.error('[ProgramService] Generate first task failed:', error);
            reject(
              new AppError(
                'タスクの生成に失敗しました',
                'GENERATE_TASK_FAILED'
              )
            );
          },
          () => {
            console.log('[ProgramService] First task generated for:', programId);
            resolve();
          }
        );
      } catch (error) {
        console.error('[ProgramService] Date calculation failed:', error);
        reject(
          new AppError(
            '日時の計算に失敗しました',
            'DATE_CALCULATION_FAILED'
          )
        );
      }
    });
  }
}
