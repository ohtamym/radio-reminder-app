/**
 * ProgramForm - 番組登録/編集フォームコンポーネント
 *
 * 番組情報を入力するためのフォーム
 * - 放送局名入力
 * - 番組名入力
 * - 放送曜日選択
 * - 放送時刻選択（TimePickerField使用）
 * - 繰り返し設定（RadioButtonGroup使用）
 * - バリデーション
 * - エラー表示
 */

import React, { useState, memo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, Input, Text } from '@/components/atoms';
import { TimePickerField, RadioButtonGroup } from '@/components/molecules';
import { Program, ProgramFormData, RepeatType } from '@/types';
import { DAY_OF_WEEK_OPTIONS, REPEAT_TYPE_OPTIONS } from '@/constants';
import { theme } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * ProgramFormコンポーネントのプロパティ
 */
export interface ProgramFormProps {
  /** 初期データ（編集時） */
  initialData?: Program;
  /** フォーム送信時のコールバック */
  onSubmit: (data: ProgramFormData) => void;
  /** キャンセル時のコールバック */
  onCancel: () => void;
}

// ============================================
// コンポーネント
// ============================================

/**
 * 番組登録/編集フォームコンポーネント
 *
 * 新規登録時と編集時の両方に対応
 * バリデーションとエラー表示機能を持つ
 *
 * @example
 * // 新規登録
 * <ProgramForm
 *   onSubmit={handleCreate}
 *   onCancel={() => navigation.goBack()}
 * />
 *
 * @example
 * // 編集
 * <ProgramForm
 *   initialData={program}
 *   onSubmit={handleUpdate}
 *   onCancel={() => navigation.goBack()}
 * />
 */
const ProgramForm: React.FC<ProgramFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  // ============================================
  // State管理
  // ============================================

  const [stationName, setStationName] = useState(
    initialData?.station_name || ''
  );
  const [programName, setProgramName] = useState(
    initialData?.program_name || ''
  );
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.day_of_week || 0);
  const [hour, setHour] = useState(initialData?.hour || 18);
  const [minute, setMinute] = useState(initialData?.minute || 0);
  const [repeatType, setRepeatType] = useState<RepeatType>(
    initialData?.repeat_type || 'weekly'
  );
  const [errors, setErrors] = useState<string>('');

  // ============================================
  // イベントハンドラ
  // ============================================

  /**
   * フォーム送信処理
   *
   * バリデーションを実行し、問題なければonSubmitコールバックを呼び出す
   */
  const handleSubmit = () => {
    // バリデーション
    if (!stationName.trim() || !programName.trim()) {
      setErrors('放送局名と番組名は必須です');
      return;
    }

    // エラーをクリア
    setErrors('');

    // フォームデータを送信
    onSubmit({
      station_name: stationName.trim(),
      program_name: programName.trim(),
      day_of_week: dayOfWeek,
      hour,
      minute,
      repeat_type: repeatType,
    });
  };

  // ============================================
  // レンダリング
  // ============================================

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* 放送局名入力 */}
        <Input
          label="放送局名 *"
          value={stationName}
          onChangeText={setStationName}
          placeholder="例: TBSラジオ"
        />

        {/* 番組名入力 */}
        <Input
          label="番組名 *"
          value={programName}
          onChangeText={setProgramName}
          placeholder="例: アフター6ジャンクション"
        />

        {/* 放送曜日選択 */}
        <View style={styles.field}>
          <Text style={styles.label}>放送曜日 *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dayOfWeek}
              onValueChange={(value) => setDayOfWeek(value)}
              style={styles.picker}
            >
              {DAY_OF_WEEK_OPTIONS.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* 放送時刻選択 */}
        <TimePickerField
          hour={hour}
          minute={minute}
          onHourChange={setHour}
          onMinuteChange={setMinute}
        />

        {/* 繰り返し設定 */}
        <RadioButtonGroup
          label="繰り返し設定 *"
          options={REPEAT_TYPE_OPTIONS}
          value={repeatType}
          onChange={setRepeatType}
        />

        {/* エラーメッセージ */}
        {errors ? <Text style={styles.error}>{errors}</Text> : null}
      </View>

      {/* フッター: キャンセルと送信ボタン */}
      <View style={styles.footer}>
        <View style={styles.buttonWrapper}>
          <Button variant="secondary" onPress={onCancel}>
            キャンセル
          </Button>
        </View>
        <View style={styles.buttonWrapper}>
          <Button variant="primary" onPress={handleSubmit}>
            {initialData ? '保存' : '登録'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

// ============================================
// スタイル
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  form: {
    padding: theme.spacing.lg,
  },
  field: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden', // iOSでの角丸対応
  },
  picker: {
    height: 50,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.caption,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});

// ============================================
// エクスポート
// ============================================

// displayNameを設定（デバッグ時に役立つ）
ProgramForm.displayName = 'ProgramForm';

// memoでラップしてエクスポート
export default memo(ProgramForm);
