# record-fishing-practice 🎣

## 📝 概要

このリポジトリは `record-fishing` の練習用コピーです。
本番環境を壊すことなく、安全に実験や変更を試すことができます。

**元のリポジトリ**: https://github.com/laurel-otoshikomi/record-fishing

---

## 🚀 セットアップ手順

### 1. ローカル開発

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# ビルド
npm run build
```

### 2. Cloudflare Pages デプロイ

このプロジェクトをCloudflare Pagesにデプロイするには、以下の手順が必要です：

#### 手順A: GitHubのWeb UIでワークフローファイルを追加

1. **GitHubリポジトリにアクセス**
   - https://github.com/laurel-otoshikomi/record-fishing-practice

2. **ワークフローファイルを作成**
   
   `.github/workflows/production.yml` を作成：
   ```yaml
   name: Production Deployment

   on:
     push:
       branches:
         - main

   jobs:
     deploy-production:
       runs-on: ubuntu-latest
       
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

3. **GitHub Secretsを設定**
   
   リポジトリの Settings > Secrets and variables > Actions で以下を追加：
   
   - `CLOUDFLARE_API_TOKEN` - Cloudflare APIトークン
   - `CLOUDFLARE_ACCOUNT_ID` - CloudflareアカウントID
   - `VITE_SUPABASE_URL` - SupabaseプロジェクトURL
   - `VITE_SUPABASE_ANON_KEY` - Supabase匿名キー

4. **Cloudflare Pagesプロジェクトを作成**
   
   Cloudflareダッシュボードで:
   - Workers & Pages > Create application > Pages
   - プロジェクト名: `record-fishing-practice`
   - GitHubと連携（または手動デプロイ）

#### 手順B: 手動デプロイ（ローカルから）

```bash
# ビルド
npm run build

# Cloudflare Pagesにデプロイ
npx wrangler pages deploy dist --project-name=record-fishing-practice
```

---

## 🌐 デプロイURL

デプロイが成功すると、以下のURLでアクセスできます：
- **本番環境**: https://record-fishing-practice.pages.dev

---

## 📊 使用技術

- **Frontend**: Vite + TypeScript
- **Database**: Supabase（既存のものを共有）
- **Hosting**: Cloudflare Pages
- **CI/CD**: GitHub Actions

---

## 🔗 関連リンク

- [元のリポジトリ](https://github.com/laurel-otoshikomi/record-fishing)
- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [Supabase ドキュメント](https://supabase.com/docs)

# Build trigger Fri Jan 30 09:51:22 UTC 2026
# Trigger rebuild Fri Jan 30 10:43:02 UTC 2026

# Force rebuild Fri Jan 30 13:22:27 UTC 2026
# Rebuild Fri Jan 30 13:38:09 UTC 2026
# Force rebuild 2026-01-30 13:54:14
# Force redeploy 2026-01-30 13:58:32
# Trigger new deployment 2026-01-30 14:01:52
