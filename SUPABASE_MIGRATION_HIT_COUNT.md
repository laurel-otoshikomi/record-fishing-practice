# Supabase Migration: Add Hit Count Field

## 目的
釣果数（count）とは別に、「あたり数（hit_count）」を記録できるようにする。

---

## 実行するSQL

Supabaseのダッシュボードで以下のSQLを実行してください：

```sql
-- Add hit_count column to logs table
ALTER TABLE logs 
ADD COLUMN hit_count INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN logs.hit_count IS 'あたり数（optional）- Number of bites/hits during fishing session';
```

---

## 動作確認

### 1. 列が追加されたか確認
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'logs' AND column_name = 'hit_count';
```

### 2. テストデータで動作確認
```sql
-- Test insert with hit_count
INSERT INTO logs (
  auth_user_id, 
  user_id, 
  user_name, 
  date, 
  area, 
  location, 
  method, 
  bait, 
  count, 
  hit_count
) VALUES (
  'your-user-id',
  'your-user-id',
  'Test User',
  '2024-01-31T10:00',
  'テストエリア',
  'テスト場所',
  'フカセ',
  'イガイ',
  0,  -- ボーズの例
  5   -- あたりは5回あった
);

-- Verify the insert
SELECT id, date, count, hit_count 
FROM logs 
WHERE user_name = 'Test User' 
ORDER BY created_at DESC 
LIMIT 1;

-- Clean up test data (optional)
DELETE FROM logs WHERE user_name = 'Test User';
```

---

## 既存データへの影響

- **既存レコード**: `hit_count` は `NULL` となる（問題なし）
- **アプリの表示**: `NULL` の場合は「あたり数」を表示しない
- **データ入力**: 任意入力なので、空欄でもOK

---

## ロールバック（必要な場合）

もし問題があった場合は、以下のSQLで列を削除できます：

```sql
-- Remove hit_count column (if needed)
ALTER TABLE logs DROP COLUMN hit_count;
```

---

## 実装内容まとめ

### UIの変更
1. **LOG タブ**: 「あたり数 (HIT COUNT)」フィールド追加（釣果数の下）
2. **EDIT モーダル**: 編集画面にも同じフィールドを追加
3. **DATA タブ**: 
   - 釣果数が0の場合は「ボーズ」と表示
   - あたり数がある場合は「あたり: X回」と表示

### データベースの変更
- `logs` テーブルに `hit_count` 列を追加
- 型: `INTEGER`
- NULL許可: YES（任意入力のため）

---

## 使用例

### ボーズだけどあたりがあった場合
```
釣果数 (TOTAL): 0
あたり数 (HIT COUNT): 3
```
→ DATA タブで「ボーズ」と表示され、「あたり: 3回」も表示される

### あたり数を記録しない場合
```
釣果数 (TOTAL): 5
あたり数 (HIT COUNT): --- (空欄)
```
→ 従来通り「5枚」と表示され、あたり数は表示されない

---

## 注意事項

⚠️ **重要**: このSQLを実行する前に、必ず以下を確認してください：
1. 練習用環境（record-fishing-practice）のSupabaseで実行すること
2. 本番環境に適用する前に、必ず練習用で動作確認すること
3. バックアップは不要（列追加は既存データに影響しない）

---

## 実行手順

1. Supabase ダッシュボードを開く: https://supabase.com/dashboard
2. プロジェクト「record-fishing-practice」を選択
3. 左メニューから「SQL Editor」を選択
4. 上記のSQLをコピー＆ペースト
5. 「RUN」ボタンをクリック
6. 成功メッセージを確認

完了したら、アプリをリロードして動作確認してください！ 🎣
