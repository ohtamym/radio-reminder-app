# ラジオ番組聞き逃し防止アプリ データベース詳細設計書

## 1. データベース概要

### 1.1 データベース情報

- **DBMS**: SQLite (expo-sqlite)
- **データベース名**: radio_reminder.db
- **文字コード**: UTF-8
- **バージョン管理**: マイグレーション機能で管理

### 1.2 テーブル一覧

| テーブル名 | 論理名 | 説明 |
|-----------|--------|------|
| programs | 番組マスタ | 繰り返し設定を含む番組の基本情報 |
| tasks | タスク | 実際に聴取する対象となる個別の放送回 |

---

## 2. テーブル詳細設計

### 2.1 programs（番組マスタテーブル）

#### 2.1.1 テーブル定義

| カラム名 | 型 | 必須 | デフォルト値 | 説明 |
|---------|------|------|-------------|------|
| id | INTEGER | ○ | AUTO_INCREMENT | 主キー（自動採番） |
| station_name | TEXT | ○ | - | 放送局名 |
| program_name | TEXT | ○ | - | 番組名 |
| day_of_week | INTEGER | ○ | - | 曜日（0=日曜, 1=月曜, ..., 6=土曜） |
| hour | INTEGER | ○ | - | 放送時刻（時）5-29 |
| minute | INTEGER | ○ | - | 放送時刻（分）0, 15, 30, 45 |
| repeat_type | TEXT | ○ | - | 繰り返し種別（'none', 'weekly'） |
| created_at | TEXT | ○ | CURRENT_TIMESTAMP | 登録日時（YYYY-MM-DD HH:mm:ss形式） |
| updated_at | TEXT | ○ | CURRENT_TIMESTAMP | 更新日時（YYYY-MM-DD HH:mm:ss形式） |

#### 2.1.2 制約

**主キー制約**
```sql
PRIMARY KEY (id)
```

**CHECK制約**
```sql
CHECK (day_of_week >= 0 AND day_of_week <= 6)
CHECK (hour >= 5 AND hour <= 29)
CHECK (minute IN (0, 15, 30, 45))
CHECK (repeat_type IN ('none', 'weekly'))
```

**NOT NULL制約**
- 全カラム必須（created_at, updated_atはデフォルト値あり）

#### 2.1.3 インデックス

```sql
-- 番組名での検索用（将来の検索機能用）
CREATE INDEX idx_programs_program_name ON programs(program_name);

-- 放送曜日での検索用（タスク生成時の参照用）
CREATE INDEX idx_programs_day_of_week ON programs(day_of_week);

-- 繰り返し設定での検索用
CREATE INDEX idx_programs_repeat_type ON programs(repeat_type);
```

#### 2.1.4 CREATE TABLE文

```sql
CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    hour INTEGER NOT NULL CHECK (hour >= 5 AND hour <= 29),
    minute INTEGER NOT NULL CHECK (minute IN (0, 15, 30, 45)),
    repeat_type TEXT NOT NULL CHECK (repeat_type IN ('none', 'weekly')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX idx_programs_program_name ON programs(program_name);
CREATE INDEX idx_programs_day_of_week ON programs(day_of_week);
CREATE INDEX idx_programs_repeat_type ON programs(repeat_type);
```

#### 2.1.5 サンプルデータ

```sql
INSERT INTO programs (station_name, program_name, day_of_week, hour, minute, repeat_type)
VALUES 
    ('TBSラジオ', 'アフター6ジャンクション', 4, 18, 0, 'weekly'),
    ('文化放送', 'レコメン！', 3, 22, 0, 'weekly'),
    ('ニッポン放送', 'オールナイトニッポン', 2, 25, 0, 'none');
```

---

### 2.2 tasks（タスクテーブル）

#### 2.2.1 テーブル定義

| カラム名 | 型 | 必須 | デフォルト値 | 説明 |
|---------|------|------|-------------|------|
| id | INTEGER | ○ | AUTO_INCREMENT | 主キー（自動採番） |
| program_id | INTEGER | ○ | - | 番組マスタID（外部キー） |
| broadcast_datetime | TEXT | ○ | - | 放送日時（YYYY-MM-DD HH:mm:ss形式） |
| deadline_datetime | TEXT | ○ | - | 期限日時（YYYY-MM-DD HH:mm:ss形式） |
| status | TEXT | ○ | 'unlistened' | ステータス（'unlistened', 'listening', 'completed'） |
| completed_at | TEXT | - | NULL | 聴取完了日時（YYYY-MM-DD HH:mm:ss形式） |
| created_at | TEXT | ○ | CURRENT_TIMESTAMP | 登録日時（YYYY-MM-DD HH:mm:ss形式） |
| updated_at | TEXT | ○ | CURRENT_TIMESTAMP | 更新日時（YYYY-MM-DD HH:mm:ss形式） |

#### 2.2.2 制約

**主キー制約**
```sql
PRIMARY KEY (id)
```

**外部キー制約**
```sql
FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
```

**CHECK制約**
```sql
CHECK (status IN ('unlistened', 'listening', 'completed'))
```

**NOT NULL制約**
- completed_at以外は必須（created_at, updated_at, statusはデフォルト値あり）

#### 2.2.3 インデックス

```sql
-- program_idでの検索用（番組に紐づくタスク取得）
CREATE INDEX idx_tasks_program_id ON tasks(program_id);

-- ステータスでの検索用（一覧表示のフィルタリング）
CREATE INDEX idx_tasks_status ON tasks(status);

-- 期限日時でのソート用（期限順表示）
CREATE INDEX idx_tasks_deadline_datetime ON tasks(deadline_datetime);

-- 複合インデックス（期限切れチェック用）
CREATE INDEX idx_tasks_status_deadline ON tasks(status, deadline_datetime);

-- 聴取完了日時でのソート用（履歴表示）
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
```

#### 2.2.4 CREATE TABLE文

```sql
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    broadcast_datetime TEXT NOT NULL,
    deadline_datetime TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unlistened' CHECK (status IN ('unlistened', 'listening', 'completed')),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_program_id ON tasks(program_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline_datetime ON tasks(deadline_datetime);
CREATE INDEX idx_tasks_status_deadline ON tasks(status, deadline_datetime);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
```

#### 2.2.5 サンプルデータ

```sql
INSERT INTO tasks (program_id, broadcast_datetime, deadline_datetime, status)
VALUES 
    (1, '2024-12-05T18:00:00', '2024-12-13T05:00:00', 'unlistened'),
    (2, '2024-12-04T22:00:00', '2024-12-12T05:00:00', 'listening'),
    (3, '2024-12-03T01:00:00', '2024-12-11T05:00:00', 'unlistened');
```

---

## 3. リレーションシップ

### 3.1 ER図（テキスト表現）

```
programs (1) ─────< (N) tasks
    │                   │
    │                   │
    id ←────────── program_id
```

### 3.2 リレーション詳細

- **programs → tasks**: 1対多（1つの番組に対して複数のタスク）
- **外部キー**: tasks.program_id → programs.id
- **削除時の挙動**: CASCADE（番組削除時に関連タスクも削除）

---

## 4. CRUD操作SQL

### 4.1 programs（番組マスタ）

#### 4.1.1 CREATE（新規登録）

```sql
-- 番組を新規登録
INSERT INTO programs (
    station_name, 
    program_name, 
    day_of_week, 
    hour, 
    minute, 
    repeat_type
) VALUES (?, ?, ?, ?, ?, ?);

-- 登録後、最後に挿入されたIDを取得
SELECT last_insert_rowid();
```

#### 4.1.2 READ（取得）

```sql
-- 全番組を取得
SELECT * FROM programs ORDER BY created_at DESC;

-- IDで番組を取得
SELECT * FROM programs WHERE id = ?;

-- 番組名で検索（部分一致）
SELECT * FROM programs WHERE program_name LIKE '%' || ? || '%';

-- 繰り返し設定で絞り込み
SELECT * FROM programs WHERE repeat_type = ?;

-- 特定の曜日の番組を取得
SELECT * FROM programs WHERE day_of_week = ?;
```

#### 4.1.3 UPDATE（更新）

```sql
-- 番組情報を更新
UPDATE programs 
SET 
    station_name = ?,
    program_name = ?,
    day_of_week = ?,
    hour = ?,
    minute = ?,
    repeat_type = ?,
    updated_at = datetime('now', 'localtime')
WHERE id = ?;
```

#### 4.1.4 DELETE（削除）

```sql
-- 番組を削除（CASCADE設定により関連タスクも自動削除）
DELETE FROM programs WHERE id = ?;
```

---

### 4.2 tasks（タスク）

#### 4.2.1 CREATE（新規登録）

```sql
-- タスクを新規登録
INSERT INTO tasks (
    program_id,
    broadcast_datetime,
    deadline_datetime,
    status
) VALUES (?, ?, ?, 'unlistened');

-- 登録後、最後に挿入されたIDを取得
SELECT last_insert_rowid();
```

#### 4.2.2 READ（取得）

```sql
-- 全タスクを番組情報と結合して取得（期限順）
SELECT 
    t.id,
    t.program_id,
    p.station_name,
    p.program_name,
    p.repeat_type,
    t.broadcast_datetime,
    t.deadline_datetime,
    t.status,
    t.completed_at,
    t.created_at,
    t.updated_at
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status != 'completed'
ORDER BY t.deadline_datetime ASC;

-- 特定のタスクを取得
SELECT 
    t.*,
    p.station_name,
    p.program_name,
    p.repeat_type
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.id = ?;

-- 特定の番組のタスクを全て取得
SELECT * FROM tasks 
WHERE program_id = ? 
ORDER BY broadcast_datetime DESC;

-- ステータス別に取得
SELECT 
    t.*,
    p.station_name,
    p.program_name
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status = ?
ORDER BY t.deadline_datetime ASC;

-- 期限切れタスクを取得
SELECT * FROM tasks 
WHERE status != 'completed' 
AND deadline_datetime < datetime('now', 'localtime');

-- 聴取履歴を取得（完了日時の降順、1ヶ月以内）
SELECT 
    t.*,
    p.station_name,
    p.program_name
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status = 'completed'
AND t.completed_at >= datetime('now', 'localtime', '-1 month')
ORDER BY t.completed_at DESC;
```

#### 4.2.3 UPDATE（更新）

```sql
-- ステータスを更新
UPDATE tasks 
SET 
    status = ?,
    updated_at = datetime('now', 'localtime')
WHERE id = ?;

-- ステータスを「聴取済み」に更新（完了日時も記録）
UPDATE tasks 
SET 
    status = 'completed',
    completed_at = datetime('now', 'localtime'),
    updated_at = datetime('now', 'localtime')
WHERE id = ?;

-- ステータスを「未聴取」または「聴取中」に戻す（完了日時をクリア）
UPDATE tasks 
SET 
    status = ?,
    completed_at = NULL,
    updated_at = datetime('now', 'localtime')
WHERE id = ?;
```

#### 4.2.4 DELETE（削除）

```sql
-- 特定のタスクを削除
DELETE FROM tasks WHERE id = ?;

-- 特定の番組の全タスクを削除
DELETE FROM tasks WHERE program_id = ?;

-- 期限切れタスクを削除
DELETE FROM tasks 
WHERE status != 'completed' 
AND deadline_datetime < datetime('now', 'localtime');

-- 1ヶ月以上前の聴取済みタスクを削除
DELETE FROM tasks 
WHERE status = 'completed' 
AND completed_at < datetime('now', 'localtime', '-1 month');
```

---

## 5. 複雑なクエリ

### 5.1 次回タスク生成用クエリ

```sql
-- 特定の番組の最新タスクを取得
-- 注: 次回タスク生成時には、前回タスクのbroadcast_datetimeから1週間後を計算する
-- 理由: 期限切れタスクが残っていた場合、現在時刻から計算すると
--       前回タスクの2週間後以降のタスクが作成されてしまうため
SELECT * FROM tasks
WHERE program_id = ?
ORDER BY broadcast_datetime DESC
LIMIT 1;

-- 時刻情報取得（期限計算に必要）
SELECT
    id,
    day_of_week,
    hour,
    minute,
    repeat_type
FROM programs
WHERE id = ?;
```

### 5.2 期限が近いタスクの検出

```sql
-- 期限まで24時間以内のタスク（通知対象）
SELECT 
    t.id,
    t.program_id,
    p.station_name,
    p.program_name,
    t.broadcast_datetime,
    t.deadline_datetime,
    CAST((julianday(t.deadline_datetime) - julianday('now', 'localtime')) * 24 AS INTEGER) AS hours_remaining
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status != 'completed'
AND t.deadline_datetime > datetime('now', 'localtime')
AND t.deadline_datetime <= datetime('now', 'localtime', '+1 day')
ORDER BY t.deadline_datetime ASC;
```

### 5.3 統計情報取得（将来機能用）

```sql
-- 月別の聴取完了数
SELECT 
    strftime('%Y-%m', completed_at) AS month,
    COUNT(*) AS completed_count
FROM tasks
WHERE status = 'completed'
GROUP BY month
ORDER BY month DESC;

-- 放送局別の聴取数
SELECT 
    p.station_name,
    COUNT(t.id) AS completed_count
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status = 'completed'
GROUP BY p.station_name
ORDER BY completed_count DESC;

-- 番組別の聴取率
SELECT 
    p.program_name,
    p.station_name,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_count,
    COUNT(*) AS total_count,
    ROUND(
        CAST(COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS FLOAT) / COUNT(*) * 100, 
        2
    ) AS completion_rate
FROM programs p
LEFT JOIN tasks t ON p.id = t.program_id
GROUP BY p.id
ORDER BY completion_rate DESC;
```

---

## 6. トリガー定義

### 6.1 updated_at自動更新トリガー

```sql
-- programsテーブルのupdated_at自動更新
CREATE TRIGGER update_programs_updated_at 
AFTER UPDATE ON programs
FOR EACH ROW
BEGIN
    UPDATE programs 
    SET updated_at = datetime('now', 'localtime')
    WHERE id = NEW.id;
END;

-- tasksテーブルのupdated_at自動更新
CREATE TRIGGER update_tasks_updated_at 
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    UPDATE tasks 
    SET updated_at = datetime('now', 'localtime')
    WHERE id = NEW.id;
END;
```

---

## 7. データ整合性チェック

### 7.1 孤立したタスクのチェック

```sql
-- program_idが存在しないタスクを検出（通常は発生しない）
SELECT t.* 
FROM tasks t
LEFT JOIN programs p ON t.program_id = p.id
WHERE p.id IS NULL;
```

### 7.2 重複タスクのチェック

```sql
-- 同じprogram_idとbroadcast_datetimeを持つタスクを検出
SELECT 
    program_id, 
    broadcast_datetime, 
    COUNT(*) AS count
FROM tasks
GROUP BY program_id, broadcast_datetime
HAVING COUNT(*) > 1;
```

### 7.3 不正なステータスのチェック

```sql
-- completed_atが設定されているがstatusがcompletedでないタスク
SELECT * FROM tasks 
WHERE completed_at IS NOT NULL 
AND status != 'completed';

-- statusがcompletedだがcompleted_atが設定されていないタスク
SELECT * FROM tasks 
WHERE status = 'completed' 
AND completed_at IS NULL;
```

---

## 8. パフォーマンス最適化

### 8.1 インデックス使用状況の確認

```sql
-- クエリの実行計画を確認
EXPLAIN QUERY PLAN
SELECT 
    t.*,
    p.station_name,
    p.program_name
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status != 'completed'
ORDER BY t.deadline_datetime ASC;
```

### 8.2 定期メンテナンス

```sql
-- データベースの最適化
VACUUM;

-- インデックスの再構築
REINDEX;

-- 統計情報の更新
ANALYZE;
```

---

## 9. バックアップとリストア

### 9.1 データエクスポート

```sql
-- 全データをJSON形式でエクスポート（アプリケーション層で実装）
-- programsとtasksの全データを取得してJSON化
```

### 9.2 データインポート

```sql
-- データベースをリセット
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS programs;

-- テーブルを再作成
-- (上記のCREATE TABLE文を実行)

-- データを挿入
-- (バックアップしたJSONデータからINSERT文を生成して実行)
```

---

## 10. マイグレーション戦略

### 10.1 バージョン管理

```sql
-- バージョン管理テーブル
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 初期バージョンを記録
INSERT INTO schema_version (version) VALUES (1);
```

### 10.2 マイグレーション例

**Version 1 → Version 2（例：新カラム追加）**

```sql
-- 新しいカラムを追加（例：番組のメモ欄）
ALTER TABLE programs ADD COLUMN memo TEXT;

-- バージョンを更新
INSERT INTO schema_version (version) VALUES (2);
```

**Version 2 → Version 3（例：テーブル追加）**

```sql
-- 新しいテーブルを追加（例：タグ機能）
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS program_tags (
    program_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (program_id, tag_id),
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- バージョンを更新
INSERT INTO schema_version (version) VALUES (3);
```

---

## 11. テストデータ生成

### 11.1 開発用サンプルデータ

```sql
-- 番組マスタのサンプルデータ
INSERT INTO programs (station_name, program_name, day_of_week, hour, minute, repeat_type) VALUES
    ('TBSラジオ', 'アフター6ジャンクション', 4, 18, 0, 'weekly'),
    ('文化放送', 'レコメン！', 3, 22, 0, 'weekly'),
    ('ニッポン放送', 'オールナイトニッポン', 2, 25, 0, 'weekly'),
    ('J-WAVE', 'STEP ONE', 1, 9, 0, 'weekly'),
    ('InterFM', 'Barakan Morning', 0, 7, 0, 'weekly'),
    ('NHKラジオ第1', 'マイあさ！', 1, 5, 0, 'none');

-- タスクのサンプルデータ（未聴取）
INSERT INTO tasks (program_id, broadcast_datetime, deadline_datetime, status) VALUES
    (1, datetime('now', 'localtime', '-1 day', 'start of day', '+18 hours'), datetime('now', 'localtime', '+6 days', 'start of day', '+5 hours'), 'unlistened'),
    (2, datetime('now', 'localtime', '-2 days', 'start of day', '+22 hours'), datetime('now', 'localtime', '+5 days', 'start of day', '+5 hours'), 'listening'),
    (3, datetime('now', 'localtime', '-3 days', 'start of day', '+1 hours'), datetime('now', 'localtime', '+4 days', 'start of day', '+5 hours'), 'unlistened');

-- タスクのサンプルデータ（聴取済み・履歴用）
INSERT INTO tasks (program_id, broadcast_datetime, deadline_datetime, status, completed_at) VALUES
    (1, datetime('now', 'localtime', '-8 days', 'start of day', '+18 hours'), datetime('now', 'localtime', '-1 day', 'start of day', '+5 hours'), 'completed', datetime('now', 'localtime', '-2 days')),
    (2, datetime('now', 'localtime', '-9 days', 'start of day', '+22 hours'), datetime('now', 'localtime', '-2 days', 'start of day', '+5 hours'), 'completed', datetime('now', 'localtime', '-3 days')),
    (4, datetime('now', 'localtime', '-15 days', 'start of day', '+9 hours'), datetime('now', 'localtime', '-8 days', 'start of day', '+5 hours'), 'completed', datetime('now', 'localtime', '-10 days'));
```

---

## 12. セキュリティ考慮事項

### 12.1 SQLインジェクション対策

- **必須**: プリペアドステートメント（パラメータ化クエリ）を使用
- **禁止**: 文字列連結によるSQL生成

**良い例（TypeScript/JavaScript）**
```typescript
// expo-sqliteの場合
db.runAsync(
  'INSERT INTO programs (station_name, program_name, day_of_week, hour, minute, repeat_type) VALUES (?, ?, ?, ?, ?, ?)',
  [stationName, programName, dayOfWeek, hour, minute, repeatType]
);
```

**悪い例（絶対に使用しない）**
```typescript
// 危険：SQLインジェクションの脆弱性あり
db.runAsync(
  `INSERT INTO programs (station_name, program_name) VALUES ('${stationName}', '${programName}')`
);
```

### 12.2 データ検証

- アプリケーション層でのバリデーション実施
- CHECK制約による二重チェック
- 外部キー制約による参照整合性の保証

---

## 13. 実装時の注意事項

### 13.1 日時の扱い

- **保存形式**: YYYY-MM-DD HH:mm:ss形式（SQLite標準形式、例: '2024-12-05 18:00:00'）
- **タイムゾーン**: ローカル時刻で統一（Asia/Tokyo）
- **SQLite関数**: `datetime('now', 'localtime')` を使用

### 13.2 トランザクション管理

```typescript
// 複数の操作を1つのトランザクションにまとめる
await db.withTransactionAsync(async () => {
  // 番組を登録
  const result = await db.runAsync(
    'INSERT INTO programs (...) VALUES (...)',
    [...]
  );
  const programId = result.lastInsertRowId;
  
  // タスクを生成
  await db.runAsync(
    'INSERT INTO tasks (...) VALUES (...)',
    [..., programId, ...]
  );
});
```

### 13.3 エラーハンドリング

- 外部キー制約違反
- CHECK制約違反
- UNIQUE制約違反（将来機能で使用する場合）
- データベース接続エラー

```typescript
try {
  await db.runAsync('INSERT INTO tasks (...) VALUES (...)', [...]);
} catch (error) {
  if (error.message.includes('FOREIGN KEY constraint failed')) {
    // 番組マスタが存在しない
    console.error('指定された番組が見つかりません');
  } else if (error.message.includes('CHECK constraint failed')) {
    // CHECK制約違反
    console.error('不正な値が入力されました');
  } else {
    // その他のエラー
    console.error('データベースエラー:', error);
  }
}
```

---

## 14. パフォーマンス目標

### 14.1 レスポンス時間

- タスク一覧取得: 100ms以内
- タスク登録: 50ms以内
- タスク更新: 50ms以内
- タスク削除: 50ms以内

### 14.2 データ量の想定

- 番組マスタ: 最大100件
- タスク（未聴取・聴取中）: 最大200件
- タスク（履歴）: 最大500件（1ヶ月分）

### 14.3 スケーラビリティ

現在の設計では上記のデータ量で十分なパフォーマンスが得られる見込み。
将来的にユーザー数やデータ量が増加した場合は以下を検討：
- パーティショニング
- アーカイブテーブルの導入
- キャッシング戦略の見直し

---

## 15. 付録

### 15.1 よく使うクエリ集

```sql
-- 今日のタスク数を取得
SELECT COUNT(*) FROM tasks 
WHERE status != 'completed'
AND date(broadcast_datetime) = date('now', 'localtime');

-- 今週の聴取完了数を取得
SELECT COUNT(*) FROM tasks
WHERE status = 'completed'
AND completed_at >= date('now', 'localtime', 'weekday 0', '-7 days')
AND completed_at < date('now', 'localtime', 'weekday 0');

-- 最も聴いている放送局を取得
SELECT 
    p.station_name,
    COUNT(t.id) AS listen_count
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status = 'completed'
GROUP BY p.station_name
ORDER BY listen_count DESC
LIMIT 1;
```

### 15.2 デバッグ用クエリ

```sql
-- 全テーブルのレコード数を確認
SELECT 'programs' AS table_name, COUNT(*) AS count FROM programs
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks;

-- 各ステータスのタスク数を確認
SELECT status, COUNT(*) AS count 
FROM tasks 
GROUP BY status;

-- 期限切れタスクの確認
SELECT 
    t.id,
    p.program_name,
    t.broadcast_datetime,
    t.deadline_datetime,
    datetime('now', 'localtime') AS current_time
FROM tasks t
INNER JOIN programs p ON t.program_id = p.id
WHERE t.status != 'completed'
AND t.deadline_datetime < datetime('now', 'localtime');
```

---

## 16. データベース初期化スクリプト

### 16.1 完全な初期化スクリプト

```sql
-- 既存のテーブルを削除（開発時のみ）
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS programs;
DROP TABLE IF EXISTS schema_version;

-- programsテーブル作成
CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_name TEXT NOT NULL,
    program_name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    hour INTEGER NOT NULL CHECK (hour >= 5 AND hour <= 29),
    minute INTEGER NOT NULL CHECK (minute IN (0, 15, 30, 45)),
    repeat_type TEXT NOT NULL CHECK (repeat_type IN ('none', 'weekly')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- programsテーブルのインデックス
CREATE INDEX idx_programs_program_name ON programs(program_name);
CREATE INDEX idx_programs_day_of_week ON programs(day_of_week);
CREATE INDEX idx_programs_repeat_type ON programs(repeat_type);

-- tasksテーブル作成
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    broadcast_datetime TEXT NOT NULL,
    deadline_datetime TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unlistened' CHECK (status IN ('unlistened', 'listening', 'completed')),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
);

-- tasksテーブルのインデックス
CREATE INDEX idx_tasks_program_id ON tasks(program_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline_datetime ON tasks(deadline_datetime);
CREATE INDEX idx_tasks_status_deadline ON tasks(status, deadline_datetime);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);

-- トリガー作成
CREATE TRIGGER update_programs_updated_at 
AFTER UPDATE ON programs
FOR EACH ROW
BEGIN
    UPDATE programs 
    SET updated_at = datetime('now', 'localtime')
    WHERE id = NEW.id;
END;

CREATE TRIGGER update_tasks_updated_at 
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
    UPDATE tasks 
    SET updated_at = datetime('now', 'localtime')
    WHERE id = NEW.id;
END;

-- バージョン管理テーブル
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

INSERT INTO schema_version (version) VALUES (1);
```

---

以上がデータベース詳細設計書です。実装時はこのドキュメントを参照しながら進めてください。
