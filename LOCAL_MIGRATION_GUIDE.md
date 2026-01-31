# ローカル経由での本番環境移行手順

## 🎯 この方法のメリット

- ✅ 安定した練習環境のコードをそのまま使える
- ✅ 本番アプリのチャットでデプロイしてもらえる（安定）
- ✅ 必要な部分だけ書き換えればOK（Supabase接続情報のみ）
- ✅ Git操作が不要

---

## 📋 全体の流れ

```
1. 練習環境のコードをローカルにダウンロード
   ↓
2. Supabase接続情報を本番用に書き換え
   ↓
3. 本番アプリのチャットにアップロード
   ↓
4. チャットにデプロイを依頼
   ↓
5. SQL実行（あなたが実施）
   ↓
6. 動作確認
```

---

## ステップ1: 練習環境のコードをダウンロード

### 方法A: GitHub からダウンロード（推奨・簡単）

1. **GitHub リポジトリにアクセス**
   ```
   https://github.com/laurel-otoshikomi/record-fishing-practice
   ```

2. **緑色の「Code」ボタンをクリック**

3. **「Download ZIP」を選択**

4. **ダウンロードしたZIPファイルを解凍**
   ```
   record-fishing-practice-main.zip
   → record-fishing-practice-main フォルダができる
   ```

### 方法B: 直接ダウンロードリンク

```
https://github.com/laurel-otoshikomi/record-fishing-practice/archive/refs/heads/main.zip
```

このリンクをクリックすると、すぐにダウンロードが始まります。

---

## ステップ2: Supabase接続情報を書き換え

### 📁 編集するファイル

```
record-fishing-practice-main/
└── src/
    └── main.ts  ← このファイルだけ編集
```

### 🔧 書き換え箇所

#### 現在の練習環境の設定（行6-7あたり）

```typescript
// 練習環境の設定
const SUPABASE_URL = 'https://練習用のプロジェクトURL.supabase.co'
const SUPABASE_ANON_KEY = '練習用のANON_KEY'
```

#### 本番環境用に書き換え

```typescript
// 本番環境の設定
const SUPABASE_URL = 'https://本番用のプロジェクトURL.supabase.co'
const SUPABASE_ANON_KEY = '本番用のANON_KEY'
```

### 📝 本番用のSupabase接続情報の取得方法

1. **Supabase ダッシュボードにログイン**
   ```
   https://supabase.com/dashboard
   ```

2. **本番プロジェクトを選択**

3. **「Settings」→「API」を開く**

4. **以下の情報をコピー**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

5. **src/main.ts に貼り付け**

---

## ステップ3: コードをZIPファイルにまとめる

### Windows の場合

1. `record-fishing-practice-main` フォルダを右クリック
2. 「送る」→「圧縮（zip形式）フォルダー」を選択
3. `record-fishing-practice-main.zip` ができる

### Mac の場合

1. `record-fishing-practice-main` フォルダを右クリック
2. 「"record-fishing-practice-main"を圧縮」を選択
3. `record-fishing-practice-main.zip` ができる

---

## ステップ4: 本番アプリのチャットにアップロード

### 🗨️ チャットでの依頼文（コピペOK）

```
【本番環境のデプロイ依頼】

record-fishing アプリを Ver.1.1.0 にアップデートしたいです。
添付のZIPファイルは、練習環境で完成したコードです。

以下の対応をお願いします：

1. 添付のZIPファイルを展開
2. /home/user/webapp/record-fishing に配置
3. npm install を実行
4. npm run build を実行（ビルドテスト）
5. Git に commit & push
6. Cloudflare Pages にデプロイ

注意事項：
- src/main.ts の Supabase 接続情報は本番用に書き換え済みです
- package.json のバージョンは 1.1.0 です
- 既存のコードは上書きして問題ありません

よろしくお願いします！
```

### 📎 ZIPファイルをアップロード

1. チャットの入力欄で、クリップアイコン（📎）をクリック
2. `record-fishing-practice-main.zip` を選択
3. 上記の依頼文と一緒に送信

---

## ステップ5: チャットでの進行イメージ

### あなた
```
【本番環境のデプロイ依頼】
（上記の依頼文を送信 + ZIPファイルを添付）
```

### AI（本番アプリのチャット）
```
承知しました！ZIPファイルを展開して、デプロイ作業を進めます。

1. ZIPファイルを /home/user/webapp/record-fishing に展開中...
2. npm install を実行中...
3. npm run build を実行中...
   ✅ ビルド成功
4. Git commit & push を実行中...
5. Cloudflare Pages デプロイ中...
   ✅ デプロイ完了

デプロイが完了しました！
https://record-fishing.pages.dev

Ver.1.1.0 が表示されていることを確認してください。
```

### あなた（確認完了後）
```
ありがとうございます！
Ver.1.1.0 が表示されました。

次に、Supabase のマイグレーションを実行します。
```

---

## ステップ6: Supabase マイグレーション（あなたが実施）

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

## ステップ7: 動作確認

### 1. 本番アプリにアクセス
```
https://record-fishing.pages.dev
```

### 2. 強制リロード
```
Ctrl+Shift+R（Windows）
Cmd+Shift+R（Mac）
```

### 3. バージョン確認
```
右上に「Ver.1.1.0」が表示されることを確認
```

### 4. 新機能確認

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

### 5. 既存データ確認
- [ ] 既存のログが正しく表示される
- [ ] 編集ができる
- [ ] CSV出力ができる

---

## 📝 チェックリスト（作業前の確認）

### ダウンロード前
- [ ] 本番データをCSVバックアップ
- [ ] Supabase データベースをバックアップ

### ローカル作業
- [ ] 練習環境のコードをダウンロード
- [ ] ZIPファイルを解凍
- [ ] src/main.ts の Supabase 接続情報を本番用に書き換え
- [ ] 編集したフォルダをZIPにまとめる

### チャットでの依頼
- [ ] 本番アプリのチャットを開く
- [ ] ZIPファイルをアップロード
- [ ] デプロイ依頼文を送信
- [ ] デプロイ完了を確認

### Supabase マイグレーション
- [ ] SQL 1 実行（hit_count）
- [ ] SQL 2 実行（size_30、size_under_30）
- [ ] SQL 3 実行（baits テーブル）
- [ ] エラーがないことを確認

### 動作確認
- [ ] Ver.1.1.0 表示を確認
- [ ] 新機能が動作することを確認
- [ ] 既存データが正しく表示されることを確認

---

## 🔍 src/main.ts の該当箇所（参考）

### 編集箇所の例

#### 変更前（練習環境）
```typescript
// 行5-7あたり
// Supabase設定
const SUPABASE_URL = 'https://練習プロジェクト.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.練習用キー...'
```

#### 変更後（本番環境）
```typescript
// 行5-7あたり
// Supabase設定
const SUPABASE_URL = 'https://本番プロジェクト.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.本番用キー...'
```

### ⚠️ 注意点

- **コメントは残してOK**: 日本語コメントはそのままで問題ありません
- **他の部分は変更不要**: SUPABASE_URL と SUPABASE_ANON_KEY の2行だけ変更
- **ダブルクォートを使用**: シングルクォートではなく、ダブルクォート（`"`）で囲む

---

## 💡 Tips

### Tip 1: テキストエディタの選択

src/main.ts を編集する際は、以下のエディタがおすすめです：

- **Windows**: Visual Studio Code（無料）、メモ帳
- **Mac**: Visual Studio Code（無料）、テキストエディット

### Tip 2: Supabase 接続情報の確認方法

```
Supabase ダッシュボード
→ 本番プロジェクトを選択
→ Settings（左サイドバー）
→ API（タブ）
→ Project URL と anon public をコピー
```

### Tip 3: 本番チャットが複数ある場合

本番アプリのチャットが複数ある場合は、最新のチャット（または最も安定しているチャット）を使用してください。

### Tip 4: ZIPファイル名の変更

ZIPファイル名は自由に変更できます。例：
- `record-fishing-v1.1.0.zip`
- `本番用コード_2026-01-31.zip`

---

## 🚨 トラブルシューティング

### Q1: ZIPファイルのアップロードができない

```
A: ファイルサイズが大きすぎる可能性があります
   node_modules フォルダを削除してから ZIP にまとめてください

   削除するフォルダ：
   - node_modules
   - dist
   - .git（隠しフォルダ）
```

### Q2: チャットが「ZIPファイルを展開できない」と言う

```
A: ZIPファイルの形式を確認してください
   - Windowsの標準ZIP形式を使用
   - 7-ZipやRARではなく、ZIP形式にする
```

### Q3: ビルドエラーが発生する

```
A: package.json が正しく含まれているか確認してください
   ZIPファイルの中身：
   - index.html
   - package.json ← 重要
   - vite.config.ts
   - src/
   - その他のファイル
```

### Q4: Supabase 接続エラーが出る

```
A: src/main.ts の接続情報を再確認してください
   - SUPABASE_URL が本番用になっているか
   - SUPABASE_ANON_KEY が本番用になっているか
   - コピペ時に余分なスペースが入っていないか
```

---

## 📞 サポート

### 練習環境のGitHub

```
https://github.com/laurel-otoshikomi/record-fishing-practice
```

### ダウンロードリンク（直接）

```
https://github.com/laurel-otoshikomi/record-fishing-practice/archive/refs/heads/main.zip
```

### ドキュメント

- **詳細移行手順**: PRODUCTION_MIGRATION_GUIDE.md
- **クイック移行ガイド**: MIGRATION_QUICK_GUIDE.md
- **リリースノート**: RELEASE_NOTES_v1.1.0.md

---

## ✅ まとめ

この方法なら、以下のメリットがあります：

1. ✅ **安定した練習環境のコードをそのまま使える**
2. ✅ **本番アプリのチャットでデプロイしてもらえる（安定）**
3. ✅ **Supabase接続情報だけ書き換えればOK（簡単）**
4. ✅ **Git操作が不要（ローカルのみで完結）**
5. ✅ **SQL実行は自分で行える（コントロールできる）**

所要時間は約30分です。落ち着いて作業してください！ 🎣🚀

---

**作成日**: 2026-01-31  
**バージョン**: 1.1.0  
**推奨方法**: ✅ この方法が最も安全で簡単です
