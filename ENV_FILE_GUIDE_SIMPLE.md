# 【超簡単】.env ファイルの編集方法（中学生向け）

## 🎯 やりたいこと

練習環境のコードを本番環境で使うために、**たった2行だけ書き換える**

---

## 📝 ステップ1: 本番環境の「秘密の情報」を探す

### 1-1. Supabase にログインする

1. ブラウザで以下のURLを開く：
   ```
   https://supabase.com/dashboard
   ```

2. メールアドレスとパスワードでログイン

3. **プロジェクト一覧**が表示される
   - 練習用プロジェクト（record-fishing-practice）
   - **本番用プロジェクト（record-fishing）** ← これを探す！

### 1-2. 本番プロジェクトをクリック

**本番用のプロジェクト**をクリックして開く

どれが本番用かわからない場合：
- プロジェクト名に「practice」や「test」が**ついていない**方
- 実際のデータ（本物の釣果記録）が入っている方

### 1-3. 左サイドバーの「Settings」をクリック

画面の左側に縦に並んでいるメニューから、**⚙️ Settings**（歯車マーク）をクリック

### 1-4. 「API」タブをクリック

画面上部に並んでいるタブから、**API** をクリック

### 1-5. 2つの情報をコピーする

以下の2つの情報が表示されているので、コピーします：

#### ① Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
- 長い英数字の羅列が入っている
- 例：`https://abcdefghijklmn.supabase.co`

**コピー方法**：
1. 右側の「📋 コピー」アイコンをクリック
2. または、URLをマウスで選択して Ctrl+C（Mac: Cmd+C）

---

#### ② anon public
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI...
```
- **超長い**文字列（200文字以上）
- `eyJ` で始まる

**コピー方法**：
1. 右側の「📋 コピー」アイコンをクリック
2. 全部コピーされたことを確認（最後まで選択されているか確認）

---

## 📂 ステップ2: ダウンロードしたフォルダを開く

### 2-1. ZIPファイルをダウンロード（まだの場合）

```
https://github.com/laurel-otoshikomi/record-fishing-practice/archive/refs/heads/main.zip
```
↑このリンクをクリック → ダウンロード開始

### 2-2. ZIPファイルを解凍

1. ダウンロードした `record-fishing-practice-main.zip` を右クリック
2. 「すべて展開」（Windows）または「"record-fishing-practice-main"を展開」（Mac）を選択
3. `record-fishing-practice-main` フォルダができる

### 2-3. フォルダを開く

`record-fishing-practice-main` フォルダをダブルクリックして開く

### 2-4. .env ファイルを探す

フォルダの中に `.env` というファイルがあります

**見つからない場合**：
- 隠しファイルの表示設定をONにする必要があります
- **Windows**: エクスプローラー → 表示 → 隠しファイル にチェック
- **Mac**: Finder で `Cmd + Shift + .`（ドット）を押す

---

## ✏️ ステップ3: .env ファイルを編集する

### 3-1. .env ファイルを開く

`.env` ファイルを右クリック → 「プログラムから開く」 → 以下のいずれかを選択：
- **メモ帳**（Windows）
- **テキストエディット**（Mac）
- **Visual Studio Code**（持っている場合）

### 3-2. 現在の内容を確認

こんな内容が表示されます：

```env
VITE_SUPABASE_URL=https://knmwrjywhhjojlmzfbtf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubXdyanl3aGhqb2psbXpmYnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDYwNTEsImV4cCI6MjA4NDg4MjA1MX0.c82D1sVLaXsFh3IaXrDPUZQMGHfZXU4v53DnLZ30QMI
```

この2行が書いてあります。

### 3-3. 1行目を書き換える

#### 書き換え前（練習環境のURL）
```env
VITE_SUPABASE_URL=https://knmwrjywhhjojlmzfbtf.supabase.co
```

#### 書き換え後（本番環境のURL）
```env
VITE_SUPABASE_URL=https://あなたの本番URL.supabase.co
```

**書き換え方**：
1. `https://knmwrjywhhjojlmzfbtf.supabase.co` の部分を選択（`=` の後ろの部分）
2. Delete キーで削除
3. **ステップ1-5でコピーした「Project URL」**を貼り付け（Ctrl+V / Cmd+V）

---

### 3-4. 2行目を書き換える

#### 書き換え前（練習環境のキー）
```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubXdyanl3aGhqb2psbXpmYnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMDYwNTEsImV4cCI6MjA4NDg4MjA1MX0.c82D1sVLaXsFh3IaXrDPUZQMGHfZXU4v53DnLZ30QMI
```

#### 書き換え後（本番環境のキー）
```env
VITE_SUPABASE_ANON_KEY=あなたの本番キー（超長い文字列）
```

**書き換え方**：
1. `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` の部分を選択（`=` の後ろの部分、全部）
2. Delete キーで削除
3. **ステップ1-5でコピーした「anon public」**を貼り付け（Ctrl+V / Cmd+V）

---

### 3-5. 保存する

1. ファイル → 保存（または Ctrl+S / Cmd+S）
2. メモ帳やテキストエディットを閉じる

---

## ✅ 完成イメージ

編集後の `.env` ファイルはこんな感じになります：

```env
VITE_SUPABASE_URL=https://あなたの本番プロジェクトのURL.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.あなたの本番プロジェクトの超長いキー...
```

### ⚠️ 注意点（とても重要！）

以下のような間違いをしないように注意：

#### ❌ ダメな例1: `=` の前後にスペースを入れる
```env
VITE_SUPABASE_URL = https://...
```
↑ `=` の前後にスペースがある → ❌ エラーになる

#### ✅ 正しい例
```env
VITE_SUPABASE_URL=https://...
```
↑ `=` の前後にスペースがない → ✅ OK

---

#### ❌ ダメな例2: 引用符（`"` や `'`）で囲む
```env
VITE_SUPABASE_URL="https://..."
VITE_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIs...'
```
↑ `"` や `'` で囲んでいる → ❌ エラーになる

#### ✅ 正しい例
```env
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```
↑ そのまま貼り付ける → ✅ OK

---

#### ❌ ダメな例3: キーの一部だけコピーする
```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
↑ `...` で途切れている → ❌ 全部コピーされていない

#### ✅ 正しい例
```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzOTM4MjQwMCwiZXhwIjoxOTU0OTU4NDAwfQ.xxxxxxxxxxxxxxxxxxxxx
```
↑ 超長い文字列が全部入っている → ✅ OK

---

## 🔍 確認方法

編集が正しくできているか確認する方法：

### 確認1: 2行だけになっているか
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
↑ この2行だけ（3行目以降は何も書かない）

### 確認2: URLが本番用になっているか
```
VITE_SUPABASE_URL の後ろに、本番プロジェクトのURLが入っているか
```

### 確認3: キーが本番用になっているか
```
VITE_SUPABASE_ANON_KEY の後ろに、本番プロジェクトの超長いキーが入っているか
```

---

## 📸 画像で確認（イメージ）

### Supabase ダッシュボードの見た目

```
┌─────────────────────────────────────────────┐
│ Supabase Dashboard                          │
├─────────────────────────────────────────────┤
│ 左サイドバー           │ メイン画面          │
│                       │                     │
│ 📊 Home               │ Project URL         │
│ 📁 Table Editor       │ https://xxxxx.supabase.co │
│ 🔐 Authentication     │ [📋 コピー]         │
│ 📊 Database           │                     │
│ 🔧 Functions          │ anon public         │
│ 🌐 Storage            │ eyJhbGciOiJIUzI1... │
│ ⚙️ Settings ← クリック │ [📋 コピー]         │
│   ├─ General         │                     │
│   ├─ API ← クリック  │                     │
│   └─ ...             │                     │
└─────────────────────────────────────────────┘
```

### .env ファイルの編集イメージ

```
┌──────────────────────────────────────────┐
│ メモ帳 - .env                             │
├──────────────────────────────────────────┤
│ ファイル(F)  編集(E)  表示(V)            │
├──────────────────────────────────────────┤
│                                          │
│ VITE_SUPABASE_URL=https://xxxxx.supabase.co │
│ VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI...│
│                                          │
│ ← この2行を編集する                       │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🎓 まとめ（やることリスト）

### ✅ 1. Supabase で本番プロジェクトを開く
- https://supabase.com/dashboard
- 本番プロジェクトをクリック
- Settings → API をクリック

### ✅ 2. 2つの情報をコピー
- ① Project URL（`https://xxxxx.supabase.co`）
- ② anon public（`eyJhbGciOiJIUzI1NiIs...` 超長い文字列）

### ✅ 3. .env ファイルを開く
- ダウンロードしたフォルダの中の `.env` ファイル
- メモ帳で開く

### ✅ 4. 2行を書き換える
- 1行目: `VITE_SUPABASE_URL=` の後ろに①をコピペ
- 2行目: `VITE_SUPABASE_ANON_KEY=` の後ろに②をコピペ

### ✅ 5. 保存する
- Ctrl+S（Mac: Cmd+S）で保存
- メモ帳を閉じる

---

## ❓ よくある質問

### Q1: どれが本番プロジェクトかわからない

**A**: プロジェクト一覧で、以下を確認してください：
- プロジェクト名に「practice」や「test」が**ついていない**方
- 実際のデータ（本物の釣果記録）が入っている方
- よく使っている方

わからない場合は、両方のプロジェクトを開いて、Table Editor で logs テーブルを確認してください。
本物のデータが入っている方が本番プロジェクトです。

---

### Q2: .env ファイルが見つからない

**A**: 隠しファイルの表示設定をONにしてください

#### Windows
1. エクスプローラーを開く
2. 「表示」タブをクリック
3. 「隠しファイル」にチェックを入れる

#### Mac
1. Finder を開く
2. `Cmd + Shift + .`（ドット）を押す
3. 灰色のファイルが表示される

---

### Q3: anon public が長すぎてコピーできない

**A**: 以下の方法でコピーしてください：

1. **📋 コピーアイコン**をクリック（推奨）
   - Supabase ダッシュボードの右側にあるコピーアイコンをクリック
   - 自動的に全部コピーされる

2. **手動でコピー**
   - マウスで文字列を選択
   - 最初から最後まで全部選択されていることを確認
   - Ctrl+C（Mac: Cmd+C）でコピー

---

### Q4: 保存したのにエラーが出る

**A**: 以下を確認してください：

1. `=` の前後にスペースがないか
2. `"` や `'` で囲んでいないか
3. URLとキーが全部コピーされているか（途中で切れていないか）
4. 改行が入っていないか（2行だけになっているか）

---

### Q5: 本番プロジェクトのURLとキーをどこかにメモしておくべき？

**A**: はい、メモしておくと便利です！

安全な場所にメモ：
- パスワード管理アプリ（1Password、LastPass等）
- ローカルのテキストファイル（Dropboxに保存等）
- 紙にメモ（安全な場所に保管）

⚠️ **絶対にしてはいけないこと**：
- GitHubに公開する
- SNSに投稿する
- 他人に教える

---

## 🚀 次のステップ

`.env` ファイルの編集が終わったら、次は：

1. 不要なフォルダを削除（node_modules、dist、.git）
2. フォルダをZIPにまとめる
3. 本番アプリのチャットにアップロード

詳しくは `LOCAL_MIGRATION_GUIDE_UPDATED.md` を参照してください！

---

**作成日**: 2026-01-31  
**対象**: 中学生でもわかる説明  
**所要時間**: 約5〜10分

この説明でわからないことがあれば、いつでも聞いてください！ 🎣
