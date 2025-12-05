/**
 * アプリケーション全体の定数
 *
 * 各種設定値や選択肢の定義
 */

import { TaskStatus, RepeatType } from '@/types';
import { colors } from '@/theme';

// ============================================
// 時刻選択の定数
// ============================================

/**
 * 時の選択肢配列
 * 5時～29時（29時 = 翌日5時）
 */
export const HOURS = Array.from({ length: 25 }, (_, i) => i + 5);

/**
 * 分の選択肢配列
 * 0, 15, 30, 45
 */
export const MINUTES = [0, 15, 30, 45] as const;

// ============================================
// 曜日の定数
// ============================================

/**
 * 曜日の選択肢配列
 * value: 0=日曜日, 1=月曜日, ..., 6=土曜日
 */
export const DAY_OF_WEEK_OPTIONS = [
  { label: '日曜日', value: 0 },
  { label: '月曜日', value: 1 },
  { label: '火曜日', value: 2 },
  { label: '水曜日', value: 3 },
  { label: '木曜日', value: 4 },
  { label: '金曜日', value: 5 },
  { label: '土曜日', value: 6 },
] as const;

/**
 * 曜日の短縮形配列（日本語1文字）
 */
export const DAY_OF_WEEK_SHORT = ['日', '月', '火', '水', '木', '金', '土'] as const;

// ============================================
// 繰り返し設定の定数
// ============================================

/**
 * 繰り返し設定の選択肢配列
 */
export const REPEAT_TYPE_OPTIONS = [
  { label: '繰り返しなし', value: 'none' as RepeatType },
  { label: '毎週', value: 'weekly' as RepeatType },
] as const;

// ============================================
// ステータスの定数
// ============================================

/**
 * ステータスごとの設定
 * 絵文字、色、ラベルを定義
 */
export const STATUS_CONFIG = {
  unlistened: {
    emoji: '📻',
    color: colors.statusUnlistened,
    label: '未聴取',
  },
  listening: {
    emoji: '🎧',
    color: colors.statusListening,
    label: '聴取中',
  },
  completed: {
    emoji: '✅',
    color: colors.statusCompleted,
    label: '聴取済',
  },
} as const satisfies Record<TaskStatus, { emoji: string; color: string; label: string }>;

// ============================================
// 期限の色設定
// ============================================

/**
 * 残り日数に応じた色を返す関数
 * @param daysRemaining 残り日数
 * @returns 色文字列
 */
export const getDeadlineColor = (daysRemaining: number): string => {
  if (daysRemaining <= 1) {
    return colors.deadlineUrgent; // 赤
  } else if (daysRemaining <= 3) {
    return colors.deadlineWarning; // 黄
  } else {
    return colors.deadlineNormal; // グレー
  }
};

/**
 * 期限の色設定オブジェクト
 */
export const DEADLINE_COLORS = {
  urgent: colors.deadlineUrgent, // 残り1日以下
  warning: colors.deadlineWarning, // 残り2-3日
  normal: colors.deadlineNormal, // 残り4日以上
} as const;

// ============================================
// radikoの仕様定数
// ============================================

/**
 * radikoのタイムフリー期限
 * 放送日時 + 7日 + 29時間（8日後の5:00まで）
 */
export const TIMEFREE_PERIOD_DAYS = 7;
export const TIMEFREE_DEADLINE_HOUR = 5; // 5:00 AM

/**
 * 聴取履歴の保持期間（日）
 */
export const HISTORY_RETENTION_DAYS = 30;
