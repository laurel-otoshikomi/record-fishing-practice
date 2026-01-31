# 【最新版】ローカル経由での本番環境移行手順

## 🎯 この方法が最適な理由

- ✅ **安定した練習環境のコードをそのまま使える**
- ✅ **本番アプリのチャットでデプロイしてもらえる（デプロイが安定）**
- ✅ **`.env`ファイルだけ書き換えればOK（超簡単）**
- ✅ **Git操作が不要**
- ✅ **あなたがSQL実行をコントロールできる**

---

## 📋 全体の流れ（所要時間: 約30分）

```
1. GitHubから練習環境のコードをダウンロード（5分）
   ↓
2. .env ファイルを本番用に書き換え（5分）
   ↓
3. ZIPファイルにまとめる（2分）
   ↓
4. 本番アプリのチャットにアップロード & デプロイ依頼（10分）
   ↓
5. Supabase SQL実行（あなたが実施）（5分）
   ↓
6. 動作確認（3分）
```

---

## ステップ1: 練習環境のコードをダウンロード

### 📥 ダウンロード方法

#### 方法A: 直接ダウンロードリンク（最も簡単）

以下のリンクをクリックするだけ：
```
https://github.com/laurel-otoshikomi/record-fishing-practice/archive/refs/heads/main.zip
```

#### 方法B: GitHubから手動ダウンロード

1. https://github.com/laurel-otoshikomi/record-fishing-practice にアクセス
2. 緑色の「Code」ボタンをクリック
3. 「Download ZIP」を選択

### 📂 解凍

1. ダウンロードした `record-fishing-practice-main.zip` を解凍
2. `record-fishing-practice-main` フォルダができる

---

## ステップ2: .env ファイルを本番用に書き換え

### 📁 編集するファイル

```
record-fishing-practice-main/
└── .env  ← このファイルだけ編集（1ファイルのみ！）
```

### 🔍 現在の.envファイル（練習環境）

```env
VITE_SUPABASE_URL=https://knmwrjywhhjojlmzfbtf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubXdyanl3aGhqb2psbXpmYnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDYwNTEsImV4cCI6MjA4NDg4MjA1MX0.c82D1sVLaXsFh3IaXrDPUZQMGHfZXU4v53DnLZ30QMI
```

### ✏️ 本番用に書き換え

#### Step 1: Supabase ダッシュボードで本番プロジェクトの情報を取得

1. https://supabase.com/dashboard にログイン
2. **本番プロジェクト**を選択
3. 左サイドバーの「Settings」をクリック
4. 「API」タブをクリック
5. 以下をコピー：
   - **Project URL**: `https://あなたの本番プロジェクト.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長い文字列）

#### Step 2: .env ファイルを編集

`.env` ファイルをメモ帳やテキストエディタで開いて、以下のように書き換える：

```env
VITE_SUPABASE_URL=https://あなたの本番プロジェクト.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.あなたの本番anon_key...
```

#### ⚠️ 注意点

- **2行だけ**: VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY の2行だけ変更
- **イコール前後にスペース不要**: `VITE_SUPABASE_URL=https://...` のように、`=` の前後にスペースを入れない
- **引用符不要**: URLやキーを `"` や `'` で囲まない

#### ✅ 編集後の確認

```env
VITE_SUPABASE_URL=https://本番のURL.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...本番のキー
```

このように、本番のURL とキーになっていればOK！

---

## ステップ3: 不要なファイルを削除（ZIPサイズを小さくする）

### 📂 削除するフォルダ

以下のフォルダは削除してOK（容量削減のため）：

```
record-fishing-practice-main/
├── node_modules/  ← 削除（大きいフォルダ）
├── dist/          ← 削除（ビルド成果物）
└── .git/          ← 削除（隠しフォルダ、Git履歴）
```

### 🗑️ 削除方法

#### Windows
- フォルダを右クリック → 削除
- `.git` フォルダは隠しフォルダなので、表示設定で「隠しファイル」を表示してから削除

#### Mac
- フォルダを右クリック → ゴミ箱に入れる
- `.git` フォルダは `Cmd+Shift+.` で隠しファイルを表示してから削除

### ⚠️ 削除してはいけないファイル

以下は**絶対に削除しないでください**：
- `index.html`
- `package.json`
- `vite.config.ts`
- `src/` フォルダ
- `.env` ファイル（編集したファイル）

---

## ステップ4: ZIPファイルにまとめる

### Windows の場合

1. `record-fishing-practice-main` フォルダを右クリック
2. 「送る」→「圧縮（zip形式）フォルダー」を選択
3. `record-fishing-practice-main.zip` ができる

### Mac の場合

1. `record-fishing-practice-main` フォルダを右クリック
2. 「"record-fishing-practice-main"を圧縮」を選択
3. `record-fishing-practice-main.zip` ができる

### 📦 ZIPファイルサイズの確認

- **適切なサイズ**: 1〜5MB程度
- **大きすぎる場合**: node_modules や dist フォルダが残っている可能性あり

---

## ステップ5: 本番アプリのチャットにアップロード

### 🗨️ チャットでの依頼文（このままコピペOK）

```
【本番環境のデプロイ依頼】

record-fishing アプリを Ver.1.1.0 にアップデートしたいです。
添付のZIPファイルは、練習環境で完成したコードです。

■ 対応内容
1. 添付のZIPファイルを /home/user/webapp/record-fishing に展開
2. npm install を実行
3. npm run build を実行（ビルドテスト）
4. Git に commit & push
5. Cloudflare Pages にデプロイ

■ 注意事項
- .env ファイルの Supabase 接続情報は本番用に書き換え済みです
- package.json のバージョンは 1.1.0 です
- vite.config.ts のバージョンも 1.1.0 です
- 既存のコードは上書きして問題ありません

■ 確認ポイント
- ビルドが成功すること
- デプロイ後、Ver.1.1.0 が表示されること

よろしくお願いします！
```

### 📎 ファイルのアップロード手順

1. **本番アプリのチャット**を開く
2. 入力欄のクリップアイコン（📎）をクリック
3. `record-fishing-practice-main.zip` を選択
4. 上記の依頼文を入力
5. 送信

---

## ステップ6: チャットでの進行イメージ

### 👤 あなた
```
【本番環境のデプロイ依頼】
（依頼文を送信 + ZIPファイルを添付）
```

### 🤖 AI（本番アプリのチャット）
```
承知しました！record-fishing を Ver.1.1.0 にアップデートします。

【進行状況】
✅ ZIPファイルを /home/user/webapp/record-fishing に展開
✅ npm install 実行中...
✅ npm run build 実行中...
   → ビルド成功！
✅ Git commit & push 実行中...
✅ Cloudflare Pages デプロイ中...
   → デプロイ完了！

【結果】
✅ デプロイが完了しました
🌐 https://record-fishing.pages.dev
📦 Ver.1.1.0 が表示されていることを確認してください

次に、Supabase のマイグレーションを実行してください。
```

---

## ステップ7: Supabase マイグレーション（あなたが実施）

### 📍 実行場所
```
Supabase ダッシュボード
→ 本番プロジェクトを選択
→ SQL Editor
```

### 📝 SQL を順番に実行

#### SQL 1: あたり数フィールドの追加
```sql
-- あたり数フィールドを追加
ALTER TABLE logs ADD COLUMN IF NOT EXISTS hit_count INTEGER;

-- コメントを追加
COMMENT ON COLUMN logs.hit_count IS 'あたりがあった回数（任意）';
```
→ 「RUN」をクリック → "Success" を確認

---

#### SQL 2: サイズ分類フィールドの追加
```sql
-- 30-39cm フィールドを追加
ALTER TABLE logs ADD COLUMN IF NOT EXISTS size_30 INTEGER DEFAULT 0;

-- <30cm フィールドを追加
ALTER TABLE logs ADD COLUMN IF NOT EXISTS size_under_30 INTEGER DEFAULT 0;

-- コメントを追加
COMMENT ON COLUMN logs.size_30 IS '30-39cm のサイズ';
COMMENT ON COLUMN logs.size_under_30 IS '30cm未満のサイズ';
```
→ 「RUN」をクリック → "Success" を確認

---

#### SQL 3: baits テーブルの作成
```sql
-- baits テーブルを作成
CREATE TABLE IF NOT EXISTS baits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_baits_auth_user_id ON baits(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_baits_name ON baits(name);

-- RLS（Row Level Security）を有効化
ALTER TABLE baits ENABLE ROW LEVEL SECURITY;

-- ポリシーを作成（ユーザーは自分のデータのみ閲覧・編集可能）
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
→ 「RUN」をクリック → "Success" を確認

---

### ✅ マイグレーション完了の確認

1. Supabase ダッシュボード → **Table Editor**
2. `logs` テーブルを確認
   - `hit_count` カラムがあることを確認
   - `size_30` カラムがあることを確認
   - `size_under_30` カラムがあることを確認
3. `baits` テーブルを確認
   - テーブルが作成されていることを確認

---

## ステップ8: 動作確認

### 1. 本番アプリにアクセス
```
https://record-fishing.pages.dev
```

### 2. 強制リロード（キャッシュクリア）
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### 3. バージョン確認
```
右上に「Ver.1.1.0」が表示されることを確認
```

### 4. 新機能の動作確認

#### ✅ LOGタブ
- [ ] **あたり数（HIT COUNT）**フィールドが表示される
- [ ] **釣果数0（ボーズ）**を記録できる
- [ ] サイズ内訳に**30-39cm**、**<30cm**がある
- [ ] バリデーションが動作する（あたり数 ≥ 釣果数）

#### ✅ DATAタブ
- [ ] ログ一覧で**「ボーズ」**が表示される
- [ ] ログ一覧で**「あたり: X回」**が表示される
- [ ] 月別グラフが**6段階**で表示される
- [ ] 既存のログが正しく表示される（データ損失なし）

#### ✅ AREAタブ
- [ ] **AREA タブ**が表示される
- [ ] エリア・場所・ポイントの追加ができる
- [ ] 編集・削除ができる

#### ✅ BAITタブ
- [ ] **BAIT タブ**が表示される
- [ ] 餌の追加ができる
- [ ] 編集・削除ができる
- [ ] LOGタブのドロップダウンに反映される

### 5. 既存データの確認
- [ ] 既存の釣果ログが正しく表示される
- [ ] 既存のログを編集できる
- [ ] CSV出力が正常に動作する
- [ ] グラフが正しく表示される

### 6. エラーチェック
```
F12 キーを押す → Console タブ
→ エラーが表示されていないことを確認
```

---

## 📋 チェックリスト（作業前の確認）

### 移行前の準備
- [ ] **本番データをCSVバックアップ**（DATA タブ → EXPORT CSV）
- [ ] **Supabase データベースをバックアップ**（Database → Backups → Create Backup）

### ローカル作業
- [ ] 練習環境のコードをGitHubからダウンロード
- [ ] ZIPファイルを解凍
- [ ] `.env` ファイルを本番用に書き換え
- [ ] 不要なフォルダを削除（node_modules、dist、.git）
- [ ] フォルダをZIPにまとめる

### チャットでの依頼
- [ ] 本番アプリのチャットを開く
- [ ] ZIPファイルをアップロード
- [ ] デプロイ依頼文を送信
- [ ] AI の応答を確認
- [ ] デプロイ完了を確認

### Supabase マイグレーション
- [ ] SQL 1 実行（hit_count）
- [ ] SQL 2 実行（size_30、size_under_30）
- [ ] SQL 3 実行（baits テーブル）
- [ ] エラーがないことを確認
- [ ] Table Editor で新しいカラムを確認

### 動作確認
- [ ] Ver.1.1.0 表示を確認
- [ ] 新機能が動作することを確認（LOG/DATA/AREA/BAITタブ）
- [ ] 既存データが正しく表示されることを確認
- [ ] ブラウザコンソールでエラーがないことを確認
- [ ] 複数のブラウザで動作確認
- [ ] スマホで動作確認

---

## 🚨 トラブルシューティング

### Q1: ZIPファイルのアップロードができない

**原因**: ファイルサイズが大きすぎる

**解決策**:
```
node_modules、dist、.git フォルダを削除してから
ZIPにまとめてください

削除後のZIPサイズ: 1〜5MB程度が目安
```

---

### Q2: AIが「.env ファイルが見つからない」と言う

**原因**: .env ファイルが削除されている、または隠れている

**解決策**:
```
1. ZIPファイルを解凍し直す
2. .env ファイルが存在することを確認
   （隠しファイルの表示設定をONにする）
3. .env ファイルを編集
4. 再度ZIPにまとめる
```

---

### Q3: ビルドエラーが発生する

**原因**: 必要なファイルが不足している

**解決策**:
```
以下のファイルが含まれていることを確認：
- index.html
- package.json
- vite.config.ts
- src/ フォルダ
- .env ファイル

不足している場合は、ZIPファイルを作り直してください
```

---

### Q4: デプロイ後、Ver.1.1.0 が表示されない

**原因**: ブラウザのキャッシュ

**解決策**:
```
1. Ctrl+Shift+R（Mac: Cmd+Shift+R）で強制リロード
2. シークレットモード（プライベートブラウジング）で確認
3. ブラウザのキャッシュを完全にクリア
```

---

### Q5: Supabase 接続エラーが出る

**原因**: .env ファイルの設定が間違っている

**解決策**:
```
1. .env ファイルを再確認
   - VITE_SUPABASE_URL が本番用になっているか
   - VITE_SUPABASE_ANON_KEY が本番用になっているか
   - = の前後にスペースがないか
   - 引用符（" や '）で囲んでいないか

2. 正しい例:
   VITE_SUPABASE_URL=https://本番URL.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

3. 間違った例:
   VITE_SUPABASE_URL = "https://本番URL.supabase.co"
   （= の前後にスペース、引用符で囲んでいる）
```

---

### Q6: 既存データが表示されない

**原因**: マイグレーションが正しく実行されていない

**解決策**:
```
1. Supabase ダッシュボード → Table Editor
2. logs テーブルを確認
   - hit_count カラムが存在するか
   - size_30 カラムが存在するか
   - size_under_30 カラムが存在するか
3. 存在しない場合は、SQL を再実行
```

---

## 💡 Tips

### Tip 1: .env ファイルの編集に推奨するエディタ

- **Visual Studio Code**（無料、Windows/Mac 対応）
  - https://code.visualstudio.com/
- **メモ帳**（Windows 標準）
- **テキストエディット**（Mac 標準）

### Tip 2: 隠しファイル（.env や .git）の表示方法

#### Windows
```
エクスプローラー → 表示 → 隠しファイル → チェックを入れる
```

#### Mac
```
Finder で Cmd + Shift + . （ドット）を押す
```

### Tip 3: ZIPファイル名の変更

ZIPファイル名は自由に変更できます。例：
```
record-fishing-v1.1.0.zip
本番用コード_2026-01-31.zip
production-deployment.zip
```

### Tip 4: 複数のブラウザでテスト

動作確認は複数のブラウザで行うことを推奨：
```
- Chrome
- Safari
- Firefox
- Edge
- スマホのブラウザ（iOS Safari、Android Chrome）
```

---

## 📞 サポート・リンク集

### 📥 ダウンロードリンク（直接）
```
https://github.com/laurel-otoshikomi/record-fishing-practice/archive/refs/heads/main.zip
```

### 📄 ドキュメント
- **GitHub リポジトリ**: https://github.com/laurel-otoshikomi/record-fishing-practice
- **リリースノート**: https://github.com/laurel-otoshikomi/record-fishing-practice/blob/main/RELEASE_NOTES_v1.1.0.md
- **ユーザーマニュアル**: https://github.com/laurel-otoshikomi/record-fishing-practice/blob/main/USER_MANUAL_UPDATED.md

### 🌐 アプリ
- **練習環境**: https://record-fishing-practice.pages.dev
- **本番環境**: https://record-fishing.pages.dev

### 🔧 管理画面
- **Supabase**: https://supabase.com/dashboard
- **Cloudflare**: https://dash.cloudflare.com/

---

## ✅ まとめ

この方法なら、以下のメリットがあります：

1. ✅ **`.env` ファイルだけ編集すればOK**（1ファイルのみ）
2. ✅ **安定した練習環境のコードをそのまま使える**
3. ✅ **本番アプリのチャットでデプロイしてもらえる**（デプロイが安定）
4. ✅ **Git操作が不要**（ローカルのみで完結）
5. ✅ **SQL実行は自分で行える**（コントロールできる）

### 所要時間
- ダウンロード: 5分
- .env 編集: 5分
- ZIP作成: 2分
- チャットでデプロイ: 10分
- SQL実行: 5分
- 動作確認: 3分
- **合計: 約30分**

落ち着いて作業してください！ 🎣🚀

---

**作成日**: 2026-01-31  
**バージョン**: 1.1.0  
**推奨方法**: ✅ この方法が最も安全で簡単です
