/**
 * RadioButtonGroup - ラジオボタングループコンポーネント
 *
 * 複数の選択肢から1つを選択するラジオボタン
 * 繰り返し設定などの選択に使用
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/theme';

// ============================================
// 型定義
// ============================================

/**
 * ラジオボタンの選択肢
 */
export interface RadioOption<T = string | number> {
  /** 表示ラベル */
  label: string;
  /** 値 */
  value: T;
}

/**
 * RadioButtonGroupコンポーネントのプロパティ
 */
export interface RadioButtonGroupProps<T = string | number> {
  /** 選択肢の配列 */
  options: readonly RadioOption<T>[];
  /** 現在選択されている値 */
  value: T;
  /** 値が変更されたときのコールバック */
  onChange: (value: T) => void;
  /** ラベルテキスト（オプション） */
  label?: string;
}

// ============================================
// コンポーネント
// ============================================

/**
 * ラジオボタングループコンポーネント
 *
 * 複数の選択肢から1つを選択
 * 各選択肢はタップ可能で、選択状態を視覚的に表示
 *
 * @example
 * // 繰り返し設定
 * <RadioButtonGroup
 *   options={REPEAT_TYPE_OPTIONS}
 *   value={repeatType}
 *   onChange={setRepeatType}
 *   label="繰り返し設定 *"
 * />
 *
 * @example
 * // 曜日選択
 * <RadioButtonGroup
 *   options={DAY_OF_WEEK_OPTIONS}
 *   value={dayOfWeek}
 *   onChange={setDayOfWeek}
 *   label="放送曜日 *"
 * />
 */
const RadioButtonGroupComponent = <T extends string | number>({
  options,
  value,
  onChange,
  label,
}: RadioButtonGroupProps<T>) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <TouchableOpacity
              key={String(option.value)}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={option.label}
            >
              <View style={styles.radioCircle}>
                {isSelected && <View style={styles.radioCircleInner} />}
              </View>
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const RadioButtonGroup = memo(RadioButtonGroupComponent) as typeof RadioButtonGroupComponent & {
  displayName: string;
};

RadioButtonGroup.displayName = 'RadioButtonGroup';

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
  optionsContainer: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.small,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.cardBackground,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: typography.fontSize.body,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: colors.text,
  },
});
