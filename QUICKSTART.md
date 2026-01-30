# 🚀 クイックスタート - record-fishing-practice

練習用アプリを素早くデプロイするための手順です。

---

## ✅ 完了した作業

- ✅ 新しいリポジトリ `record-fishing-practice` を作成
- ✅ 元の `record-fishing` のコードを完全コピー
- ✅ GitHubにプッシュ完了
- ✅ ビルドが正常に動作することを確認済み

---

## 📍 次のステップ（あなたがやること）

### 🎯 最短ルート: Cloudflare Pagesで直接デプロイ

1. **Cloudflareにログイン**
   - https://dash.cloudflare.com/

2. **Workers & Pages > Create application > Pages > Connect to Git**

3. **リポジトリを選択**
   - `laurel-otoshikomi/record-fishing-practice`

4. **ビルド設定**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

5. **環境変数を設定**
   - `VITE_SUPABASE_URL`: （既存プロジェクトと同じ）
   - `VITE_SUPABASE_ANON_KEY`: （既存プロジェクトと同じ）

6. **Save and Deploy をクリック**

7. **完了！** 🎉
   - デプロイURL: `https://record-fishing-practice.pages.dev`

---

## 🔧 オプション: GitHub Actionsで自動デプロイ

詳細は `SETUP_GUIDE.md` を参照してください。

### 簡単な手順

1. **GitHub Secretsを設定**
   - Settings > Secrets and variables > Actions
   - 必要なSecrets:
     - `CLOUDFLARE_API_TOKEN`
     - `CLOUDFLARE_ACCOUNT_ID`
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

2. **ワークフローファイルを追加**
   - GitHubのWeb UIで `.github/workflows/production.yml` を作成
   - 内容は `SETUP_GUIDE.md` を参照

3. **mainブランチにプッシュすると自動デプロイ**

---

## 💻 ローカル開発

```bash
# クローン
git clone https://github.com/laurel-otoshikomi/record-fishing-practice.git
cd record-fishing-practice

# 依存関係インストール
npm install

# 環境変数設定（.envファイルを作成）
cp .env.example .env
# .envファイルを編集して、SupabaseのURLとキーを設定

# 開発サーバー起動
npm run dev
# http://localhost:5173 でアクセス

# ビルド
npm run build
```

---

## 📝 データベースについて

- ✅ 既存の `record-fishing` と**同じSupabaseプロジェクト**を使用
- ✅ 環境変数（URL・キー）は既存プロジェクトと同じものを使う
- ✅ データは共有されます（練習用とはいえ、本番データを扱うので注意）

---

## 🔗 リンク集

- **新リポジトリ**: https://github.com/laurel-otoshikomi/record-fishing-practice
- **元のリポジトリ**: https://github.com/laurel-otoshikomi/record-fishing
- **詳細セットアップ**: `SETUP_GUIDE.md` を参照

---

## ⚠️ 注意事項

1. **同じデータベースを使用**: 練習用アプリでも本番データが表示・編集されます
2. **テスト用データ**: 実験する場合は、テスト用のデータを使用してください
3. **デプロイURL**: `record-fishing-practice.pages.dev` として本番と区別されます

---

## 🎉 これで完了！

あとは Cloudflare Pages でデプロイするだけです。
質問があれば、`SETUP_GUIDE.md` を確認してください！

Happy Fishing! 🎣
