/**
 * TaskService のユニットテスト
 *
 * テスト対象:
 * - getActiveTasks: アクティブなタスクを取得
 * - getTaskById: IDでタスクを取得
 * - getHistory: 聴取履歴を取得
 * - updateTaskStatus: タスクステータスを更新
 * - deleteTask: タスクを削除
 * - cleanupExpiredTasks: 期限切れタスクをクリーンアップ
 * - generateNextTask: 次回タスクを生成
 * - cleanupOldHistory: 古い履歴をクリーンアップ
 */

import { TaskService } from '../TaskService';
import { AppError } from '@/utils/errorHandler';
import * as SQLite from 'expo-sqlite';

// NotificationServiceをモック
jest.mock('../NotificationService', () => ({
  NotificationService: {
    scheduleReminder: jest.fn().mockResolvedValue('notification-id'),
    cancelNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

// モックデータベースの型
type MockDatabase = {
  getAllAsync: jest.Mock;
  getFirstAsync: jest.Mock;
  runAsync: jest.Mock;
  withTransactionAsync: jest.Mock;
};

describe('TaskService', () => {
  let mockDb: MockDatabase;

  beforeEach(() => {
    // データベースモックを初期化
    mockDb = {
      getAllAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      runAsync: jest.fn(),
      withTransactionAsync: jest.fn(),
    };

    // Jestのモックをクリア
    jest.clearAllMocks();
  });

  // ============================================
  // READ系メソッドのテスト
  // ============================================

  describe('getActiveTasks', () => {
    it('アクティブなタスクを期限順に取得できる', async () => {
      const mockTasks = [
        {
          id: 1,
          program_id: 1,
          broadcast_datetime: '2024-12-05 18:00:00',
          deadline_datetime: '2024-12-13 05:00:00',
          status: 'unlistened',
          completed_at: null,
          created_at: '2024-12-01 10:00:00',
          updated_at: '2024-12-01 10:00:00',
          station_name: 'TBSラジオ',
          program_name: 'アフター6ジャンクション',
          repeat_type: 'weekly',
        },
        {
          id: 2,
          program_id: 2,
          broadcast_datetime: '2024-12-06 20:00:00',
          deadline_datetime: '2024-12-14 05:00:00',
          status: 'listening',
          completed_at: null,
          created_at: '2024-12-01 10:00:00',
          updated_at: '2024-12-02 15:00:00',
          station_name: '文化放送',
          program_name: 'レコメン',
          repeat_type: 'weekly',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockTasks);

      const result = await TaskService.getActiveTasks(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(result).toEqual(mockTasks);
      expect(mockDb.getAllAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT')
      );
    });

    it('タスクがない場合は空配列を返す', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await TaskService.getActiveTasks(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).toHaveBeenCalledTimes(1);
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.getActiveTasks(mockDb as unknown as SQLite.SQLiteDatabase)
      ).rejects.toThrow(AppError);
    });
  });

  describe('getTaskById', () => {
    it('指定されたIDのタスクを取得できる', async () => {
      const mockTask = {
        id: 1,
        program_id: 1,
        broadcast_datetime: '2024-12-05 18:00:00',
        deadline_datetime: '2024-12-13 05:00:00',
        status: 'unlistened',
        completed_at: null,
        created_at: '2024-12-01 10:00:00',
        updated_at: '2024-12-01 10:00:00',
        station_name: 'TBSラジオ',
        program_name: 'アフター6ジャンクション',
        repeat_type: 'weekly',
      };

      mockDb.getFirstAsync.mockResolvedValue(mockTask);

      const result = await TaskService.getTaskById(mockDb as unknown as SQLite.SQLiteDatabase, 1);

      expect(result).toEqual(mockTask);
      expect(mockDb.getFirstAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE t.id = ?'),
        [1]
      );
    });

    it('タスクが見つからない場合、nullを返す', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await TaskService.getTaskById(mockDb as unknown as SQLite.SQLiteDatabase, 999);

      expect(result).toBeNull();
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.getFirstAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.getTaskById(mockDb as unknown as SQLite.SQLiteDatabase, 1)
      ).rejects.toThrow(AppError);
    });
  });

  describe('getHistory', () => {
    it('完了済みタスクの履歴を取得できる', async () => {
      const mockHistory = [
        {
          id: 1,
          program_id: 1,
          broadcast_datetime: '2024-11-28 18:00:00',
          deadline_datetime: '2024-12-06 05:00:00',
          status: 'completed',
          completed_at: '2024-12-01 10:00:00',
          created_at: '2024-11-20 10:00:00',
          updated_at: '2024-12-01 10:00:00',
          station_name: 'TBSラジオ',
          program_name: 'アフター6ジャンクション',
          repeat_type: 'weekly',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockHistory);

      const result = await TaskService.getHistory(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(result).toEqual(mockHistory);
      expect(mockDb.getAllAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE t.status = 'completed'")
      );
    });

    it('履歴がない場合は空配列を返す', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await TaskService.getHistory(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(result).toEqual([]);
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.getHistory(mockDb as unknown as SQLite.SQLiteDatabase)
      ).rejects.toThrow(AppError);
    });
  });

  // ============================================
  // UPDATE系メソッドのテスト
  // ============================================

  describe('updateTaskStatus', () => {
    it('タスクステータスをcompletedに更新できる', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: undefined });

      await TaskService.updateTaskStatus(
        mockDb as unknown as SQLite.SQLiteDatabase,
        1,
        'completed'
      );

      expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tasks'),
        ['completed', 1]
      );
    });

    it('タスクステータスをlisteningに更新できる', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: undefined });

      await TaskService.updateTaskStatus(
        mockDb as unknown as SQLite.SQLiteDatabase,
        1,
        'listening'
      );

      expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tasks'),
        ['listening', 1]
      );
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.updateTaskStatus(mockDb as unknown as SQLite.SQLiteDatabase, 1, 'completed')
      ).rejects.toThrow(AppError);
    });
  });

  // ============================================
  // DELETE系メソッドのテスト
  // ============================================

  describe('deleteTask', () => {
    it('タスクを削除できる', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: undefined });

      await TaskService.deleteTask(mockDb as unknown as SQLite.SQLiteDatabase, 1);

      expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = ?', [1]);
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.deleteTask(mockDb as unknown as SQLite.SQLiteDatabase, 1)
      ).rejects.toThrow(AppError);
    });
  });

  // ============================================
  // クリーンアップ/生成系メソッドのテスト
  // ============================================

  describe('cleanupExpiredTasks', () => {
    it('期限切れタスクがない場合、何もしない', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await TaskService.cleanupExpiredTasks(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(mockDb.getAllAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.withTransactionAsync).not.toHaveBeenCalled();
    });

    it('期限切れタスク（繰り返しなし）を削除できる', async () => {
      const expiredTasks = [
        {
          id: 1,
          program_id: 1,
          broadcast_datetime: '2024-11-28 18:00:00',
          station_name: 'TBSラジオ',
          program_name: 'テスト番組',
          repeat_type: 'none',
          day_of_week: 4,
          hour: 18,
          minute: 0,
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(expiredTasks);
      mockDb.withTransactionAsync.mockImplementation(async (callback) => {
        await callback();
      });
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: undefined });

      await TaskService.cleanupExpiredTasks(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(mockDb.getAllAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
    });

    it('期限切れタスク（繰り返しあり）を削除し、次回タスクを生成できる', async () => {
      const expiredTasks = [
        {
          id: 1,
          program_id: 1,
          broadcast_datetime: '2024-12-05 18:00:00',
          station_name: 'TBSラジオ',
          program_name: 'テスト番組',
          repeat_type: 'weekly',
          day_of_week: 4,
          hour: 18,
          minute: 0,
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(expiredTasks);
      mockDb.withTransactionAsync.mockImplementation(async (callback) => {
        await callback();
      });
      mockDb.runAsync
        .mockResolvedValueOnce({ changes: 1, lastInsertRowId: undefined }) // DELETE
        .mockResolvedValueOnce({ changes: 1, lastInsertRowId: 2 }); // INSERT

      await TaskService.cleanupExpiredTasks(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = ?', [1]);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.any(Array)
      );
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.getAllAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.cleanupExpiredTasks(mockDb as unknown as SQLite.SQLiteDatabase)
      ).rejects.toThrow(AppError);
    });
  });

  describe('generateNextTask', () => {
    it('次回タスクを生成できる', async () => {
      const mockProgram = {
        id: 1,
        station_name: 'TBSラジオ',
        program_name: 'テスト番組',
        day_of_week: 4,
        hour: 18,
        minute: 0,
      };

      mockDb.getFirstAsync.mockResolvedValue(mockProgram);
      mockDb.runAsync.mockResolvedValue({ changes: 1, lastInsertRowId: 2 });

      await TaskService.generateNextTask(
        mockDb as unknown as SQLite.SQLiteDatabase,
        1,
        '2024-12-05 18:00:00'
      );

      expect(mockDb.getFirstAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tasks'),
        expect.any(Array)
      );
    });

    it('番組が見つからない場合、AppErrorをスローする', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      await expect(
        TaskService.generateNextTask(
          mockDb as unknown as SQLite.SQLiteDatabase,
          999,
          '2024-12-05 18:00:00'
        )
      ).rejects.toThrow(AppError);
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.getFirstAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.generateNextTask(
          mockDb as unknown as SQLite.SQLiteDatabase,
          1,
          '2024-12-05 18:00:00'
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('cleanupOldHistory', () => {
    it('古い履歴を削除できる', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 5, lastInsertRowId: undefined });

      await TaskService.cleanupOldHistory(mockDb as unknown as SQLite.SQLiteDatabase);

      expect(mockDb.runAsync).toHaveBeenCalledTimes(1);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM tasks")
      );
    });

    it('データベースエラーが発生した場合、AppErrorをスローする', async () => {
      mockDb.runAsync.mockRejectedValue(new Error('Database error'));

      await expect(
        TaskService.cleanupOldHistory(mockDb as unknown as SQLite.SQLiteDatabase)
      ).rejects.toThrow(AppError);
    });
  });
});
