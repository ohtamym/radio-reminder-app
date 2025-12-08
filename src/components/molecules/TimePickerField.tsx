/**
 * TimePickerField - 時刻入力フィールドコンポーネント
 *
 * 放送時刻を入力するための時・分ピッカー
 * 時: 5-29（29時 = 翌日5時）
 * 分: 0, 15, 30, 45
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { HOURS, MINUTES } from '@/constants';
import { colors, spacing, typography, borderRadius } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * TimePickerFieldコンポーネントのプロパティ
 */
export interface TimePickerFieldProps {
  /** 選択中の時（5-29） */
  hour: number;
  /** 選択中の分（0, 15, 30, 45） */
  minute: number;
  /** 時が変更されたときのコールバック */
  onHourChange: (hour: number) => void;
  /** 分が変更されたときのコールバック */
  onMinuteChange: (minute: number) => void;
  /** ラベルテキスト（オプション） */
  label?: string;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 時刻入力フィールドコンポーネント
 *
 * 放送時刻を選択するための時・分ピッカー
 * 時と分の2つのPickerをコロンで区切って表示
 *
 * @example
 * <TimePickerField
 *   hour={18}
 *   minute={0}
 *   onHourChange={(h) => setHour(h)}
 *   onMinuteChange={(m) => setMinute(m)}
 *   label="放送時刻 *"
 * />
 *
 * @example
 * // ラベルなし
 * <TimePickerField
 *   hour={25}
 *   minute={30}
 *   onHourChange={(h) => setHour(h)}
 *   onMinuteChange={(m) => setMinute(m)}
 * />
 */
export const TimePickerField: React.FC<TimePickerFieldProps> = memo(
  ({ hour, minute, onHourChange, onMinuteChange, label = '放送時刻 *' }) => {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.pickerContainer}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={hour}
              onValueChange={onHourChange}
              style={styles.picker}
            >
              {HOURS.map((h) => (
                <Picker.Item key={h} label={`${h}`} value={h} />
              ))}
            </Picker>
          </View>

          <Text style={styles.separator}>:</Text>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={minute}
              onValueChange={onMinuteChange}
              style={styles.picker}
            >
              {MINUTES.map((m) => (
                <Picker.Item
                  key={m}
                  label={m.toString().padStart(2, '0')}
                  value={m}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
    );
  }
);

TimePickerField.displayName = 'TimePickerField';

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.md,
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    height: 50,
  },
  separator: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: spacing.sm,
  },
});
