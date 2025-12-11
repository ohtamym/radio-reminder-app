/**
 * 日時計算とフォーマットのユーティリティ関数
 *
 * radikoのタイムフリー機能に対応した日時処理
 * - 29時台の処理（深夜放送対応）
 * - Asia/Tokyoタイムゾーン
 * - SQLite標準形式（YYYY-MM-DD HH:mm:ss）での日時管理
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
 * @param date - SQLite標準形式の日時文字列（YYYY-MM-DD HH:mm:ss）
 * @param format - フォーマット文字列（dayjs形式）
 * @returns フォーマットされた日時文字列
 *
 * @example
 * formatDate('2024-12-05 18:00:00', 'M/D(ddd) HH:mm')
 * // => '12/5(木) 18:00'
 */
export const formatDate = (date: string, format: string): string => {
  return dayjs(date).format(format);
};

/**
 * 放送日時を29時台形式でフォーマットして返す
 * 
 * 0:00～4:59の時刻を前日の24:00～28:59として表示する
 * （例: 12/13(土) 3:30 → 12/12(金) 27:30）
 * 
 * @param date - SQLite標準形式の日時文字列（YYYY-MM-DD HH:mm:ss）
 * @param format - フォーマット文字列（dayjs形式）
 * @returns 29時台形式でフォーマットされた日時文字列
 * 
 * @example
 * formatBroadcastDatetime('2024-12-13 03:30:00', 'M/D(ddd) HH:mm')
 * // => '12/12(金) 27:30'
 * 
 * @example
 * formatBroadcastDatetime('2024-12-12 18:00:00', 'M/D(ddd) HH:mm')
 * // => '12/12(木) 18:00'
 */
export const formatBroadcastDatetime = (date: string, format: string): string => {
  const dt = dayjs(date);
  const hour = dt.hour();

  // 5:00未満の場合、29時台形式に変換
  if (hour < 5) {
    // 前日の日付
    const adjustedDate = dt.subtract(1, 'day');
    // 29時台の時刻（24～28時）
    const adjustedHour = hour + 24;

    // 時刻部分のパターンを検索（末尾の HH:mm または H:mm）
    const timePattern = /(\s*)(HH?:mm)(\s*)$/;
    const match = format.match(timePattern);

    if (match) {
      // 時刻部分を除いた日付フォーマット
      const dateFormat = format.replace(timePattern, '');
      // 日付部分をフォーマット
      const dateStr = adjustedDate.format(dateFormat);
      // 時刻文字列を生成
      const timeStr = `${adjustedHour.toString().padStart(2, '0')}:${dt.minute().toString().padStart(2, '0')}`;
      // 結合（元のスペースを保持）
      return dateStr + match[1] + timeStr + match[3];
    }
  }

  // 5:00以降、またはパターンマッチしない場合はそのまま
  return dt.format(format);
};

// ============================================
// 残り日数計算関数
// ============================================

/**
 * 期限までの残り日数を計算
 *
 * @param deadline - SQLite標準形式の期限日時文字列（YYYY-MM-DD HH:mm:ss）
 * @returns 残り日数（小数点切り上げ）
 *
 * @example
 * calculateRemainingDays('2024-12-12 05:00:00')
 * // 現在が2024-12-10 10:00:00の場合 => 2
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
 * @returns YYYY-MM-DD HH:mm:ss形式の日時文字列（SQLite標準形式）
 *
 * @example
 * // 現在: 2024-12-05(木) 15:00
 * getNextBroadcastDatetime(4, 18, 0)
 * // => '2024-12-05 18:00:00' (当日の18:00)
 *
 * @example
 * // 現在: 2024-12-05(木) 20:00
 * getNextBroadcastDatetime(4, 18, 0)
 * // => '2024-12-12 18:00:00' (次週木曜の18:00)
 *
 * @example
 * // 29時台の処理
 * getNextBroadcastDatetime(2, 25, 0)
 * // => '2024-12-04 01:00:00' (水曜の25:00 = 木曜の1:00)
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

  return next.format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 期限を計算
 *
 * radikoのタイムフリー聴取期限を計算
 * 放送日時の7日後 + 29時間 = 8日後の5:00
 * 24時以降の番組は、番組表上の日付（前日）を基準とする
 *
 * @param broadcastDatetime - YYYY-MM-DD HH:mm:ss形式の放送日時文字列（SQLite標準形式）
 * @param originalHour - 元の放送時（5-29）。24時以降かの判定に使用
 * @returns YYYY-MM-DD HH:mm:ss形式の期限日時文字列（SQLite標準形式）
 *
 * @example
 * calculateDeadline('2024-12-05 18:00:00', 18)
 * // => '2024-12-13 05:00:00' (8日後の5:00)
 *
 * @example
 * // 火曜24時（= 水曜0時）の番組の場合
 * calculateDeadline('2024-12-04 00:00:00', 24)
 * // => '2024-12-11 05:00:00' (火曜基準で8日後の5:00 = 次週水曜5時)
 */
export const calculateDeadline = (broadcastDatetime: string, originalHour: number): string => {
  let deadline = dayjs(broadcastDatetime).add(8, 'day');

  // 24時以降の番組の場合、番組表上の日付（前日）を基準にするため1日引く
  if (originalHour >= 24) {
    deadline = deadline.subtract(1, 'day');
  }

  return deadline
    .hour(5)
    .minute(0)
    .second(0)
    .millisecond(0)
    .format('YYYY-MM-DD HH:mm:ss');
};
