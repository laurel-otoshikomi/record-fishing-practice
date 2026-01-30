# 🎯 record-fishing-practice セットアップガイド

このガイドでは、練習用リポジトリをCloudflare Pagesにデプロイする方法を詳しく説明します。

---

## 📋 前提条件

- GitHub アカウント
- Cloudflare アカウント
- Supabase プロジェクト（既存のものを使用）

---

## 🚀 Step 1: GitHub Secretsの設定

1. **リポジトリにアクセス**
   ```
   https://github.com/laurel-otoshikomi/record-fishing-practice
   ```

2. **Settings > Secrets and variables > Actions に移動**

3. **以下のSecretsを追加** （"New repository secret" をクリック）

   | Secret名 | 説明 | 取得方法 |
   |---------|------|---------|
   | `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン | Cloudflareダッシュボード > My Profile > API Tokens > Create Token |
   | `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントID | Cloudflareダッシュボード > Workers & Pages > 右サイドバー |
   | `VITE_SUPABASE_URL` | SupabaseプロジェクトURL | Supabase Dashboard > Settings > API > Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase匿名キー | Supabase Dashboard > Settings > API > Project API keys > anon public |

### Cloudflare API Tokenの作成方法

1. Cloudflareダッシュボードにログイン
2. 右上のアカウントアイコン > My Profile > API Tokens
3. "Create Token" をクリック
4. "Edit Cloudflare Workers" テンプレートを使用
5. または "Create Custom Token" で以下の権限を設定：
   - Account > Cloudflare Pages: Edit
   - Zone > Workers Routes: Edit (必要に応じて)
6. トークンを生成してコピー（一度しか表示されません！）

---

## 🌐 Step 2: Cloudflare Pagesプロジェクトの作成

### 方法A: Cloudflareダッシュボードから作成

1. **Cloudflareダッシュボードにログイン**
   ```
   https://dash.cloudflare.com/
   ```

2. **Workers & Pages に移動**

3. **"Create application" > "Pages" > "Connect to Git"**

4. **GitHubリポジトリを選択**
   - `laurel-otoshikomi/record-fishing-practice` を選択

5. **ビルド設定**
   ```
   Framework preset: None（またはVite）
   Build command: npm run build
   Build output directory: dist
   ```

6. **環境変数を設定**（オプション - GitHub Actionsで設定済みの場合は不要）
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

7. **"Save and Deploy" をクリック**

### 方法B: GitHub Actionsで自動デプロイ

1. **GitHubのWeb UIでワークフローファイルを作成**

   リポジトリページで "Add file" > "Create new file" をクリック

2. **ファイル名を入力**
   ```
   .github/workflows/production.yml
   ```

3. **以下の内容を貼り付け**
   ```yaml
   name: Production Deployment

   on:
     push:
       branches:
         - main

   jobs:
     deploy-production:
       runs-on: ubuntu-latest
       
       permissions:
         contents: read
         deployments: write
       
       steps:
         - name: Checkout code
           uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Build
           env:
             VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
             VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
           run: npm run build

         - name: Deploy to Cloudflare Pages
           uses: cloudflare/pages-action@v1
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             projectName: record-fishing-practice
             directory: dist
   ```

4. **"Commit changes" をクリック**

5. **自動デプロイが開始されます**
   - Actions タブで進行状況を確認できます

---

## 🔍 Step 3: デプロイの確認

### GitHub Actionsでの確認

1. **リポジトリの "Actions" タブに移動**
   ```
   https://github.com/laurel-otoshikomi/record-fishing-practice/actions
   ```

2. **最新のワークフロー実行を確認**
   - ✅ グリーンチェックマーク = 成功
   - ❌ レッドX = 失敗（ログを確認）

### Cloudflareでの確認

1. **Cloudflareダッシュボード > Workers & Pages**

2. **"record-fishing-practice" プロジェクトを選択**

3. **デプロイ履歴を確認**

4. **公開URLにアクセス**
   ```
   https://record-fishing-practice.pages.dev
   ```

---

## 🔧 Step 4: ローカル開発環境のセットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/laurel-otoshikomi/record-fishing-practice.git
cd record-fishing-practice
```

### 2. 環境変数を設定

`.env` ファイルを作成：

```bash
cp .env.example .env
```

`.env` を編集：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 依存関係をインストール

```bash
npm install
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く

### 5. ビルド（本番用）

```bash
npm run build
```

ビルドされたファイルは `dist/` ディレクトリに生成されます。

---

## 📝 開発フロー

### 通常の開発作業

1. **ブランチを作成**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **コードを変更**
   ```bash
   # ファイルを編集
   ```

3. **ローカルでテスト**
   ```bash
   npm run dev
   ```

4. **コミット＆プッシュ**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin feature/new-feature
   ```

5. **プルリクエストを作成**
   - GitHub UIでPRを作成
   - レビュー後、mainブランチにマージ

6. **自動デプロイ**
   - mainブランチにマージされると自動的にデプロイ

### 緊急の変更

```bash
# mainブランチで直接作業（推奨しない）
git checkout main
# ... 変更を加える
git add .
git commit -m "hotfix: Fix critical bug"
git push origin main
# 自動的にデプロイされる
```

---

## ⚠️ トラブルシューティング

### デプロイが失敗する場合

1. **GitHub Actionsのログを確認**
   - Actions タブ > 失敗したワークフロー > ログを確認

2. **よくあるエラー**

   **エラー: Secrets not found**
   - 解決: GitHub Secretsが正しく設定されているか確認

   **エラー: Build failed**
   - 解決: `npm run build` がローカルで成功するか確認

   **エラー: Cloudflare API error**
   - 解決: APIトークンの権限とアカウントIDを確認

### ローカル開発で問題が発生する場合

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリア
npm cache clean --force
```

---

## 🔗 参考リンク

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 💡 Tips

- **プレビューデプロイ**: プルリクエストを作成すると、プレビュー環境が自動的に作成されます（preview.yml を追加した場合）
- **環境変数の更新**: Secretsを変更した場合、再度デプロイする必要があります
- **ロールバック**: Cloudflareダッシュボードから以前のデプロイに簡単にロールバックできます
- **カスタムドメイン**: Cloudflareダッシュボードでカスタムドメインを設定できます

---

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. このガイドのトラブルシューティングセクション
2. GitHub ActionsのログとCloudflareのデプロイログ
3. 元のリポジトリ（record-fishing）と設定を比較

---

Happy Coding! 🎣✨
