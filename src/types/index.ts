/**
 * TypeScript型定義
 *
 * アプリケーション全体で使用する型定義
 * データベーススキーマと対応
 */

// ============================================
// 列挙型
// ============================================

/**
 * タスクステータス型
 * - unlistened: 未聴取
 * - listening: 聴取中
 * - completed: 聴取済
 */
export type TaskStatus = 'unlistened' | 'listening' | 'completed';

/**
 * 繰り返し設定型
 * - none: 繰り返しなし（単発）
 * - weekly: 毎週繰り返し
 */
export type RepeatType = 'none' | 'weekly';

// ============================================
// データベーステーブル型
// ============================================

/**
 * 番組マスター（programs）テーブル
 */
export interface Program {
  /** 番組ID */
  id: number;
  /** 放送局名 */
  station_name: string;
  /** 番組名 */
  program_name: string;
  /** 放送曜日（0=日曜, 1=月曜, ..., 6=土曜） */
  day_of_week: number;
  /** 放送時（5-29） */
  hour: number;
  /** 放送分（0, 15, 30, 45） */
  minute: number;
  /** 繰り返し設定 */
  repeat_type: RepeatType;
  /** 作成日時（YYYY-MM-DD HH:mm:ss形式） */
  created_at: string;
  /** 更新日時（YYYY-MM-DD HH:mm:ss形式） */
  updated_at: string;
}

/**
 * タスク（tasks）テーブル
 */
export interface Task {
  /** タスクID */
  id: number;
  /** 番組マスターID（外部キー） */
  program_id: number;
  /** 放送日時（YYYY-MM-DD HH:mm:ss形式） */
  broadcast_datetime: string;
  /** 期限日時（YYYY-MM-DD HH:mm:ss形式） */
  deadline_datetime: string;
  /** タスクステータス */
  status: TaskStatus;
  /** 聴取完了日時（YYYY-MM-DD HH:mm:ss形式、NULL許可） */
  completed_at: string | null;
  /** 作成日時（YYYY-MM-DD HH:mm:ss形式） */
  created_at: string;
  /** 更新日時（YYYY-MM-DD HH:mm:ss形式） */
  updated_at: string;
}

// ============================================
// 結合クエリ型
// ============================================

/**
 * タスクと番組情報を結合した型
 * 画面表示で使用（JOIN結果）
 */
export interface TaskWithProgram extends Task {
  /** 放送局名 */
  station_name: string;
  /** 番組名 */
  program_name: string;
  /** 繰り返し設定 */
  repeat_type: RepeatType;
}

// ============================================
// フォーム入力データ型
// ============================================

/**
 * 番組作成・編集フォームの入力データ型
 * created_at, updated_atは含まない（自動生成のため）
 */
export interface ProgramFormData {
  /** 放送局名 */
  station_name: string;
  /** 番組名 */
  program_name: string;
  /** 放送曜日（0=日曜, 1=月曜, ..., 6=土曜） */
  day_of_week: number;
  /** 放送時（5-29） */
  hour: number;
  /** 放送分（0, 15, 30, 45） */
  minute: number;
  /** 繰り返し設定 */
  repeat_type: RepeatType;
}
