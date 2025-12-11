# ラジオ番組聞き逃し防止アプリ

radikoのタイムフリー機能を活用し、聴きたいラジオ番組の聞き逃しを防ぐためのタスク管理アプリです。

## 📻 概要

このアプリは、radikoのタイムフリー機能（放送後7日間視聴可能）に対応したラジオ番組の聴取管理アプリです。番組を登録すると自動的にタスクが生成され、聴取期限までリマインダー通知を受け取ることができます。

### 主な特徴

- 📅 **自動タスク生成**: 番組登録時に聴取タスクを自動生成
- 🔔 **リマインダー通知**: 期限の1日前18時に通知
- 🔄 **繰り返し設定**: 毎週放送の番組に対応した自動タスク生成
- ⏰ **29時間制対応**: 深夜放送（25時〜29時）の時刻表記に対応
- 🗑️ **自動クリーンアップ**: 期限切れタスクを自動削除

## 🚀 機能

### Phase 1 (MVP) - 実装済み

- ✅ 番組マスタ管理（登録・編集・削除）
- ✅ タスク自動生成・管理
- ✅ ステータス管理（未聴取・聴取中・聴取済み）
- ✅ 期限切れタスクの自動削除
- ✅ リマインダー通知機能
- ✅ 聴取履歴の表示
- ✅ 繰り返し設定（単発・毎週）

### 今後の拡張予定（Phase 2以降）

- radiko API連携（番組情報の自動取得）
- 検索・フィルタ機能
- 統計とデータビジュアライゼーション
- 通知カスタマイズ機能
- バックアップ・同期機能
- ダークモード対応

## 🛠️ 技術スタック

- **フレームワーク**: React Native (v0.81.5)
- **開発環境**: Expo SDK (~54.0.25)
- **言語**: TypeScript (~5.9.2)
- **データベース**: expo-sqlite
- **ナビゲーション**: React Navigation
- **日時処理**: Day.js
- **通知**: expo-notifications

## 📋 必要要件

- Node.js 18.x以上
- npm または yarn
- Expo CLI
- iOS Simulator（macOS）または Android Emulator

## 🔧 セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/radio-reminder-app.git
cd radio-reminder-app
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. アプリの起動

```bash
# 開発サーバーの起動
npm start

# iOS Simulatorで起動
npm run ios

# Android Emulatorで起動
npm run android

# Webブラウザで起動
npm run web
```

## 📱 使い方

### 番組の登録

1. 「＋」ボタンをタップ
2. 放送局名、番組名、放送曜日、放送時刻を入力
3. 繰り返し設定を選択（単発 or 毎週）
4. 「保存」をタップ

### タスクの管理

- **未聴取 → 聴取中**: タスクカードの「聴取開始」ボタンをタップ
- **聴取中 → 聴取済み**: タスクカードの「完了」ボタンをタップ
- **タスク詳細表示**: タスクカードをタップ
- **タスク削除**: タスク詳細画面の「削除」ボタン

### 通知について

- 聴取期限の**1日前18時**に自動的に通知が届きます
- 通知には番組名、放送局名、残り時間が表示されます
- タスク完了または削除時に通知は自動的にキャンセルされます

## 📂 プロジェクト構成

```
src/
├── components/       # UIコンポーネント（Atomic Design）
│   ├── atoms/       # 基本要素（Button, Badge, Input等）
│   ├── molecules/   # 複合要素（StatusIndicator, TimePickerField等）
│   └── organisms/   # 複雑なコンポーネント（TaskCard, ProgramForm等）
├── screens/         # 画面コンポーネント
│   ├── TaskListScreen.tsx
│   ├── ProgramFormScreen.tsx
│   ├── TaskDetailScreen.tsx
│   └── HistoryScreen.tsx
├── hooks/           # カスタムフック
│   ├── useTasks.ts
│   └── useProgram.ts
├── contexts/        # Context API
│   └── DatabaseContext.tsx
├── services/        # ビジネスロジック
│   ├── database.ts
│   ├── TaskService.ts
│   ├── ProgramService.ts
│   └── NotificationService.ts
├── utils/           # ユーティリティ関数
│   ├── dateUtils.ts
│   └── errorHandler.ts
├── types/           # TypeScript型定義
│   └── index.ts
├── constants/       # 定数
│   └── index.ts
├── theme/           # テーマ設定
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
└── navigation/      # ナビゲーション設定
    ├── types.ts
    └── AppNavigator.tsx
```

## 🏗️ アーキテクチャ

### デザインパターン

- **Component-Based Architecture**: 責任の明確な分離
- **Atomic Design**: 再利用可能なコンポーネント設計
- **Custom Hooks**: ビジネスロジックのカプセル化
- **Service Layer**: データベース操作の抽象化

### データベース設計

#### programsテーブル
```sql
id              INTEGER PRIMARY KEY
station_name    TEXT NOT NULL
program_name    TEXT NOT NULL
day_of_week     INTEGER (0-6)
hour            INTEGER (5-29)
minute          INTEGER (0,15,30,45)
repeat_type     TEXT ('none', 'weekly')
```

#### tasksテーブル
```sql
id                 INTEGER PRIMARY KEY
program_id         INTEGER (FK)
broadcast_datetime TEXT
deadline_datetime  TEXT
status             TEXT ('unlistened', 'listening', 'completed')
completed_at       TEXT
```

### 重要な仕様

#### 期限計算
- 聴取期限 = 放送日時 + 8日後の5:00
- radikoのタイムフリー期限（放送後7日 + 29時間）に対応

#### タスク自動生成
- **単発番組**: 次回放送日時のタスクを1件生成
- **毎週番組（初回）**: 前回（1週間前）放送日時のタスクを生成
- **毎週番組（以降）**: 前回タスク完了時または期限切れ時に次回タスクを自動生成

#### 通知タイミング
- 期限の1日前18時に自動通知
- 過去の日時の場合は通知をスケジュールしない
- タスク削除・完了時に通知を自動キャンセル

## 🔍 開発ガイド

### TypeScriptコンパイルチェック

```bash
npx tsc --noEmit
```

### コーディング規約

- React Native Best Practices 2025に準拠
- 例外的な実装にはコメントで理由を記載
- パラメータ化クエリの使用（SQL Injection対策）
- エラーハンドリングの徹底

### 重要な注意事項

#### 日時フォーマット
- **SQLite標準形式を使用**: `YYYY-MM-DD HH:mm:ss`
- ISO8601形式（T区切り）は使用しない
- タイムゾーン: Asia/Tokyo固定

#### データベース操作
- トランザクションで複数操作をラップ
- パラメータ化クエリを必ず使用
- エラー発生時は適切な例外を投げる

#### パフォーマンス最適化
- `React.memo`でコンポーネントをメモ化
- `useMemo`でソート済みリストをメモ化
- `useCallback`でイベントハンドラをメモ化
- FlatListの最適化設定を使用

## 🐛 既知の問題

### Expo Goでの通知警告

Expo Go（SDK 53以降）でAndroidリモート通知機能が削除されたため、起動時に警告が表示されますが、**ローカル通知は正常に動作します**。

警告を完全に解消するには、Development Buildを使用してください：

```bash
npx expo prebuild
npx expo run:android
# または
npx expo run:ios
```

## 📄 ライセンス

このプロジェクトは個人用プロジェクトです。

## 👤 作成者

Claude Code による実装支援

## 🙏 謝辞

- radikoのタイムフリー機能
- Expo & React Nativeコミュニティ
- すべてのオープンソースコントリビューター

---

**注意**: このアプリはradiko公式アプリではありません。radikoのサービスを利用する際は、radikoの利用規約に従ってください。
