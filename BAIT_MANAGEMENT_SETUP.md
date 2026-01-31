# 餌（BAIT）管理機能のセットアップ

## 📋 概要

餌（BAIT）管理機能を追加しました。
エリア管理と同様に、Supabaseの`baits`テーブルを使用して餌の追加・編集・削除ができます。

---

## 🗄️ Supabase テーブルのセットアップ

### ステップ1: テーブルを作成

Supabase SQL Editorで以下のSQLを実行してください：

```sql
-- baits テーブルを作成
CREATE TABLE IF NOT EXISTS baits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bait_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_baits_user_id ON baits(user_id);
CREATE INDEX IF NOT EXISTS idx_baits_bait_name ON baits(bait_name);
CREATE INDEX IF NOT EXISTS idx_baits_is_default ON baits(is_default);

-- Row Level Security を有効化
ALTER TABLE baits ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（エラー回避）
DROP POLICY IF EXISTS "Users can view own baits" ON baits;
DROP POLICY IF EXISTS "Users can insert own baits" ON baits;
DROP POLICY IF EXISTS "Users can update own baits" ON baits;
DROP POLICY IF EXISTS "Users can delete baits" ON baits;

-- ポリシーを作成
CREATE POLICY "Users can view own baits"
  ON baits FOR SELECT
  USING (auth.uid() = user_id OR is_default = true OR user_id IS NULL);

CREATE POLICY "Users can insert own baits"
  ON baits FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own baits"
  ON baits FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete baits"
  ON baits FOR DELETE
  USING (auth.uid() IS NOT NULL);
```

---

### ステップ2: 初期データを追加

既存の餌リストを初期データとして追加します：

```sql
-- 初期データを追加（既存の餌リスト）
INSERT INTO baits (user_id, bait_name, is_default) VALUES
(NULL, 'イガイ', true),
(NULL, 'ミジ貝', true),
(NULL, 'フジツボ', true),
(NULL, 'パイプ', true),
(NULL, 'カニ', true),
(NULL, '赤イソメ', true),
(NULL, '青コガネ', true)
ON CONFLICT DO NOTHING;
```

---

## ✅ 機能

### BAIT タブの機能

1. **餌の一覧表示**
   - Supabaseの`baits`テーブルから餌を読み込み
   - ユーザー独自の餌と初期データ（`is_default=true`）を表示

2. **餌の追加**
   - 新しい餌名を入力して追加
   - `user_id`には現在のユーザーIDが設定される
   - `is_default=false`で保存

3. **餌の編集**
   - 餌名をクリックして編集モーダルを開く
   - 餌名を変更して保存

4. **餌の削除**
   - 削除ボタンをクリックして餌を削除
   - 確認ダイアログが表示される

5. **釣果記録画面との連携**
   - BAIT タブで追加・編集・削除した餌が、LOG タブの餌選択ドロップダウンに自動反映される

---

## 🔄 データベース構造

### `baits` テーブル

| カラム名 | 型 | 説明 |
|---------|----|----|
| `id` | UUID | 主キー（自動生成） |
| `user_id` | UUID | ユーザーID（NULLの場合は初期データ） |
| `bait_name` | TEXT | 餌名 |
| `is_default` | BOOLEAN | 初期データフラグ |
| `created_at` | TIMESTAMP | 作成日時 |
| `updated_at` | TIMESTAMP | 更新日時 |

---

## 📝 RLS ポリシー

### SELECT ポリシー
- ログイン済みユーザーは、自分の餌と初期データ（`user_id IS NULL`）を閲覧可能

### INSERT ポリシー
- ログイン済みユーザーは餌を追加可能

### UPDATE ポリシー
- ログイン済みユーザーは餌を編集可能

### DELETE ポリシー
- ログイン済みユーザーは餌を削除可能（初期データも削除可能）

---

## 🎯 使い方

1. **BAIT タブを開く**
   - アプリのタブから「BAIT」をクリック

2. **餌を追加**
   - 「新しい餌を追加」セクションに餌名を入力
   - 「追加」ボタンをクリック

3. **餌を編集**
   - 登録済み餌一覧から「Edit」ボタンをクリック
   - モーダルで餌名を変更
   - 「UPDATE」ボタンで保存

4. **餌を削除**
   - 登録済み餌一覧から「Delete」ボタンをクリック
   - 確認ダイアログで「OK」をクリック

5. **釣果記録で使用**
   - LOG タブで釣果記録を入力する際、追加した餌が選択可能になります

---

## 🚀 次のステップ

餌管理機能が完成しました！

次に実装する機能：
1. ✅ 餌管理機能（完了）
2. 📦 データのバックアップ機能（エクスポート/インポート）
3. 📊 統計機能の追加（月別・エリア別の釣果統計）
4. 🚢 本番環境への適用

---

## 📌 注意事項

- 餌の削除は取り消せません
- 初期データ（`is_default=true`）も編集・削除可能です
- 釣果記録で使用中の餌を削除しても、過去のログには影響しません（ログには餌名が文字列として保存されています）

---

## 🔗 関連ドキュメント

- [AREA_MANAGEMENT_GUIDE.md](./AREA_MANAGEMENT_GUIDE.md) - エリア管理機能のガイド
- [SUPABASE_UPDATES.md](./SUPABASE_UPDATES.md) - Supabaseデータベース変更履歴
