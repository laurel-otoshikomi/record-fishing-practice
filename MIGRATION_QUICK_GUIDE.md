# 本番環境移行 - クイックガイド

## 🚀 最速で移行する手順（所要時間: 約40分）

---

## 📋 準備（5分）

### 1. 本番データのバックアップ

```
1. 本番アプリにアクセス
2. DATA タブ → EXPORT CSV
3. ファイルを安全な場所に保存
```

### 2. Supabase バックアップ

```
1. Supabase ダッシュボード → 本番プロジェクト
2. Database → Backups
3. Create Backup をクリック
```

---

## 🗄️ Supabase マイグレーション（10分）

### 実行場所
```
Supabase ダッシュボード → 本番プロジェクト → SQL Editor
```

### SQL を順番に実行

#### SQL 1: あたり数フィールド
```sql
ALTER TABLE logs ADD COLUMN IF NOT EXISTS hit_count INTEGER;
COMMENT ON COLUMN logs.hit_count IS 'あたりがあった回数（任意）';
```

#### SQL 2: サイズ分類フィールド
```sql
ALTER TABLE logs ADD COLUMN IF NOT EXISTS size_30 INTEGER DEFAULT 0;
ALTER TABLE logs ADD COLUMN IF NOT EXISTS size_under_30 INTEGER DEFAULT 0;
COMMENT ON COLUMN logs.size_30 IS '30-39cm のサイズ';
COMMENT ON COLUMN logs.size_under_30 IS '30cm未満のサイズ';
```

#### SQL 3: baits テーブル
```sql
CREATE TABLE IF NOT EXISTS baits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_baits_auth_user_id ON baits(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_baits_name ON baits(name);

ALTER TABLE baits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own baits"
    ON baits FOR SELECT
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own baits"
    ON baits FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own baits"
    ON baits FOR UPDATE
    USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete their own baits"
    ON baits FOR DELETE
    USING (auth.uid() = auth_user_id);
```

---

## 💻 コード更新（15分）

### オプションA: Git経由（推奨）

```bash
cd /home/user/webapp/record-fishing

# バックアップブランチを作成
git checkout -b backup-before-v1.1.0
git add -A
git commit -m "backup: Save current state before v1.1.0"
git push origin backup-before-v1.1.0

# メインブランチに戻る
git checkout main

# 練習環境の変更を取り込む
git remote add practice ../record-fishing-practice
git fetch practice
git merge practice/main -m "feat: Merge v1.1.0 from practice"

# リモートにプッシュ
git push origin main
```

### オプションB: ファイル直接コピー（簡単）

```bash
# バックアップ
cd /home/user/webapp
cp -r record-fishing record-fishing-backup-$(date +%Y%m%d)

# ファイルをコピー
cd /home/user/webapp/record-fishing-practice
cp index.html /home/user/webapp/record-fishing/
cp -r src /home/user/webapp/record-fishing/
cp package.json /home/user/webapp/record-fishing/
cp vite.config.ts /home/user/webapp/record-fishing/

# 本番環境でビルド
cd /home/user/webapp/record-fishing
npm install
npm run build

# Git にコミット
git add -A
git commit -m "feat: Update to v1.1.0"
git push origin main
```

### ⚠️ 重要: Supabase 接続情報の確認

```javascript
// src/main.ts を開いて確認
const SUPABASE_URL = 'https://your-production-project.supabase.co'
const SUPABASE_ANON_KEY = 'your-production-anon-key'
```

**練習環境の値が入っている場合は、本番用に変更してください！**

---

## 🌐 デプロイ（5分）

### Cloudflare Pages で自動デプロイ

```
git push origin main を実行すると、自動的にデプロイされます
```

### デプロイ状況の確認

```
Cloudflare ダッシュボード → Pages → record-fishing
デプロイ完了まで約2〜3分
```

---

## ✅ 動作確認（10分）

### 1. 基本確認

```
1. 本番アプリにアクセス（Ctrl+Shift+R で強制リロード）
2. 右上に Ver.1.1.0 が表示されることを確認
```

### 2. 新機能確認

#### LOGタブ
- [ ] あたり数（HIT COUNT）フィールドが表示される
- [ ] 釣果数0（ボーズ）を記録できる
- [ ] サイズ内訳に30-39cm、<30cmがある

#### DATAタブ
- [ ] 「ボーズ」表示が出る
- [ ] 「あたり: X回」表示が出る
- [ ] 月別グラフが6段階で表示される

#### AREAタブ
- [ ] AREA タブが表示される
- [ ] エリア追加ができる

#### BAITタブ
- [ ] BAIT タブが表示される
- [ ] 餌追加ができる

### 3. 既存データ確認

- [ ] 既存のログが正しく表示される
- [ ] 編集ができる
- [ ] CSV出力ができる

### 4. エラー確認

```
F12 → Console タブでエラーがないことを確認
```

---

## 📊 チェックリスト

### 移行前
- [ ] 本番データをCSVバックアップ
- [ ] Supabase データベースをバックアップ
- [ ] 本番環境をGitバックアップ

### マイグレーション
- [ ] SQL 1 実行（hit_count）
- [ ] SQL 2 実行（size_30、size_under_30）
- [ ] SQL 3 実行（baits テーブル）
- [ ] エラーがないことを確認

### コード更新
- [ ] 本番環境にコードをコピー/マージ
- [ ] Supabase 接続情報を本番用に変更 ⚠️
- [ ] npm install & build
- [ ] Git push

### デプロイ
- [ ] Cloudflare Pages デプロイ完了

### 動作確認
- [ ] Ver.1.1.0 表示を確認
- [ ] 新機能が動作することを確認
- [ ] 既存データが正しく表示されることを確認
- [ ] エラーがないことを確認

---

## ⚠️ トラブルシューティング

### Q1: バージョンが Ver.1.1.0 にならない

```
A: ブラウザのキャッシュをクリア
   Ctrl+Shift+R で強制リロード
   シークレットモードで確認
```

### Q2: Supabase 接続エラー

```
A: src/main.ts の SUPABASE_URL と SUPABASE_ANON_KEY を確認
   本番用の値になっているか確認
```

### Q3: 新機能が表示されない

```
A: Cloudflare Pages のデプロイログを確認
   ビルドエラーがないか確認
```

### Q4: 既存データが表示されない

```
A: Supabase でマイグレーションが正しく実行されたか確認
   logs テーブルに hit_count、size_30、size_under_30 カラムがあるか確認
```

---

## 🔄 ロールバック方法（緊急時）

### 問題が発生した場合

#### 1. コードのロールバック

```bash
cd /home/user/webapp/record-fishing
git checkout backup-before-v1.1.0
git push origin main --force
```

#### 2. データベースのロールバック

```sql
-- Supabase SQL Editor で実行
ALTER TABLE logs DROP COLUMN IF EXISTS hit_count;
ALTER TABLE logs DROP COLUMN IF EXISTS size_30;
ALTER TABLE logs DROP COLUMN IF EXISTS size_under_30;
DROP TABLE IF EXISTS baits CASCADE;
```

#### 3. Supabase バックアップから復元

```
Supabase ダッシュボード → Database → Backups
作成したバックアップから復元
```

---

## 📞 サポート

### 確認すべきログ

1. **Cloudflare Pages デプロイログ**
   ```
   https://dash.cloudflare.com/
   → Pages → record-fishing
   ```

2. **Supabase ログ**
   ```
   https://supabase.com/dashboard/
   → プロジェクト選択 → Logs
   ```

3. **ブラウザコンソール**
   ```
   F12 → Console タブ
   ```

### ドキュメント

- **詳細手順書**: PRODUCTION_MIGRATION_GUIDE.md
- **リリースノート**: RELEASE_NOTES_v1.1.0.md
- **マイグレーションSQL**: SUPABASE_MIGRATION_*.md

---

## 🎯 推奨スケジュール

### 今日（準備）
- データバックアップ
- 手順確認

### 明日以降（移行実施）
- 朝9時〜10時など、ユーザーが少ない時間帯に実施
- 所要時間: 約40分
- 移行完了後、ユーザーに通知

---

**作成日**: 2026-01-31  
**バージョン**: 1.1.0  

この手順で安全に本番環境へ移行できます！ 🚀
