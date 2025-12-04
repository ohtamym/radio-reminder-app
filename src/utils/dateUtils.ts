/**
 * 日時計算とフォーマットのユーティリティ関数
 *
 * radikoのタイムフリー機能に対応した日時処理
 * - 29時台の処理（深夜放送対応）
 * - Asia/Tokyoタイムゾーン
 * - ISO8601形式での日時管理
 */

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { getDeadlineColor } from '@/constants';

// dayjsプラグインの設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

// ============================================
// 日時フォーマット関数
// ============================================

/**
 * 日時をフォーマットして返す
 *
 * @param date - ISO8601形式の日時文字列
 * @param format - フォーマット文字列（dayjs形式）
 * @returns フォーマットされた日時文字列
 *
 * @example
 * formatDate('2024-12-05T18:00:00', 'M/D(ddd) HH:mm')
 * // => '12/5(木) 18:00'
 */
export const formatDate = (date: string, format: string): string => {
  return dayjs(date).format(format);
};

// ============================================
// 残り日数計算関数
// ============================================

/**
 * 期限までの残り日数を計算
 *
 * @param deadline - ISO8601形式の期限日時文字列
 * @returns 残り日数（小数点切り上げ）
 *
 * @example
 * calculateRemainingDays('2024-12-12T05:00:00')
 * // 現在が2024-12-10T10:00:00の場合 => 2
 */
export const calculateRemainingDays = (deadline: string): number => {
  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  return Math.ceil(deadlineDate.diff(now, 'day', true));
};

/**
 * 残り日数に応じた色を返す
 *
 * @param days - 残り日数
 * @returns 色コード
 *
 * @example
 * getRemainingDaysColor(1) // => '#F44336' (赤)
 * getRemainingDaysColor(2) // => '#FFC107' (黄)
 * getRemainingDaysColor(5) // => '#757575' (グレー)
 */
export const getRemainingDaysColor = (days: number): string => {
  return getDeadlineColor(days);
};

// ============================================
// 放送日時計算関数
// ============================================

/**
 * 次回放送日時を計算
 *
 * 指定された曜日・時刻の次の発生日時を返す
 * 29時台の処理（深夜放送）に対応
 *
 * @param dayOfWeek - 曜日（0=日曜、1=月曜、...、6=土曜）
 * @param hour - 時（5-29）29時 = 翌日5時
 * @param minute - 分（0, 15, 30, 45）
 * @returns ISO8601形式の日時文字列
 *
 * @example
 * // 現在: 2024-12-05(木) 15:00
 * getNextBroadcastDatetime(4, 18, 0)
 * // => '2024-12-05T18:00:00' (当日の18:00)
 *
 * @example
 * // 現在: 2024-12-05(木) 20:00
 * getNextBroadcastDatetime(4, 18, 0)
 * // => '2024-12-12T18:00:00' (次週木曜の18:00)
 *
 * @example
 * // 29時台の処理
 * getNextBroadcastDatetime(2, 25, 0)
 * // => '2024-12-04T01:00:00' (水曜の25:00 = 木曜の1:00)
 */
export const getNextBroadcastDatetime = (
  dayOfWeek: number,
  hour: number,
  minute: number
): string => {
  const now = dayjs();

  // 29時台の処理: 実際の時刻に変換
  const actualHour = hour >= 24 ? hour - 24 : hour;

  // 指定曜日・時刻のdayjsオブジェクトを作成
  let next = dayjs()
    .day(dayOfWeek)
    .hour(actualHour)
    .minute(minute)
    .second(0)
    .millisecond(0);

  // 29時台の場合は1日加算（翌日の早朝になる）
  if (hour >= 24) {
    next = next.add(1, 'day');
  }

  // 今日の該当時刻が既に過ぎている場合は次週にする
  if (next.isBefore(now)) {
    next = next.add(7, 'day');
  }

  return next.format('YYYY-MM-DDTHH:mm:ss');
};

/**
 * 期限を計算
 *
 * radikoのタイムフリー聴取期限を計算
 * 放送日時の7日後 + 29時間 = 8日後の5:00
 *
 * @param broadcastDatetime - ISO8601形式の放送日時文字列
 * @returns ISO8601形式の期限日時文字列
 *
 * @example
 * calculateDeadline('2024-12-05T18:00:00')
 * // => '2024-12-13T05:00:00' (8日後の5:00)
 */
export const calculateDeadline = (broadcastDatetime: string): string => {
  return dayjs(broadcastDatetime)
    .add(8, 'day')
    .hour(5)
    .minute(0)
    .second(0)
    .millisecond(0)
    .format('YYYY-MM-DDTHH:mm:ss');
};
