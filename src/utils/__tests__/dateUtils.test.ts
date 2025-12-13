/**
 * dateUtils のユニットテスト
 *
 * テスト対象:
 * - calculateRemainingDays: 期限までの残り日数計算
 * - getNextBroadcastDatetime: 次回放送日時計算（29時台対応）
 * - calculateDeadline: 期限計算（29時台対応）
 * - formatBroadcastDatetime: 29時台形式でのフォーマット
 * - formatDate: 基本的な日時フォーマット
 */

import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  calculateRemainingDays,
  getNextBroadcastDatetime,
  calculateDeadline,
  formatBroadcastDatetime,
  formatDate,
  getRemainingDaysColor,
} from '../dateUtils';

// dayjsプラグインの設定
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

describe('dateUtils', () => {
  // ============================================
  // formatDate のテスト
  // ============================================
  describe('formatDate', () => {
    it('日時を指定されたフォーマットで返す', () => {
      const result = formatDate('2024-12-05 18:00:00', 'M/D(ddd) HH:mm');
      expect(result).toBe('12/5(木) 18:00');
    });

    it('年も含めたフォーマットで返す', () => {
      const result = formatDate('2024-12-05 18:00:00', 'YYYY年M月D日(ddd)');
      expect(result).toBe('2024年12月5日(木)');
    });

    it('深夜の時刻も正しくフォーマットする', () => {
      const result = formatDate('2024-12-05 01:30:00', 'M/D(ddd) HH:mm');
      expect(result).toBe('12/5(木) 01:30');
    });
  });

  // ============================================
  // formatBroadcastDatetime のテスト
  // ============================================
  describe('formatBroadcastDatetime', () => {
    it('5:00以降の通常時刻はそのまま表示', () => {
      const result = formatBroadcastDatetime('2024-12-12 18:00:00', 'M/D(ddd) HH:mm');
      expect(result).toBe('12/12(木) 18:00');
    });

    it('0:00～4:59は29時台形式で表示（前日の24:00～28:59）', () => {
      // 12/13(金) 3:30 → 12/12(木) 27:30
      const result = formatBroadcastDatetime('2024-12-13 03:30:00', 'M/D(ddd) HH:mm');
      expect(result).toBe('12/12(木) 27:30');
    });

    it('0:00は前日の24:00として表示', () => {
      // 12/13(金) 0:00 → 12/12(木) 24:00
      const result = formatBroadcastDatetime('2024-12-13 00:00:00', 'M/D(ddd) HH:mm');
      expect(result).toBe('12/12(木) 24:00');
    });

    it('4:59は前日の28:59として表示', () => {
      // 12/13(金) 4:59 → 12/12(木) 28:59
      const result = formatBroadcastDatetime('2024-12-13 04:59:00', 'M/D(ddd) HH:mm');
      expect(result).toBe('12/12(木) 28:59');
    });

    it('5:00ちょうどは通常表示', () => {
      const result = formatBroadcastDatetime('2024-12-13 05:00:00', 'M/D(ddd) HH:mm');
      expect(result).toBe('12/13(金) 05:00');
    });

    it('時刻パターンがない場合はそのまま表示', () => {
      const result = formatBroadcastDatetime('2024-12-13 03:30:00', 'M/D(ddd)');
      expect(result).toBe('12/13(金)');
    });

    it('年を含むフォーマットでも29時台形式に変換', () => {
      const result = formatBroadcastDatetime('2024-12-13 01:00:00', 'YYYY/M/D(ddd) HH:mm');
      expect(result).toBe('2024/12/12(木) 25:00');
    });
  });

  // ============================================
  // calculateRemainingDays のテスト
  // ============================================
  describe('calculateRemainingDays', () => {
    // 現在時刻をモック
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('2日後の期限の場合、2を返す', () => {
      // 現在: 2024-12-10 10:00:00
      jest.setSystemTime(new Date('2024-12-10T10:00:00+09:00'));

      const result = calculateRemainingDays('2024-12-12 05:00:00');
      expect(result).toBe(2);
    });

    it('1日と少しの場合、切り上げて2を返す', () => {
      // 現在: 2024-12-10 10:00:00
      jest.setSystemTime(new Date('2024-12-10T10:00:00+09:00'));

      const result = calculateRemainingDays('2024-12-11 20:00:00');
      expect(result).toBe(2); // 1.4日 → 切り上げで2
    });

    it('1日未満の場合、切り上げて1を返す', () => {
      // 現在: 2024-12-10 10:00:00
      jest.setSystemTime(new Date('2024-12-10T10:00:00+09:00'));

      const result = calculateRemainingDays('2024-12-10 20:00:00');
      expect(result).toBe(1); // 0.4日 → 切り上げで1
    });

    it('期限が過去の場合、負の値を返す', () => {
      // 現在: 2024-12-10 10:00:00
      jest.setSystemTime(new Date('2024-12-10T10:00:00+09:00'));

      const result = calculateRemainingDays('2024-12-09 05:00:00');
      expect(result).toBeLessThan(0);
    });

    it('ちょうど期限の場合、0を返す', () => {
      // 現在: 2024-12-10 10:00:00
      jest.setSystemTime(new Date('2024-12-10T10:00:00+09:00'));

      const result = calculateRemainingDays('2024-12-10 10:00:00');
      expect(result).toBe(0);
    });
  });

  // ============================================
  // getNextBroadcastDatetime のテスト
  // ============================================
  describe('getNextBroadcastDatetime', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('当日の未来の時刻を指定した場合、当日の日時を返す', () => {
      // 現在: 2024-12-05(木) 15:00
      jest.setSystemTime(new Date('2024-12-05T15:00:00+09:00'));

      // 木曜 18:00
      const result = getNextBroadcastDatetime(4, 18, 0);
      expect(result).toBe('2024-12-05 18:00:00');
    });

    it('当日の過去の時刻を指定した場合、次週の日時を返す', () => {
      // 現在: 2024-12-05(木) 20:00
      jest.setSystemTime(new Date('2024-12-05T20:00:00+09:00'));

      // 木曜 18:00
      const result = getNextBroadcastDatetime(4, 18, 0);
      expect(result).toBe('2024-12-12 18:00:00');
    });

    it('翌日の曜日を指定した場合、翌日の日時を返す', () => {
      // 現在: 2024-12-05(木) 15:00
      jest.setSystemTime(new Date('2024-12-05T15:00:00+09:00'));

      // 金曜 18:00
      const result = getNextBroadcastDatetime(5, 18, 0);
      expect(result).toBe('2024-12-06 18:00:00');
    });

    it('前日の曜日を指定した場合、次週の日時を返す', () => {
      // 現在: 2024-12-05(木) 15:00
      jest.setSystemTime(new Date('2024-12-05T15:00:00+09:00'));

      // 水曜 18:00
      const result = getNextBroadcastDatetime(3, 18, 0);
      expect(result).toBe('2024-12-11 18:00:00');
    });

    it('29時台（24時）の処理: 翌日0:00として計算', () => {
      // 現在: 2024-12-02(月) 15:00
      jest.setSystemTime(new Date('2024-12-02T15:00:00+09:00'));

      // 火曜 24:00（= 水曜 0:00）
      const result = getNextBroadcastDatetime(2, 24, 0);
      expect(result).toBe('2024-12-04 00:00:00'); // 水曜の0:00
    });

    it('29時台（25時）の処理: 翌日1:00として計算', () => {
      // 現在: 2024-12-02(月) 15:00
      jest.setSystemTime(new Date('2024-12-02T15:00:00+09:00'));

      // 火曜 25:00（= 水曜 1:00）
      const result = getNextBroadcastDatetime(2, 25, 0);
      expect(result).toBe('2024-12-04 01:00:00'); // 水曜の1:00
    });

    it('29時台（29時）の処理: 翌日5:00として計算', () => {
      // 現在: 2024-12-02(月) 15:00
      jest.setSystemTime(new Date('2024-12-02T15:00:00+09:00'));

      // 火曜 29:00（= 水曜 5:00）
      const result = getNextBroadcastDatetime(2, 29, 0);
      expect(result).toBe('2024-12-04 05:00:00'); // 水曜の5:00
    });

    it('29時台で当日深夜前の場合、当日深夜の日時を返す', () => {
      // 現在: 2024-12-03(火) 20:00
      jest.setSystemTime(new Date('2024-12-03T20:00:00+09:00'));

      // 火曜 25:00（= 水曜 1:00）
      const result = getNextBroadcastDatetime(2, 25, 0);
      expect(result).toBe('2024-12-04 01:00:00'); // 水曜の1:00（当日深夜）
    });

    it('29時台で当日深夜を過ぎた場合、次週の日時を返す', () => {
      // 現在: 2024-12-04(水) 02:00（= 火曜 26:00）
      jest.setSystemTime(new Date('2024-12-04T02:00:00+09:00'));

      // 火曜 25:00（= 水曜 1:00）
      const result = getNextBroadcastDatetime(2, 25, 0);
      expect(result).toBe('2024-12-11 01:00:00'); // 次週水曜の1:00
    });

    it('分の指定が正しく反映される', () => {
      // 現在: 2024-12-05(木) 15:00
      jest.setSystemTime(new Date('2024-12-05T15:00:00+09:00'));

      // 木曜 18:30
      const result = getNextBroadcastDatetime(4, 18, 30);
      expect(result).toBe('2024-12-05 18:30:00');
    });
  });

  // ============================================
  // getRemainingDaysColor のテスト
  // ============================================
  describe('getRemainingDaysColor', () => {
    it('残り1日以下の場合、緊急色（赤）を返す', () => {
      const result = getRemainingDaysColor(1);
      expect(result).toBe('#F44336'); // colors.deadlineUrgent
    });

    it('残り0日の場合、緊急色（赤）を返す', () => {
      const result = getRemainingDaysColor(0);
      expect(result).toBe('#F44336');
    });

    it('残り2日の場合、警告色（黄）を返す', () => {
      const result = getRemainingDaysColor(2);
      expect(result).toBe('#FFC107'); // colors.deadlineWarning
    });

    it('残り3日の場合、警告色（黄）を返す', () => {
      const result = getRemainingDaysColor(3);
      expect(result).toBe('#FFC107');
    });

    it('残り4日以上の場合、通常色（グレー）を返す', () => {
      const result = getRemainingDaysColor(4);
      expect(result).toBe('#757575'); // colors.deadlineNormal
    });

    it('残り7日の場合、通常色（グレー）を返す', () => {
      const result = getRemainingDaysColor(7);
      expect(result).toBe('#757575');
    });
  });

  // ============================================
  // calculateDeadline のテスト
  // ============================================
  describe('calculateDeadline', () => {
    it('通常の時刻（5:00～23:59）: 8日後の5:00を返す', () => {
      const result = calculateDeadline('2024-12-05 18:00:00', 18);
      expect(result).toBe('2024-12-13 05:00:00');
    });

    it('午前の時刻: 8日後の5:00を返す', () => {
      const result = calculateDeadline('2024-12-05 10:00:00', 10);
      expect(result).toBe('2024-12-13 05:00:00');
    });

    it('5:00ちょうど: 8日後の5:00を返す', () => {
      const result = calculateDeadline('2024-12-05 05:00:00', 5);
      expect(result).toBe('2024-12-13 05:00:00');
    });

    it('23:59: 8日後の5:00を返す', () => {
      const result = calculateDeadline('2024-12-05 23:59:00', 23);
      expect(result).toBe('2024-12-13 05:00:00');
    });

    it('29時台（24時）の処理: 前日基準で8日後の5:00を返す', () => {
      // 火曜24:00 = 水曜0:00
      // 番組表上は火曜なので、火曜基準で8日後 = 次週水曜5:00
      const result = calculateDeadline('2024-12-04 00:00:00', 24);
      expect(result).toBe('2024-12-11 05:00:00'); // 次週水曜5:00
    });

    it('29時台（25時）の処理: 前日基準で8日後の5:00を返す', () => {
      // 火曜25:00 = 水曜1:00
      // 番組表上は火曜なので、火曜基準で8日後 = 次週水曜5:00
      const result = calculateDeadline('2024-12-04 01:00:00', 25);
      expect(result).toBe('2024-12-11 05:00:00'); // 次週水曜5:00
    });

    it('29時台（29時）の処理: 前日基準で8日後の5:00を返す', () => {
      // 火曜29:00 = 水曜5:00
      // 番組表上は火曜なので、火曜基準で8日後 = 次週水曜5:00
      const result = calculateDeadline('2024-12-04 05:00:00', 29);
      expect(result).toBe('2024-12-11 05:00:00'); // 次週水曜5:00
    });

    it('月末をまたぐ場合も正しく計算', () => {
      const result = calculateDeadline('2024-12-28 18:00:00', 18);
      expect(result).toBe('2025-01-05 05:00:00'); // 年をまたぐ
    });

    it('うるう年も正しく計算', () => {
      const result = calculateDeadline('2024-02-25 18:00:00', 18);
      expect(result).toBe('2024-03-04 05:00:00'); // うるう年の2/29を含む
    });

    it('時刻が5:00でなくても期限は必ず5:00になる', () => {
      const result = calculateDeadline('2024-12-05 14:30:00', 14);
      expect(result).toBe('2024-12-13 05:00:00');
    });
  });
});
