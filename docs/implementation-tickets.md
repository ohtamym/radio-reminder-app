# 実装チケット一覧

## プロジェクト概要

ラジオ番組聞き逃し防止アプリ（Phase 1: MVP）の実装タスク一覧

**現在のステータス**: 空の React Native プロジェクト作成完了

---

## チケット分類

- 🟦 **Setup**: プロジェクトセットアップ・環境構築
- 🟩 **Foundation**: 基盤コード（型定義、テーマ、ユーティリティ）
- 🟨 **Database**: データベース関連
- 🟧 **Component**: UI コンポーネント
- 🟪 **Screen**: 画面実装
- 🟥 **Feature**: 機能実装
- ⬜ **Test**: テスト
- 🟫 **Documentation**: ドキュメント

---

## Phase 1: セットアップ・基盤構築

### 🟦 RADIO-001: 必要なパッケージのインストール

**優先度**: 🔴 High
**見積もり**: 0.5h
**依存**: なし

**タスク内容**:

```bash
# 必須パッケージ
npm install expo-sqlite
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install dayjs
npm install @react-native-picker/picker

# 開発用パッケージ
npm install --save-dev @types/react @types/react-native
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

**完了条件**:

- [x] すべてのパッケージがインストールされている
- [x] package.json に正しく記録されている
- [x] アプリが起動することを確認

---

### 🟦 RADIO-002: ディレクトリ構造の作成

**優先度**: 🔴 High
**見積もり**: 0.5h
**依存**: RADIO-001

**タスク内容**:

以下のディレクトリ構造を作成：

```
src/
├── components/
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── screens/
├── hooks/
├── contexts/
├── services/
├── utils/
├── types/
├── constants/
├── theme/
└── navigation/
```

**完了条件**:

- [x] すべてのディレクトリが作成されている
- [x] 各ディレクトリに `.gitkeep` または `index.ts` が配置されている

---

### 🟩 RADIO-003: TypeScript 型定義の作成

**優先度**: 🔴 High
**見積もり**: 1h
**依存**: RADIO-002

**ファイル**: `src/types/index.ts`

**タスク内容**:

- TaskStatus 型の定義
- RepeatType 型の定義
- Program 型の定義
- Task 型の定義
- TaskWithProgram 型の定義
- ProgramFormData 型の定義

**参考**: docs/radio-reminder-app-database-design.md

**完了条件**:

- [x] すべての型定義が作成されている
- [x] エクスポートが正しく設定されている
- [x] コンパイルエラーがない

---

### 🟩 RADIO-004: テーマ設定の作成

**優先度**: 🔴 High
**見積もり**: 1h
**依存**: RADIO-002

**ファイル**:

- `src/theme/colors.ts`
- `src/theme/typography.ts`
- `src/theme/spacing.ts`
- `src/theme/index.ts`

**タスク内容**:

- カラーパレットの定義
- タイポグラフィの定義
- スペーシングの定義
- ボーダー半径、シャドウの定義

**参考**: docs/radio-reminder-app-screen-design.md（3. 共通 UI 仕様）

**完了条件**:

- [x] すべてのテーマファイルが作成されている
- [x] 画面設計書のカラーパレットと一致している
- [x] 型定義が適切に設定されている

---

### 🟩 RADIO-005: 定数定義の作成

**優先度**: 🔴 High
**見積もり**: 0.5h
**依存**: RADIO-002

**ファイル**: `src/constants/index.ts`

**タスク内容**:

- HOURS 配列（5-29）
- MINUTES 配列（0, 15, 30, 45）
- DAY_OF_WEEK_OPTIONS
- REPEAT_TYPE_OPTIONS
- STATUS_CONFIG（絵文字、色、ラベル）
- DEADLINE_COLORS

**参考**: docs/radio-reminder-app-requirements.md

**完了条件**:

- [x] すべての定数が定義されている
- [x] 要件定義書の仕様と一致している
- [x] エクスポートが正しく設定されている

---

### 🟩 RADIO-006: ユーティリティ関数の作成（dateUtils）

**優先度**: 🔴 High
**見積もり**: 2h
**依存**: RADIO-001, RADIO-002

**ファイル**: `src/utils/dateUtils.ts`

**タスク内容**:

- formatDate 関数（日時フォーマット）
- calculateRemainingDays 関数（残り日数計算）
- getRemainingDaysColor 関数（残り日数に応じた色）
- getNextBroadcastDatetime 関数（次回放送日時計算）
- calculateDeadline 関数（期限計算）
- dayjs 設定（タイムゾーン: Asia/Tokyo）

**注意事項**:

- 29 時台の処理を正しく実装すること
- ISO8601 形式で返すこと

**参考**: docs/radio-reminder-app-component-design.md（6.1 dateUtils）

**完了条件**:

- [x] すべての関数が実装されている
- [x] 29 時台の処理が正しく動作する
- [x] dayjs の設定が正しい
- [ ] ユニットテストを作成する（後のチケットで実施）

---

### 🟩 RADIO-007: エラーハンドリングユーティリティの作成

**優先度**: 🟡 Medium
**見積もり**: 1h
**依存**: RADIO-002

**ファイル**: `src/utils/errorHandler.ts`

**タスク内容**:

- AppError クラスの作成
- handleError 関数の実装
- logError 関数の実装

**参考**: docs/radio-reminder-app-component-design.md（7.1 errorHandler）

**完了条件**:

- [x] AppError クラスが実装されている
- [x] handleError 関数が Alert を表示する
- [x] エラーログが出力される

---

### 🟩 RADIO-008: ErrorBoundary コンポーネントの作成

**優先度**: 🟡 Medium
**見積もり**: 1h
**依存**: RADIO-002, RADIO-007

**ファイル**: `src/components/ErrorBoundary.tsx`

**タスク内容**:

- クラスコンポーネントとして ErrorBoundary を実装
- エラー発生時のフォールバック UI
- 再試行機能

**参考**: docs/radio-reminder-app-component-design.md（7.2 ErrorBoundary）

**完了条件**:

- [x] ErrorBoundary が実装されている
- [x] エラーをキャッチして表示する
- [x] 再試行ボタンが動作する

---

## Phase 2: データベース層

### 🟨 RADIO-009: データベース初期化スクリプトの作成

**優先度**: 🔴 High
**見積もり**: 2h
**依存**: RADIO-001, RADIO-002, RADIO-003

**ファイル**: `src/services/database.ts`

**タスク内容**:

- データベース接続の確立
- programs テーブルの CREATE TABLE 文
- tasks テーブルの CREATE TABLE 文
- インデックスの作成
- トリガーの作成（updated_at 自動更新）
- initializeTables 関数の実装

**参考**: docs/radio-reminder-app-database-design.md（16. データベース初期化スクリプト）

**完了条件**:

- [x] データベースが正しく初期化される
- [x] すべてのテーブルが作成される
- [x] インデックスが作成される
- [x] トリガーが作成される

---

### 🟨 RADIO-010: DatabaseContext の作成

**優先度**: 🔴 High
**見積もり**: 1.5h
**依存**: RADIO-009

**ファイル**: `src/contexts/DatabaseContext.tsx`

**タスク内容**:

- DatabaseContext の作成
- DatabaseProvider の実装
- useDatabase hook の実装
- データベース初期化処理
- ローディング状態の管理

**参考**: docs/radio-reminder-app-component-design.md（6.1 DatabaseContext）

**完了条件**:

- [x] DatabaseContext が実装されている
- [x] DatabaseProvider でラップできる
- [x] useDatabase フックが動作する
- [x] データベースが初期化される

---

### 🟨 RADIO-011: ProgramService の作成

**優先度**: 🔴 High
**見積もり**: 3h
**依存**: RADIO-009, RADIO-003

**ファイル**: `src/services/ProgramService.ts`

**タスク内容**:

- createProgram（番組作成）
- updateProgram（番組更新）
- deleteProgram（番組削除）
- getProgramById（番組取得）
- generateFirstTask（初回タスク生成）

**参考**: docs/radio-reminder-app-component-design.md（5.2 ProgramService）

**完了条件**:

- [x] すべてのメソッドが実装されている
- [x] パラメータ化クエリを使用している
- [x] エラーハンドリングが実装されている
- [x] TypeScript 型定義が正しい

---

### 🟨 RADIO-012: TaskService の作成

**優先度**: 🔴 High
**見積もり**: 4h
**依存**: RADIO-009, RADIO-003

**ファイル**: `src/services/TaskService.ts`

**タスク内容**:

- getActiveTasks（アクティブタスク取得）
- getTaskById（タスク取得）
- updateTaskStatus（ステータス更新）
- deleteTask（タスク削除）
- cleanupExpiredTasks（期限切れタスク削除）
- generateNextTask（次回タスク生成）
- getHistory（履歴取得）
- cleanupOldHistory（古い履歴削除）

**参考**: docs/radio-reminder-app-component-design.md（5.1 TaskService）

**完了条件**:

- [x] すべてのメソッドが実装されている
- [x] JOIN 文が正しく動作する
- [x] トランザクション処理が適切
- [x] 期限切れタスクの処理が正しい

---

## Phase 3: カスタムフック

### 🟧 RADIO-013: useTasks フックの作成

**優先度**: 🔴 High
**見積もり**: 2.5h
**依存**: RADIO-010, RADIO-012, RADIO-007

**ファイル**: `src/hooks/useTasks.ts`

**タスク内容**:

- タスク一覧の取得
- ステータス更新処理
- 期限切れタスクのクリーンアップ
- 次回タスクの自動生成
- ローディング状態の管理
- エラーハンドリング
- useMemo でソート最適化

**参考**: docs/radio-reminder-app-component-design.md（4.1 useTasks）

**完了条件**:

- [x] タスク取得が動作する
- [x] ステータス更新が動作する
- [x] 完了時に次回タスクが生成される
- [x] 期限順にソートされる
- [x] エラーハンドリングが実装されている

---

### 🟧 RADIO-014: useProgram フックの作成

**優先度**: 🔴 High
**見積もり**: 1.5h
**依存**: RADIO-010, RADIO-011, RADIO-007

**ファイル**: `src/hooks/useProgram.ts`

**タスク内容**:

- 番組作成処理
- 番組更新処理
- 番組削除処理
- ローディング状態の管理
- エラーハンドリング

**参考**: docs/radio-reminder-app-component-design.md（4.2 useProgram）

**完了条件**:

- [x] 番組作成が動作する
- [x] 番組更新が動作する
- [x] 番組削除が動作する
- [x] エラーハンドリングが実装されている

---

## Phase 4: Atoms コンポーネント

### 🟧 RADIO-015: Button コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 1.5h
**依存**: RADIO-004

**ファイル**: `src/components/atoms/Button.tsx`

**タスク内容**:

- プライマリー、セカンダリー、デンジャーの 3 種類のバリアント
- disabled 状態
- fullWidth 対応
- アクセシビリティ対応

**参考**: docs/radio-reminder-app-component-design.md（3.1.1 Button）

**完了条件**:

- [x] 3 種類のバリアントが実装されている
- [x] テーマの色を使用している
- [x] React.memo を使用している
- [x] TypeScript 型定義が正しい

---

### 🟧 RADIO-016: Badge コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 1h
**依存**: RADIO-004, RADIO-005

**ファイル**: `src/components/atoms/Badge.tsx`

**タスク内容**:

- ステータスバッジ（unlistened、listening、completed）
- 絵文字表示
- 色の変更

**参考**: docs/radio-reminder-app-component-design.md（3.1.2 Badge）

**完了条件**:

- [x] 3 種類のステータスが表示できる
- [x] STATUS_CONFIG を使用している
- [x] React.memo を使用している

---

### 🟧 RADIO-017: Input/Text コンポーネントの作成

**優先度**: 🟡 Medium
**見積もり**: 1h
**依存**: RADIO-004

**ファイル**:

- `src/components/atoms/Input.tsx`
- `src/components/atoms/Text.tsx`

**タスク内容**:

- テキスト入力コンポーネント
- エラー表示対応
- 汎用テキストコンポーネント

**完了条件**:

- [x] 入力が正しく動作する
- [x] エラーメッセージが表示される
- [x] テーマの色を使用している

---

## Phase 5: Molecules コンポーネント

### 🟧 RADIO-018: StatusIndicator コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 1.5h
**依存**: RADIO-015, RADIO-016

**ファイル**: `src/components/molecules/StatusIndicator.tsx`

**タスク内容**:

- ステータスバッジ表示
- ステータス変更ボタン
- 状態に応じたボタン表示切り替え

**参考**: docs/radio-reminder-app-component-design.md（3.2.1 StatusIndicator）

**完了条件**:

- [x] ステータスバッジが表示される
- [x] ボタンが状態に応じて変わる
- [x] コールバックが正しく動作する

---

### 🟧 RADIO-019: DeadlineInfo コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 1.5h
**依存**: RADIO-006, RADIO-017

**ファイル**: `src/components/molecules/DeadlineInfo.tsx`

**タスク内容**:

- 放送日時の表示
- 期限日時の表示
- 残り日数の表示
- 色分け（残り日数に応じて）

**参考**: docs/radio-reminder-app-component-design.md（3.2.2 DeadlineInfo）

**完了条件**:

- [x] 日時が正しくフォーマットされる
- [x] 残り日数が計算される
- [x] 色分けが正しく動作する

---

### 🟧 RADIO-020: LoadingSpinner コンポーネントの作成

**優先度**: 🟡 Medium
**見積もり**: 0.5h
**依存**: RADIO-004, RADIO-017

**ファイル**: `src/components/molecules/LoadingSpinner.tsx`

**タスク内容**:

- ActivityIndicator を使用
- メッセージ表示対応
- サイズ変更対応

**参考**: docs/radio-reminder-app-component-design.md（3.2.3 LoadingSpinner）

**完了条件**:

- [x] ローディングが表示される
- [x] メッセージが表示される
- [x] React.memo を使用している

---

### 🟧 RADIO-021: EmptyState コンポーネントの作成

**優先度**: 🟡 Medium
**見積もり**: 0.5h
**依存**: RADIO-004, RADIO-017

**ファイル**: `src/components/molecules/EmptyState.tsx`

**タスク内容**:

- アイコン表示
- メッセージ表示
- サブメッセージ表示

**完了条件**:

- [x] 空状態が表示される
- [x] カスタマイズ可能
- [x] テーマの色を使用している

---

### 🟧 RADIO-022: TimePickerField コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 2h
**依存**: RADIO-005, RADIO-017

**ファイル**: `src/components/molecules/TimePickerField.tsx`

**タスク内容**:

- 時のピッカー（5-29）
- 分のピッカー（0, 15, 30, 45）
- ラベル表示
- コロン（:）の区切り

**参考**: docs/radio-reminder-app-component-design.md（3.2.4 TimePickerField）

**完了条件**:

- [x] 時・分が選択できる
- [x] HOURS/MINUTES 定数を使用
- [x] React.memo を使用している

---

### 🟧 RADIO-023: RadioButtonGroup コンポーネントの作成

**優先度**: 🟡 Medium
**見積もり**: 1.5h
**依存**: RADIO-004, RADIO-017

**ファイル**: `src/components/molecules/RadioButtonGroup.tsx`

**タスク内容**:

- ラジオボタングループ
- 選択状態の管理
- ラベル表示

**完了条件**:

- [x] ラジオボタンが動作する
- [x] 選択状態が保持される
- [x] アクセシビリティ対応

---

## Phase 6: Organisms コンポーネント

### 🟧 RADIO-024: TaskCard コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 3h
**依存**: RADIO-015, RADIO-016, RADIO-018, RADIO-019

**ファイル**: `src/components/organisms/TaskCard.tsx`

**タスク内容**:

- タスク情報の表示
- ステータスバッジ
- 期限情報
- ステータス変更ボタン
- カードタップ処理
- パフォーマンス最適化（React.memo with custom comparison）

**参考**: docs/radio-reminder-app-component-design.md（3.3.1 TaskCard）

**完了条件**:

- [x] すべての情報が表示される
- [x] ステータス変更が動作する
- [x] カスタム比較関数が実装されている
- [x] 期限の色分けが正しい

---

### 🟧 RADIO-025: ProgramForm コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 4h
**依存**: RADIO-015, RADIO-017, RADIO-022, RADIO-023

**ファイル**: `src/components/organisms/ProgramForm.tsx`

**タスク内容**:

- 放送局名入力
- 番組名入力
- 放送曜日選択
- 放送時刻選択（TimePickerField 使用）
- 繰り返し設定（RadioButtonGroup 使用）
- バリデーション
- エラー表示

**参考**: docs/radio-reminder-app-component-design.md（3.3.2 ProgramForm）

**完了条件**:

- [x] すべてのフィールドが動作する
- [x] バリデーションが動作する
- [x] エラーメッセージが表示される
- [x] React.memo を使用している

---

### 🟧 RADIO-026: DeleteConfirmDialog コンポーネントの作成

**優先度**: 🔴 High
**見積もり**: 2h
**依存**: RADIO-015

**ファイル**: `src/components/organisms/DeleteConfirmDialog.tsx`

**タスク内容**:

- モーダルダイアログ
- 繰り返し設定の判定
- 「この回だけ削除」ボタン
- 「繰り返し設定ごと削除」ボタン
- キャンセルボタン

**参考**: docs/radio-reminder-app-component-design.md（3.3.3 DeleteConfirmDialog）

**完了条件**:

- [x] モーダルが表示される
- [x] 繰り返し設定に応じて選択肢が変わる
- [x] 各ボタンのコールバックが動作する

---

### 🟧 RADIO-027: TaskDetailView コンポーネントの作成

**優先度**: 🟡 Medium
**見積もり**: 2h
**依存**: RADIO-018, RADIO-019

**ファイル**: `src/components/organisms/TaskDetailView.tsx`

**タスク内容**:

- タスク詳細情報の表示
- ステータスインジケーター
- 期限情報

**完了条件**:

- [x] すべての情報が表示される
- [x] レイアウトが設計書通り

---

### 🟧 RADIO-028: HistoryCard コンポーネントの作成

**優先度**: 🟡 Medium
**見積もり**: 1.5h
**依存**: RADIO-016, RADIO-017

**ファイル**: `src/components/organisms/HistoryCard.tsx`

**タスク内容**:

- 履歴情報の表示
- 完了マーク
- 放送日時、聴取日時の表示

**完了条件**:

- [x] 履歴情報が表示される
- [x] レイアウトが設計書通り
- [x] React.memo を使用している

---

## Phase 7: 画面実装

### 🟪 RADIO-029: TaskListScreen の作成

**優先度**: 🔴 High
**見積もり**: 4h
**依存**: RADIO-013, RADIO-020, RADIO-021, RADIO-024

**ファイル**: `src/screens/TaskListScreen.tsx`

**タスク内容**:

- FlatList でタスク一覧表示
- 期限切れタスクのクリーンアップ（useEffect）
- ステータス変更処理
- プルツーリフレッシュ
- 空状態の表示
- ローディング表示
- パフォーマンス最適化

**参考**: docs/radio-reminder-app-component-design.md（3.4.1 TaskListScreen）

**完了条件**:

- [x] タスク一覧が表示される
- [x] ステータス変更が動作する
- [x] 期限切れタスクが削除される
- [x] FlatList が最適化されている
- [x] useCallback でメモ化されている

---

### 🟪 RADIO-030: ProgramFormScreen の作成

**優先度**: 🔴 High
**見積もり**: 2.5h
**依存**: RADIO-014, RADIO-025

**ファイル**: `src/screens/ProgramFormScreen.tsx`

**タスク内容**:

- ProgramForm コンポーネントの配置
- 新規登録処理
- 編集処理の分岐
- ナビゲーション処理
- エラーハンドリング

**完了条件**:

- [x] 新規登録が動作する
- [x] 編集が動作する
- [x] 保存後に一覧に戻る
- [x] エラーハンドリングが実装されている

---

### 🟪 RADIO-031: TaskDetailScreen の作成

**優先度**: 🔴 High
**見積もり**: 3h
**依存**: RADIO-013, RADIO-014, RADIO-026, RADIO-027

**ファイル**: `src/screens/TaskDetailScreen.tsx`

**タスク内容**:

- タスク詳細の表示
- ステータス変更（ラジオボタン）
- 編集ボタン（番組編集画面へ）
- 削除ボタン（削除確認ダイアログ）
- 削除処理（単発・繰り返し）

**参考**: docs/radio-reminder-app-screen-design.md（SC04）

**完了条件**:

- [x] タスク詳細が表示される
- [x] ステータス変更が即座に反映される
- [x] 編集画面に遷移する
- [x] 削除処理が正しく動作する

---

### 🟪 RADIO-032: HistoryScreen の作成

**優先度**: 🟡 Medium
**見積もり**: 2h
**依存**: RADIO-012, RADIO-020, RADIO-021, RADIO-028

**ファイル**: `src/screens/HistoryScreen.tsx`

**タスク内容**:

- FlatList で履歴一覧表示
- 完了日時の降順ソート
- 空状態の表示
- ローディング表示

**参考**: docs/radio-reminder-app-screen-design.md（SC06）

**完了条件**:

- [x] 履歴一覧が表示される
- [x] 完了日時の降順でソートされる
- [x] 空状態が表示される

---

## Phase 8: ナビゲーション

### 🟥 RADIO-033: ナビゲーション設定の作成

**優先度**: 🔴 High
**見積もり**: 2h
**依存**: RADIO-029, RADIO-030, RADIO-031, RADIO-032

**ファイル**:

- `src/navigation/types.ts`
- `src/navigation/AppNavigator.tsx`

**タスク内容**:

- ナビゲーションスタックの型定義
- NativeStackNavigator の設定
- 画面の登録
- ヘッダースタイルの設定
- 初期画面の設定

**参考**: docs/radio-reminder-app-screen-design.md（1.2 画面遷移図）

**完了条件**:

- [x] すべての画面が登録されている
- [x] 画面遷移が動作する
- [x] 型定義が正しい
- [x] ヘッダーが設定されている

---

### 🟥 RADIO-034: App.tsx の統合

**優先度**: 🔴 High
**見積もり**: 1h
**依存**: RADIO-008, RADIO-010, RADIO-033

**ファイル**: `App.tsx`

**タスク内容**:

- ErrorBoundary でラップ
- DatabaseProvider でラップ
- NavigationContainer でラップ
- AppNavigator の配置

**参考**: docs/radio-reminder-app-component-design.md（11. App.tsx）

**完了条件**:

- [x] すべての Provider が正しく配置されている
- [x] アプリが起動する
- [x] ナビゲーションが動作する
- [x] データベースが初期化される

---

## Phase 9: 通知機能

### 🟥 RADIO-035: 通知パーミッションの設定

**優先度**: 🟡 Medium
**見積もり**: 2h
**依存**: RADIO-001

**タスク内容**:

- expo-notifications のインストール
- 通知パーミッションの要求
- app.json の設定

**完了条件**:

- [ ] expo-notifications がインストールされている
- [ ] パーミッションが要求される
- [ ] 通知が許可される

---

### 🟥 RADIO-036: リマインダー通知の実装

**優先度**: 🟡 Medium
**見積もり**: 3h
**依存**: RADIO-035, RADIO-012

**ファイル**: `src/services/NotificationService.ts`

**タスク内容**:

- 通知のスケジュール設定
- 通知内容の作成
- 期限 1 日前 18 時の計算
- 通知のキャンセル処理

**参考**: docs/radio-reminder-app-requirements.md（3.1.3 通知機能）

**完了条件**:

- [ ] 通知がスケジュールされる
- [ ] 通知内容が正しい
- [ ] タイミングが正確
- [ ] キャンセルが動作する

---

## Phase 10: テスト

### ⬜ RADIO-037: dateUtils のユニットテスト

**優先度**: 🟡 Medium
**見積もり**: 2h
**依存**: RADIO-006

**ファイル**: `src/utils/__tests__/dateUtils.test.ts`

**タスク内容**:

- calculateRemainingDays のテスト
- getNextBroadcastDatetime のテスト
- calculateDeadline のテスト
- 29 時台の処理のテスト

**完了条件**:

- [ ] すべての関数にテストがある
- [ ] エッジケースがカバーされている
- [ ] カバレッジ 80%以上

---

### ⬜ RADIO-038: TaskService のユニットテスト

**優先度**: 🟡 Medium
**見積もり**: 3h
**依存**: RADIO-012

**ファイル**: `src/services/__tests__/TaskService.test.ts`

**タスク内容**:

- 各メソッドのテスト
- データベースのモック
- エラーハンドリングのテスト

**完了条件**:

- [ ] すべてのメソッドにテストがある
- [ ] カバレッジ 70%以上

---

### ⬜ RADIO-039: コンポーネントのテスト

**優先度**: 🟢 Low
**見積もり**: 4h
**依存**: RADIO-015, RADIO-016, RADIO-017

**ファイル**: 各コンポーネントの`__tests__`フォルダ

**タスク内容**:

- Button コンポーネントのテスト
- Badge コンポーネントのテスト
- その他 Atoms のテスト

**完了条件**:

- [ ] 主要コンポーネントにテストがある
- [ ] レンダリングが確認できる
- [ ] インタラクションが確認できる

---

## Phase 11: 最終調整

### 🟫 RADIO-040: エラーハンドリングの統合テスト

**優先度**: 🟡 Medium
**見積もり**: 2h
**依存**: RADIO-034

**タスク内容**:

- データベースエラーのテスト
- ネットワークエラーのテスト
- バリデーションエラーのテスト
- ErrorBoundary のテスト

**完了条件**:

- [ ] すべてのエラーが適切に処理される
- [ ] ユーザーにわかりやすいメッセージが表示される

---

### 🟫 RADIO-041: パフォーマンス最適化の確認

**優先度**: 🟡 Medium
**見積もり**: 2h
**依存**: RADIO-034

**タスク内容**:

- React DevTools での確認
- 不要な再レンダリングの検出
- FlatList のパフォーマンス確認
- メモ化の確認

**完了条件**:

- [ ] 不要な再レンダリングがない
- [ ] FlatList がスムーズにスクロールする
- [ ] 操作が 500ms 以内に完了する

---

### 🟫 RADIO-042: UI の最終調整

**優先度**: 🟡 Medium
**見積もり**: 3h
**依存**: RADIO-034

**タスク内容**:

- デザインの微調整
- 色の確認
- フォントサイズの確認
- スペーシングの確認
- アニメーションの調整

**参考**: docs/radio-reminder-app-screen-design.md（3. 共通 UI 仕様）

**完了条件**:

- [ ] 画面設計書と一致している
- [ ] 各プラットフォームで正しく表示される
- [ ] アクセシビリティが確保されている

---

### 🟫 RADIO-043: ドキュメントの更新

**優先度**: 🟢 Low
**見積もり**: 1h
**依存**: RADIO-042

**タスク内容**:

- README.md の更新
- セットアップ手順の記載
- 既知の問題の記載
- 今後の拡張機能の記載

**完了条件**:

- [ ] README.md が最新
- [ ] セットアップ手順が明確
- [ ] スクリーンショットが追加されている（任意）

---

## チケット進捗管理

### ステータス

- ⬜ 未着手
- 🟦 進行中
- ✅ 完了
- ⏸️ 保留
- ❌ ブロック

### 優先度

- 🔴 High: Phase 1 で必須
- 🟡 Medium: Phase 1 で推奨
- 🟢 Low: Phase 2 以降でも可

---

## 見積もり合計

- **Setup・基盤**: 約 13.5 時間
- **データベース層**: 約 10.5 時間
- **カスタムフック**: 約 4 時間
- **Atoms**: 約 3.5 時間
- **Molecules**: 約 7 時間
- **Organisms**: 約 12.5 時間
- **画面実装**: 約 11.5 時間
- **ナビゲーション**: 約 3 時間
- **通知機能**: 約 5 時間
- **テスト**: 約 9 時間
- **最終調整**: 約 8 時間

**総見積もり**: 約 87.5 時間（約 11 日間、1 日 8 時間換算）

---

## 注意事項

1. **依存関係を守る**: チケット番号の順序で実装を進めることを推奨
2. **テスト駆動**: 可能な限りテストを先に書く
3. **コミット粒度**: 各チケット完了時にコミットする
4. **レビュー**: 主要な機能は実装後にセルフレビューを実施
5. **ドキュメント参照**: 実装時は必ず設計書を参照する
6. **ベストプラクティス準拠**: react-native-best-practices-2025.md に従う
7. **例外の記載**: ベストプラクティスから外れる場合はコメントで理由を記載

---

**最終更新**: 2025-12-04
**作成者**: Claude Code
