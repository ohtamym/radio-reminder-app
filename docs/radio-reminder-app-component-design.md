# ラジオ番組聞き逃し防止アプリ コンポーネント設計書

## 1. アーキテクチャ概要

### 1.1 アーキテクチャパターン

- **プレゼンテーション/コンテナパターン**: UIとロジックを分離
- **Custom Hooks**: 状態管理とビジネスロジックを再利用可能に
- **Context API**: グローバル状態管理（データベース接続）

### 1.2 ディレクトリ構成

```
src/
├── components/           # 再利用可能なUIコンポーネント
│   ├── atoms/           # 最小単位のコンポーネント
│   ├── molecules/       # atomsを組み合わせたコンポーネント
│   └── organisms/       # moleculesを組み合わせた複雑なコンポーネント
├── screens/             # 画面コンポーネント
├── hooks/               # カスタムフック
├── contexts/            # Context API（グローバル状態管理）
├── services/            # データベース操作
├── utils/               # ユーティリティ関数
├── types/               # TypeScript型定義
├── constants/           # 定数定義
├── theme/               # テーマ・スタイル設定
└── navigation/          # ナビゲーション設定
```

---

## 2. コンポーネント一覧

### 2.1 Atoms（原子コンポーネント）

| コンポーネント名 | 説明 | Props |
|----------------|------|-------|
| Button | 汎用ボタン | title, onPress, variant, disabled |
| Text | 汎用テキスト | children, variant, color |
| Icon | アイコン表示 | name, size, color |
| Badge | ステータスバッジ | status, label |
| Input | テキスト入力 | value, onChangeText, placeholder, error |

### 2.2 Molecules（分子コンポーネント）

| コンポーネント名 | 説明 | 主な用途 |
|----------------|------|---------|
| StatusIndicator | ステータス表示 | タスクの状態を視覚化 |
| DeadlineInfo | 期限情報表示 | 残り時間の表示 |
| ProgramInfo | 番組情報表示 | 放送局名と番組名 |
| TimePickerField | 時刻選択フィールド | 時・分の入力 |
| RadioButtonGroup | ラジオボタングループ | 繰り返し設定の選択 |
| EmptyState | 空状態表示 | データなし時の表示 |
| LoadingSpinner | ローディング表示 | データ読み込み中の表示 |

### 2.3 Organisms（有機体コンポーネント）

| コンポーネント名 | 説明 | 主な用途 |
|----------------|------|---------|
| TaskCard | タスクカード | タスク一覧の各アイテム |
| TaskDetailView | タスク詳細表示 | タスクの詳細情報 |
| ProgramForm | 番組登録/編集フォーム | 番組情報の入力 |
| DeleteConfirmDialog | 削除確認ダイアログ | 削除方法の選択 |
| HistoryCard | 履歴カード | 履歴一覧の各アイテム |

### 2.4 Screens（画面コンポーネント）

| コンポーネント名 | 説明 |
|----------------|------|
| TaskListScreen | タスク一覧画面 |
| ProgramFormScreen | 番組登録/編集画面 |
| TaskDetailScreen | タスク詳細画面 |
| HistoryScreen | 履歴画面 |

---

## 3. コンポーネント詳細設計

### 3.1 Atoms

#### 3.1.1 Button

**責務**: 汎用的なボタンコンポーネント

**Props**
```typescript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}
```

**実装例**
```typescript
// src/components/atoms/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  danger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.danger,
  },
});
```

---

#### 3.1.2 Badge

**責務**: ステータスバッジの表示

**Props**
```typescript
interface BadgeProps {
  status: 'unlistened' | 'listening' | 'completed';
  label: string;
}
```

**実装例**
```typescript
// src/components/atoms/Badge.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_CONFIG } from '@/constants';
import { theme } from '@/theme';

export const Badge: React.FC<BadgeProps> = memo(({ status, label }) => {
  const config = STATUS_CONFIG[status];
  
  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Text style={styles.emoji}>{config.emoji}</Text>
      <Text style={[styles.label, { color: config.color }]}>
        {label || config.label}
      </Text>
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  emoji: {
    fontSize: theme.typography.small.fontSize,
    marginRight: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
  },
});
```

---

### 3.2 Molecules

#### 3.2.1 StatusIndicator

**責務**: タスクのステータスを視覚的に表示

**Props**
```typescript
interface StatusIndicatorProps {
  status: TaskStatus;
  onStatusChange?: (status: TaskStatus) => void;
  showButtons?: boolean;
}
```

**実装例**
```typescript
// src/components/molecules/StatusIndicator.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { TaskStatus } from '../../types';

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  onStatusChange,
  showButtons = false,
}) => {
  return (
    <View style={styles.container}>
      <Badge status={status} />
      
      {showButtons && onStatusChange && (
        <View style={styles.buttons}>
          {status === 'unlistened' && (
            <>
              <Button
                title="聴取中へ"
                variant="secondary"
                onPress={() => onStatusChange('listening')}
              />
              <Button
                title="完了"
                variant="primary"
                onPress={() => onStatusChange('completed')}
              />
            </>
          )}
          {status === 'listening' && (
            <>
              <Button
                title="未聴取へ"
                variant="secondary"
                onPress={() => onStatusChange('unlistened')}
              />
              <Button
                title="完了"
                variant="primary"
                onPress={() => onStatusChange('completed')}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
});
```

---

#### 3.2.2 DeadlineInfo

**責務**: 期限情報と残り時間を表示

**Props**
```typescript
interface DeadlineInfoProps {
  deadline: string; // YYYY-MM-DD HH:mm:ss形式
  broadcastDatetime: string; // YYYY-MM-DD HH:mm:ss形式
}
```

**実装例**
```typescript
// src/components/molecules/DeadlineInfo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDate, calculateRemainingDays, getRemainingDaysColor } from '../../utils/dateUtils';

export const DeadlineInfo: React.FC<DeadlineInfoProps> = ({
  deadline,
  broadcastDatetime,
}) => {
  const remainingDays = calculateRemainingDays(deadline);
  const color = getRemainingDaysColor(remainingDays);
  
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>放送日時</Text>
        <Text style={styles.value}>
          {formatDate(broadcastDatetime, 'YYYY/MM/DD(ddd) HH:mm')}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>視聴期限</Text>
        <View>
          <Text style={styles.value}>
            {formatDate(deadline, 'YYYY/MM/DD(ddd) HH:mm')}
          </Text>
          <Text style={[styles.remaining, { color }]}>
            あと{remainingDays}日
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#212121',
  },
  remaining: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 4,
  },
});
```

---

#### 3.2.3 LoadingSpinner

**責務**: データ読み込み中のローディング表示

**Props**
```typescript
interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
}
```

**実装例**
```typescript
// src/components/molecules/LoadingSpinner.tsx
import React, { memo } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = memo(({ 
  message,
  size = 'large',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
```

---

#### 3.2.4 TimePickerField

**責務**: 時刻入力フィールド（時・分）

**Props**
```typescript
interface TimePickerFieldProps {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}
```

**実装例**
```typescript
// src/components/molecules/TimePickerField.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { HOURS, MINUTES } from '@/constants';
import { theme } from '@/theme';

export const TimePickerField: React.FC<TimePickerFieldProps> = memo(({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>放送時刻 *</Text>
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
});

TimePickerField.displayName = 'TimePickerField';

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
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
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm,
  },
});
```

---

### 3.3 Organisms

#### 3.3.1 TaskCard

**責務**: タスク一覧の各カード表示

**Props**
```typescript
interface TaskCardProps {
  task: TaskWithProgram;
  onPress: () => void;
  onStatusChange: (status: TaskStatus) => void;
}
```

**実装例**
```typescript
// src/components/organisms/TaskCard.tsx
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { TaskWithProgram, TaskStatus } from '@/types';
import { formatDate, calculateRemainingDays, getRemainingDaysColor } from '@/utils/dateUtils';
import { theme } from '@/theme';

// propsの比較関数でパフォーマンス最適化
const arePropsEqual = (
  prevProps: TaskCardProps,
  nextProps: TaskCardProps
): boolean => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.deadline_datetime === nextProps.task.deadline_datetime
  );
};

export const TaskCard = memo<TaskCardProps>(({
  task,
  onPress,
  onStatusChange,
}) => {
  const remainingDays = calculateRemainingDays(task.deadline_datetime);
  const deadlineColor = getRemainingDaysColor(remainingDays);
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.stationInfo}>
          <Text style={styles.emoji}>📻</Text>
          <Text style={styles.station}>{task.station_name}</Text>
        </View>
        <Badge status={task.status} />
      </View>
      
      <Text style={styles.programName}>{task.program_name}</Text>
      
      <Text style={styles.datetime}>
        {formatDate(task.broadcast_datetime, 'MM/DD(ddd) HH:mm')}
      </Text>
      
      <Text style={[styles.deadline, { color: deadlineColor }]}>
        期限: あと{remainingDays}日 ({formatDate(task.deadline_datetime, 'MM/DD HH:mm')})
      </Text>
      
      <View style={styles.actions}>
        {task.status === 'unlistened' && (
          <>
            <Button
              title="聴取中へ"
              variant="secondary"
              onPress={() => onStatusChange('listening')}
            />
            <Button
              title="完了"
              variant="primary"
              onPress={() => onStatusChange('completed')}
            />
          </>
        )}
        {task.status === 'listening' && (
          <>
            <Button
              title="未聴取へ"
              variant="secondary"
              onPress={() => onStatusChange('unlistened')}
            />
            <Button
              title="完了"
              variant="primary"
              onPress={() => onStatusChange('completed')}
            />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}, arePropsEqual);

TaskCard.displayName = 'TaskCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: theme.typography.body.fontSize,
    marginRight: 6,
  },
  station: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  programName: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  datetime: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  deadline: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});
```

---

#### 3.3.2 ProgramForm

**責務**: 番組登録/編集フォーム

**Props**
```typescript
interface ProgramFormProps {
  initialData?: Program;
  onSubmit: (data: ProgramFormData) => void;
  onCancel: () => void;
}

interface ProgramFormData {
  stationName: string;
  programName: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  repeatType: 'none' | 'weekly';
}
```

**実装例**
```typescript
// src/components/organisms/ProgramForm.tsx
import React, { useState, memo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '../atoms/Button';
import { TimePickerField } from '../molecules/TimePickerField';
import { RadioButtonGroup } from '../molecules/RadioButtonGroup';
import { DAY_OF_WEEK_OPTIONS, REPEAT_TYPE_OPTIONS } from '@/constants';
import { theme } from '@/theme';

export const ProgramForm = memo<ProgramFormProps>(({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [stationName, setStationName] = useState(initialData?.station_name || '');
  const [programName, setProgramName] = useState(initialData?.program_name || '');
  const [dayOfWeek, setDayOfWeek] = useState(initialData?.day_of_week || 0);
  const [hour, setHour] = useState(initialData?.hour || 18);
  const [minute, setMinute] = useState(initialData?.minute || 0);
  const [repeatType, setRepeatType] = useState<'none' | 'weekly'>(
    initialData?.repeat_type || 'weekly'
  );
  const [errors, setErrors] = useState<string>('');

  const handleSubmit = () => {
    // バリデーション
    if (!stationName || !programName) {
      setErrors('すべての項目を入力してください');
      return;
    }

    setErrors('');
    onSubmit({
      stationName,
      programName,
      dayOfWeek,
      hour,
      minute,
      repeatType,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>放送局名 *</Text>
          <TextInput
            style={styles.input}
            value={stationName}
            onChangeText={setStationName}
            placeholder="例: TBSラジオ"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>番組名 *</Text>
          <TextInput
            style={styles.input}
            value={programName}
            onChangeText={setProgramName}
            placeholder="例: アフター6ジャンクション"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>放送曜日 *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dayOfWeek}
              onValueChange={setDayOfWeek}
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

        <TimePickerField
          hour={hour}
          minute={minute}
          onHourChange={setHour}
          onMinuteChange={setMinute}
        />

        <View style={styles.field}>
          <Text style={styles.label}>繰り返し設定 *</Text>
          <RadioButtonGroup
            options={REPEAT_TYPE_OPTIONS}
            value={repeatType}
            onChange={setRepeatType}
          />
        </View>

        {errors ? <Text style={styles.error}>{errors}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Button
          title="キャンセル"
          variant="secondary"
          onPress={onCancel}
        />
        <Button
          title={initialData ? '保存' : '登録'}
          variant="primary"
          onPress={handleSubmit}
        />
      </View>
    </ScrollView>
  );
});

ProgramForm.displayName = 'ProgramForm';

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
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  pickerContainer: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.sm,
  },
  picker: {
    height: 50,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.caption.fontSize,
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
});
```

---

#### 3.3.3 DeleteConfirmDialog

**責務**: 削除確認ダイアログ

**Props**
```typescript
interface DeleteConfirmDialogProps {
  visible: boolean;
  repeatType: 'none' | 'weekly';
  onDeleteThis: () => void;
  onDeleteAll: () => void;
  onCancel: () => void;
}
```

**実装例**
```typescript
// src/components/organisms/DeleteConfirmDialog.tsx
import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Button } from '../atoms/Button';

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  visible,
  repeatType,
  onDeleteThis,
  onDeleteAll,
  onCancel,
}) => {
  if (repeatType === 'none') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>削除確認</Text>
            <Text style={styles.message}>このタスクを削除しますか？</Text>
            
            <View style={styles.actions}>
              <Button
                title="キャンセル"
                variant="secondary"
                onPress={onCancel}
              />
              <Button
                title="削除"
                variant="danger"
                onPress={onDeleteThis}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>削除方法を選択</Text>
          <Text style={styles.message}>
            この番組のタスクは{'\n'}繰り返し設定されています
          </Text>
          
          <View style={styles.options}>
            <Button
              title="この回だけ削除"
              variant="secondary"
              onPress={onDeleteThis}
              fullWidth
            />
            <Button
              title="繰り返し設定ごと削除"
              variant="danger"
              onPress={onDeleteAll}
              fullWidth
            />
          </View>
          
          <Button
            title="キャンセル"
            variant="secondary"
            onPress={onCancel}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  options: {
    gap: 12,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
});
```

---

### 3.4 Screens

#### 3.4.1 TaskListScreen

**責務**: タスク一覧画面

**実装例**
```typescript
// src/screens/TaskListScreen.tsx
import React, { useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { TaskCard } from '../components/organisms/TaskCard';
import { EmptyState } from '../components/molecules/EmptyState';
import { LoadingSpinner } from '../components/molecules/LoadingSpinner';
import { Button } from '../components/atoms/Button';
import { useTasks } from '../hooks/useTasks';
import { useNavigation } from '@react-navigation/native';
import { TaskWithProgram, TaskStatus } from '@/types';
import { theme } from '@/theme';

export const TaskListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { tasks, loading, updateTaskStatus, cleanupExpiredTasks, refetch } = useTasks();

  useEffect(() => {
    // アプリ起動時に期限切れタスクをクリーンアップ
    cleanupExpiredTasks();
  }, []);

  // useCallbackでメモ化
  const handleStatusChange = useCallback(async (taskId: number, status: TaskStatus) => {
    await updateTaskStatus(taskId, status);
  }, [updateTaskStatus]);

  const handleTaskPress = useCallback((taskId: number) => {
    navigation.navigate('TaskDetail', { taskId });
  }, [navigation]);

  const handleAddPress = useCallback(() => {
    navigation.navigate('ProgramForm');
  }, [navigation]);

  const handleHistoryPress = useCallback(() => {
    navigation.navigate('History');
  }, [navigation]);

  // keyExtractorをメモ化
  const keyExtractor = useCallback((item: TaskWithProgram) => item.id.toString(), []);

  // renderItemをメモ化
  const renderItem = useCallback(({ item }: { item: TaskWithProgram }) => (
    <TaskCard
      task={item}
      onPress={() => handleTaskPress(item.id)}
      onStatusChange={(status) => handleStatusChange(item.id, status)}
    />
  ), [handleTaskPress, handleStatusChange]);

  if (loading) {
    return <LoadingSpinner message="タスクを読み込んでいます..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            icon="📻"
            message="まだタスクがありません"
            subMessage="右上の[+]ボタンから番組を登録しましょう"
          />
        }
        contentContainerStyle={styles.list}
        // パフォーマンス最適化
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={10}
        // プルツーリフレッシュ
        onRefresh={refetch}
        refreshing={loading}
      />
      
      <View style={styles.footer}>
        <Button
          title="履歴を見る"
          variant="secondary"
          onPress={handleHistoryPress}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});
```

---

## 4. Theme（テーマシステム）

### 4.1 theme/index.ts

**責務**: アプリ全体で使用する共通スタイルの定義

```typescript
// src/theme/index.ts
export const theme = {
  colors: {
    // Primary colors
    primary: '#2196F3',
    secondary: '#FFC107',
    danger: '#F44336',
    success: '#4CAF50',
    
    // Background colors
    background: '#FFFFFF',
    cardBackground: '#F5F5F5',
    
    // Text colors
    text: '#212121',
    textSecondary: '#757575',
    white: '#FFFFFF',
    
    // Border colors
    border: '#E0E0E0',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  
  typography: {
    h1: {
      fontSize: 20,
      fontWeight: 'bold' as const,
    },
    h2: {
      fontSize: 18,
      fontWeight: 'bold' as const,
    },
    body: {
      fontSize: 16,
    },
    caption: {
      fontSize: 14,
    },
    small: {
      fontSize: 12,
    },
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
} as const;

export type Theme = typeof theme;
```

---

## 5. Constants（定数定義）

### 5.1 constants/index.ts

**責務**: アプリ全体で使用する定数の定義

```typescript
// src/constants/index.ts

// 時刻選択用の定数
export const HOURS = Array.from({ length: 25 }, (_, i) => i + 5) as const; // 5-29
export const MINUTES = [0, 15, 30, 45] as const;

// 曜日選択用の定数
export const DAY_OF_WEEK_OPTIONS = [
  { label: '日曜日', value: 0 },
  { label: '月曜日', value: 1 },
  { label: '火曜日', value: 2 },
  { label: '水曜日', value: 3 },
  { label: '木曜日', value: 4 },
  { label: '金曜日', value: 5 },
  { label: '土曜日', value: 6 },
] as const;

// 繰り返し設定用の定数
export const REPEAT_TYPE_OPTIONS = [
  { label: 'なし（単発）', value: 'none' },
  { label: '毎週', value: 'weekly' },
] as const;

// ステータス設定
export const STATUS_CONFIG = {
  unlistened: {
    color: '#F44336',
    emoji: '🔴',
    label: '未聴取',
  },
  listening: {
    color: '#FFC107',
    emoji: '🟡',
    label: '聴取中',
  },
  completed: {
    color: '#4CAF50',
    emoji: '✅',
    label: '聴取済み',
  },
} as const;

// 期限表示の色設定
export const DEADLINE_COLORS = {
  urgent: '#F44336',    // 残り1日以内
  warning: '#FFC107',   // 残り2-3日
  normal: '#757575',    // 残り4日以上
} as const;
```

---

## 6. Contexts（グローバル状態管理）

### 6.1 DatabaseContext

**責務**: データベース接続のグローバル管理

```typescript
// src/contexts/DatabaseContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SQLite from 'expo-sqlite';
import { initializeTables } from '../services/database';

interface DatabaseContextValue {
  db: SQLite.SQLiteDatabase | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
});

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const database = await SQLite.openDatabaseAsync('radio_reminder.db');
        await initializeTables(database);
        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initDatabase();
  }, []);

  if (!isReady) {
    return null; // または <LoadingSpinner />
  }

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextValue => {
  const context = useContext(DatabaseContext);
  if (!context.db && context.isReady) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};
```

---

## 7. Utils（ユーティリティ関数）

### 7.1 errorHandler

**責務**: エラーハンドリングの共通処理

```typescript
// src/utils/errorHandler.ts
import { Alert } from 'react-native';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): void => {
  if (error instanceof AppError) {
    Alert.alert('エラー', error.message);
    logError(error);
  } else if (error instanceof Error) {
    Alert.alert('予期しないエラー', error.message);
    logError(error);
  } else {
    Alert.alert('エラー', '不明なエラーが発生しました');
  }
};

const logError = (error: Error): void => {
  // 本番環境ではSentryなどのエラー追跡サービスに送信
  console.error('[ERROR]', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
};
```

### 7.2 ErrorBoundary

**責務**: Reactコンポーネントのエラーをキャッチ

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './atoms/Button';
import { theme } from '@/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // エラーログサービスに送信
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>エラーが発生しました</Text>
          <Text style={styles.message}>
            {this.state.error?.message || '不明なエラー'}
          </Text>
          <Button title="再試行" onPress={this.handleReset} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
});
```

---

## 8. Custom Hooks

### 4.1 useTasks

**責務**: タスクの状態管理とCRUD操作

```typescript
// src/hooks/useTasks.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { TaskService } from '../services/TaskService';
import { TaskWithProgram, TaskStatus } from '../types';
import { useDatabase } from '../contexts/DatabaseContext';
import { handleError } from '../utils/errorHandler';

export const useTasks = () => {
  const { db } = useDatabase();
  const [tasks, setTasks] = useState<TaskWithProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!db) return;
    
    try {
      setLoading(true);
      const data = await TaskService.getActiveTasks(db);
      setTasks(data);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const updateTaskStatus = useCallback(async (taskId: number, status: TaskStatus) => {
    if (!db) return;
    
    try {
      await TaskService.updateTaskStatus(db, taskId, status);
      
      // 完了した場合は次回タスクを生成
      if (status === 'completed') {
        const task = tasks.find(t => t.id === taskId);
        if (task && task.repeat_type === 'weekly') {
          // 前回タスクの放送日時から1週間後のタスクを生成
          await TaskService.generateNextTask(db, task.program_id, task.broadcast_datetime);
        }
      }
      
      await fetchTasks();
    } catch (err) {
      const error = err as Error;
      setError(error);
      handleError(error);
    }
  }, [db, tasks, fetchTasks]);

  const cleanupExpiredTasks = useCallback(async () => {
    if (!db) return;
    
    try {
      await TaskService.cleanupExpiredTasks(db);
      await fetchTasks();
    } catch (err) {
      const error = err as Error;
      setError(error);
      handleError(error);
    }
  }, [db, fetchTasks]);

  // タスクを期限順にソート（useMemoでメモ化）
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => 
      new Date(a.deadline_datetime).getTime() - new Date(b.deadline_datetime).getTime()
    );
  }, [tasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks: sortedTasks,
    loading,
    error,
    updateTaskStatus,
    cleanupExpiredTasks,
    refetch: fetchTasks,
  };
};
```

---

### 4.2 useProgram

**責務**: 番組の状態管理とCRUD操作

```typescript
// src/hooks/useProgram.ts
import { useState } from 'react';
import { ProgramService } from '../services/ProgramService';
import { Program, ProgramFormData } from '../types';

export const useProgram = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProgram = async (data: ProgramFormData) => {
    try {
      setLoading(true);
      const programId = await ProgramService.createProgram(data);

      // 初回タスクを生成（毎週の場合は前回放送分、単発の場合は次回放送分）
      await ProgramService.generateFirstTask(programId, data);

      setError(null);
      return programId;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProgram = async (id: number, data: ProgramFormData) => {
    try {
      setLoading(true);
      await ProgramService.updateProgram(id, data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProgram = async (id: number) => {
    try {
      setLoading(true);
      await ProgramService.deleteProgram(id);
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createProgram,
    updateProgram,
    deleteProgram,
  };
};
```

---

## 9. Services（データベース操作）

### 5.1 TaskService

**責務**: タスクのデータベース操作

```typescript
// src/services/TaskService.ts
import * as SQLite from 'expo-sqlite';
import { TaskWithProgram, TaskStatus } from '../types';
import { calculateDeadline, getNextBroadcastDatetime } from '../utils/dateUtils';

export class TaskService {
  static async getActiveTasks(db: SQLite.SQLiteDatabase): Promise<TaskWithProgram[]> {
    const result = await db.getAllAsync(`
      SELECT 
        t.*,
        p.station_name,
        p.program_name,
        p.repeat_type
      FROM tasks t
      INNER JOIN programs p ON t.program_id = p.id
      WHERE t.status != 'completed'
      ORDER BY t.deadline_datetime ASC
    `);
    return result as TaskWithProgram[];
  }

  static async getTaskById(
    db: SQLite.SQLiteDatabase,
    id: number
  ): Promise<TaskWithProgram | null> {
    const result = await db.getFirstAsync(`
      SELECT 
        t.*,
        p.station_name,
        p.program_name,
        p.repeat_type
      FROM tasks t
      INNER JOIN programs p ON t.program_id = p.id
      WHERE t.id = ?
    `, [id]);
    return result as TaskWithProgram | null;
  }

  static async updateTaskStatus(
    db: SQLite.SQLiteDatabase,
    id: number,
    status: TaskStatus
  ): Promise<void> {
    if (status === 'completed') {
      await db.runAsync(`
        UPDATE tasks 
        SET 
          status = ?,
          completed_at = datetime('now', 'localtime'),
          updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `, [status, id]);
    } else {
      await db.runAsync(`
        UPDATE tasks 
        SET 
          status = ?,
          completed_at = NULL,
          updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `, [status, id]);
    }
  }

  static async deleteTask(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  }

  static async cleanupExpiredTasks(db: SQLite.SQLiteDatabase): Promise<void> {
    // 期限切れのタスクを取得
    const expiredTasks = await db.getAllAsync(`
      SELECT t.*, p.repeat_type
      FROM tasks t
      INNER JOIN programs p ON t.program_id = p.id
      WHERE t.status != 'completed'
      AND t.deadline_datetime < datetime('now', 'localtime')
    `);

    // トランザクションで処理
    await db.withTransactionAsync(async () => {
      for (const task of expiredTasks as any[]) {
        // タスクを削除
        await db.runAsync('DELETE FROM tasks WHERE id = ?', [task.id]);
        
        // 繰り返し設定がある場合は次回タスクを生成
        if (task.repeat_type === 'weekly') {
          // 前回タスクの放送日時から1週間後のタスクを生成
          await this.generateNextTask(db, task.program_id, task.broadcast_datetime);
        }
      }
    });
  }

  static async generateNextTask(
    db: SQLite.SQLiteDatabase,
    programId: number,
    previousBroadcastDatetime: string
  ): Promise<void> {
    // 番組情報を取得（時刻情報が必要）
    const program = await db.getFirstAsync(
      'SELECT * FROM programs WHERE id = ?',
      [programId]
    ) as any;

    if (!program) return;

    // 前回放送日時から1週間後を計算
    // 理由: 期限切れタスクが残っていた場合、現在時刻から計算すると
    //       前回タスクの2週間後以降のタスクが作成されてしまうため
    const nextBroadcast = dayjs(previousBroadcastDatetime)
      .add(7, 'day')
      .format('YYYY-MM-DD HH:mm:ss');

    // 期限を計算（7日後の29時 = 翌日5時）
    const deadline = calculateDeadline(nextBroadcast, program.hour);

    // タスクを作成
    await db.runAsync(`
      INSERT INTO tasks (
        program_id,
        broadcast_datetime,
        deadline_datetime,
        status
      ) VALUES (?, ?, ?, 'unlistened')
    `, [programId, nextBroadcast, deadline]);
  }

  static async getHistory(db: SQLite.SQLiteDatabase): Promise<TaskWithProgram[]> {
    const result = await db.getAllAsync(`
      SELECT 
        t.*,
        p.station_name,
        p.program_name
      FROM tasks t
      INNER JOIN programs p ON t.program_id = p.id
      WHERE t.status = 'completed'
      AND t.completed_at >= datetime('now', 'localtime', '-1 month')
      ORDER BY t.completed_at DESC
    `);
    return result as TaskWithProgram[];
  }

  static async cleanupOldHistory(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.runAsync(`
      DELETE FROM tasks 
      WHERE status = 'completed' 
      AND completed_at < datetime('now', 'localtime', '-1 month')
    `);
  }
}
```

---

### 5.2 ProgramService

**責務**: 番組のデータベース操作

```typescript
// src/services/ProgramService.ts
import { db } from './database';
import { Program, ProgramFormData } from '../types';
import { getNextBroadcastDatetime, calculateDeadline } from '../utils/dateUtils';

export class ProgramService {
  static async createProgram(data: ProgramFormData): Promise<number> {
    const result = await db.runAsync(`
      INSERT INTO programs (
        station_name,
        program_name,
        day_of_week,
        hour,
        minute,
        repeat_type
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      data.stationName,
      data.programName,
      data.dayOfWeek,
      data.hour,
      data.minute,
      data.repeatType,
    ]);

    return result.lastInsertRowId;
  }

  static async updateProgram(id: number, data: ProgramFormData): Promise<void> {
    await db.runAsync(`
      UPDATE programs 
      SET 
        station_name = ?,
        program_name = ?,
        day_of_week = ?,
        hour = ?,
        minute = ?,
        repeat_type = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      data.stationName,
      data.programName,
      data.dayOfWeek,
      data.hour,
      data.minute,
      data.repeatType,
      id,
    ]);
  }

  static async deleteProgram(id: number): Promise<void> {
    // CASCADE設定により関連タスクも自動削除
    await db.runAsync('DELETE FROM programs WHERE id = ?', [id]);
  }

  static async getProgramById(id: number): Promise<Program | null> {
    const result = await db.getFirstAsync(
      'SELECT * FROM programs WHERE id = ?',
      [id]
    );
    return result as Program | null;
  }

  static async generateFirstTask(
    programId: number,
    programData: ProgramFormData
  ): Promise<void> {
    // 次回放送日時を計算
    let broadcast = getNextBroadcastDatetime(
      programData.dayOfWeek,
      programData.hour,
      programData.minute
    );

    // 繰り返し設定が「毎週」の場合は、前回（1週間前）の放送日時にする
    // 理由: タスク作成時には、前回放送の聴取期限がまだ来ていないため
    if (programData.repeatType === 'weekly') {
      const broadcastDayjs = dayjs(broadcast);
      broadcast = broadcastDayjs.subtract(7, 'day').format('YYYY-MM-DDTHH:mm:ss');
    }

    // 期限を計算
    const deadline = calculateDeadline(broadcast);

    // タスクを作成
    await db.runAsync(`
      INSERT INTO tasks (
        program_id,
        broadcast_datetime,
        deadline_datetime,
        status
      ) VALUES (?, ?, ?, 'unlistened')
    `, [programId, broadcast, deadline]);
  }
}
```

---

## 6. Utils（ユーティリティ関数）

### 6.1 dateUtils

**責務**: 日時計算と表示フォーマット

```typescript
// src/utils/dateUtils.ts
import dayjs from 'dayjs';
import 'dayjs/locale/ja';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ja');
dayjs.tz.setDefault('Asia/Tokyo');

/**
 * 日時をフォーマットして返す
 */
export const formatDate = (date: string, format: string): string => {
  return dayjs(date).format(format);
};

/**
 * 期限までの残り日数を計算
 */
export const calculateRemainingDays = (deadline: string): number => {
  const now = dayjs();
  const deadlineDate = dayjs(deadline);
  return Math.ceil(deadlineDate.diff(now, 'day', true));
};

/**
 * 残り日数に応じた色を返す
 */
export const getRemainingDaysColor = (days: number): string => {
  if (days <= 1) return '#F44336'; // 赤
  if (days <= 3) return '#FFC107'; // 黄
  return '#757575'; // グレー
};

/**
 * 次回放送日時を計算
 */
export const getNextBroadcastDatetime = (
  dayOfWeek: number,
  hour: number,
  minute: number
): string => {
  const now = dayjs();
  let next = dayjs()
    .day(dayOfWeek)
    .hour(hour >= 24 ? hour - 24 : hour)
    .minute(minute)
    .second(0)
    .millisecond(0);

  // 29時台の処理（翌日の早朝）
  if (hour >= 24) {
    next = next.add(1, 'day');
  }

  // 今日の該当時刻が過ぎている場合は次週
  if (next.isBefore(now)) {
    next = next.add(7, 'day');
  }

  return next.format('YYYY-MM-DDTHH:mm:ss');
};

/**
 * 期限を計算（放送日時の7日後の29時 = 8日後の5時）
 */
export const calculateDeadline = (broadcastDatetime: string): string => {
  return dayjs(broadcastDatetime)
    .add(8, 'day')
    .hour(5)
    .minute(0)
    .second(0)
    .format('YYYY-MM-DDTHH:mm:ss');
};
```

---

## 10. 型定義

### 7.1 types/index.ts

```typescript
// src/types/index.ts

export type TaskStatus = 'unlistened' | 'listening' | 'completed';

export type RepeatType = 'none' | 'weekly';

export interface Program {
  id: number;
  station_name: string;
  program_name: string;
  day_of_week: number;
  hour: number;
  minute: number;
  repeat_type: RepeatType;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  program_id: number;
  broadcast_datetime: string;
  deadline_datetime: string;
  status: TaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithProgram extends Task {
  station_name: string;
  program_name: string;
  repeat_type: RepeatType;
}

export interface ProgramFormData {
  stationName: string;
  programName: string;
  dayOfWeek: number;
  hour: number;
  minute: number;
  repeatType: RepeatType;
}
```

---

## 11. App.tsx（エントリーポイント）

**責務**: アプリケーションのルート設定

```typescript
// src/App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { AppNavigator } from './navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <DatabaseProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </DatabaseProvider>
    </ErrorBoundary>
  );
};

export default App;
```

---

## 12. テスト戦略

### 8.1 ユニットテスト

**対象**
- Utils（dateUtils）
- Services（TaskService, ProgramService）

**ツール**
- Jest
- React Native Testing Library

**例**
```typescript
// src/utils/__tests__/dateUtils.test.ts
import { calculateRemainingDays, getNextBroadcastDatetime } from '../dateUtils';

describe('dateUtils', () => {
  describe('calculateRemainingDays', () => {
    it('正しく残り日数を計算する', () => {
      const deadline = '2024-12-12T05:00:00';
      const days = calculateRemainingDays(deadline);
      expect(days).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getNextBroadcastDatetime', () => {
    it('次回放送日時を正しく計算する', () => {
      const result = getNextBroadcastDatetime(4, 18, 0); // 木曜18時
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T18:00:00$/);
    });
  });
});
```

### 8.2 コンポーネントテスト

**対象**
- Atoms
- Molecules

**例**
```typescript
// src/components/atoms/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('正しくレンダリングされる', () => {
    const { getByText } = render(
      <Button title="テスト" onPress={() => {}} />
    );
    expect(getByText('テスト')).toBeTruthy();
  });

  it('クリック時にonPressが呼ばれる', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button title="テスト" onPress={onPress} />
    );
    fireEvent.press(getByText('テスト'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

---

## 13. パフォーマンス最適化

### 9.1 メモ化

```typescript
// useMemoでの最適化例
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => 
    new Date(a.deadline_datetime).getTime() - 
    new Date(b.deadline_datetime).getTime()
  );
}, [tasks]);
```

### 9.2 リスト最適化

```typescript
// FlatListの最適化
<FlatList
  data={tasks}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  windowSize={10}
/>
```

---

## 14. 今後の拡張性

### 14.1 追加予定のコンポーネント

- SearchBar（検索機能用）
- FilterChips（フィルター機能用）
- StatisticsCard（統計表示用）
- OnboardingSlide（オンボーディング用）

### 14.2 Context拡張

- ThemeContext（ダークモード対応）
- NotificationContext（通知管理）

---

## 15. 改善されたディレクトリ構成

```
src/
├── assets/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Text.tsx
│   │   └── Icon.tsx
│   ├── molecules/
│   │   ├── StatusIndicator.tsx
│   │   ├── DeadlineInfo.tsx
│   │   ├── TimePickerField.tsx
│   │   ├── RadioButtonGroup.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSpinner.tsx
│   ├── organisms/
│   │   ├── TaskCard.tsx
│   │   ├── ProgramForm.tsx
│   │   ├── DeleteConfirmDialog.tsx
│   │   ├── TaskDetailView.tsx
│   │   └── HistoryCard.tsx
│   └── ErrorBoundary.tsx
├── screens/
│   ├── TaskListScreen.tsx
│   ├── ProgramFormScreen.tsx
│   ├── TaskDetailScreen.tsx
│   └── HistoryScreen.tsx
├── hooks/
│   ├── useTasks.ts
│   └── useProgram.ts
├── contexts/
│   └── DatabaseContext.tsx
├── services/
│   ├── TaskService.ts
│   ├── ProgramService.ts
│   └── database.ts
├── utils/
│   ├── dateUtils.ts
│   └── errorHandler.ts
├── types/
│   └── index.ts
├── constants/
│   └── index.ts
├── theme/
│   └── index.ts
├── navigation/
│   └── AppNavigator.tsx
└── App.tsx
```

---

以上がコンポーネント設計書です。この設計に基づいて実装を進めてください。
