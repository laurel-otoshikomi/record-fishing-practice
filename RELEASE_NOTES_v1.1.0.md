# Release Notes - Version 1.1.0

## 🎉 SPARCLE BLACK - Fishing Record Edition v1.1.0

リリース日: 2026-01-31

---

## ✨ 新機能

### 1. あたり数記録機能
- **あたり数 (HIT COUNT)** を任意で記録可能
- 釣果数とは別に、あたりがあった回数を記録
- DATA タブで「あたり: X回」と表示
- 掛かり率の分析が可能に

**バリデーション**:
- あたり数 ≥ 釣果数（入力時のみ）
- エラーメッセージ: 「あたり数は釣果数以上である必要があります」

---

### 2. ボーズ（釣れなかった）記録機能
- 釣果数を `0` にすることで、釣れなかった日も記録可能
- DATA タブで「**ボーズ**」と表示
- 全ての釣行を記録できるようになりました

---

### 3. サイズ分類の拡張
- **30-39cm**（緑色）を追加
- **<30cm**（灰色）を追加
- 小型魚の記録が可能に

**不明サイズの自動計算**:
- サイズ未入力の釣果を「**不明**」（濃灰色）として自動計算
- 計算式: 不明 = 釣果数 - (年無し + 45-49 + 40-44 + 30-39 + <30)

**サイズ分類（全6段階）**:
| サイズ | 色 | 説明 |
|--------|-----|------|
| 50cm+ | 金色 (#c5a059) | 年無し |
| 45-49cm | 赤 (#cf4545) | - |
| 40-44cm | 青 (#4a90e2) | - |
| 30-39cm | 緑 (#66bb6a) | 🆕 NEW! |
| <30cm | 灰色 (#999999) | 🆕 NEW! |
| 不明 | 濃灰色 (#555555) | 🆕 未入力分 |

---

### 4. エリア管理機能（AREA タブ）
- エリア・場所・ポイントを自由に追加・編集・削除
- 階層構造での管理
- 削除時の確認ダイアログ
- 削除件数の表示

**階層構造**:
```
エリア名
  └─ 場所名
      └─ ポイント名
```

---

### 5. 餌管理機能（BAIT タブ）
- 餌を自由に追加・編集・削除
- デフォルト餌とカスタム餌の管理
- LOG タブのドロップダウンに自動反映

**デフォルト餌**:
- イガイ
- ミジ貝
- フジツボ
- パイプ
- カニ
- 赤イソメ
- 青コガネ

---

### 6. バリデーション機能の強化

#### サイズ内訳チェック
```
年無し + 45-49 + 40-44 + 30-39 + <30 ≤ 釣果数
```
エラー: 「サイズ内訳がトータルを超えています」

#### あたり数チェック
```
あたり数 ≥ 釣果数（入力時のみ）
```
エラー: 「あたり数は釣果数以上である必要があります」

#### 餌別内訳チェック
```
サブ餌合計 ≤ 釣果数
```
エラー: 「エサ内訳がトータルを超えています」

---

## 📊 改善点

### DATA タブの拡張
- **月別グラフ**: 6段階のサイズ分類に対応
- **ログ一覧**: ボーズの表示、あたり数の表示

### UI の統一
- 全タブのボタンデザインを統一
- Edit ボタン: 青枠 (#4a90e2)
- Delete ボタン: 赤枠 (#e74c3c)
- 削除確認ダイアログの改善

---

## 🗄️ データベース変更

### 新しいカラム

#### logs テーブル
- `hit_count` (INTEGER): あたり数（任意）
- `size_30` (INTEGER): 30-39cm のサイズ数
- `size_under_30` (INTEGER): 30cm未満のサイズ数

### 必要なマイグレーション

**Supabase SQL**:
```sql
-- Add hit_count column
ALTER TABLE logs ADD COLUMN hit_count INTEGER;

-- Add size_30 column
ALTER TABLE logs ADD COLUMN size_30 INTEGER DEFAULT 0;

-- Add size_under_30 column
ALTER TABLE logs ADD COLUMN size_under_30 INTEGER DEFAULT 0;
```

---

## 🐛 バグ修正

- ログインボタンが反応しない問題を修正
- 餌テーブルが存在しない場合のエラーハンドリングを追加
- バリデーションの不整合を修正

---

## 📝 ドキュメント

### 新規ドキュメント
- `FEATURE_HIT_COUNT_BOZU.md` - あたり数とボーズ機能の詳細
- `SUPABASE_MIGRATION_HIT_COUNT.md` - あたり数のマイグレーションガイド
- `SUPABASE_MIGRATION_SIZE_CATEGORIES.md` - サイズ分類のマイグレーションガイド
- `VALIDATION_RULES.md` - バリデーションルールの詳細
- `USER_MANUAL_UPDATED.md` - 更新版ユーザーマニュアル

### 更新ドキュメント
- `BAIT_MANAGEMENT_SETUP.md` - 餌管理機能のセットアップガイド
- `AREA_MANAGEMENT_GUIDE.md` - エリア管理機能のガイド

---

## 🎯 この版で可能になった分析

1. **掛かり率分析**: あたり数 ÷ 釣果数
2. **サイズ別詳細分析**: 6段階のサイズ分類
3. **ボーズ日の記録**: 釣れなかった日の傾向分析
4. **未入力データの可視化**: 不明サイズの把握
5. **カスタムエリア管理**: 自由な場所の追加
6. **カスタム餌管理**: 独自の餌の記録

---

## 📦 配布

### GitHub
- リポジトリ: https://github.com/laurel-otoshikomi/record-fishing-practice
- ブランチ: main
- コミット: 1325a40

### Cloudflare Pages
- URL: https://record-fishing-practice.pages.dev

---

## ⬆️ アップグレード手順

### 1. Supabase マイグレーション

以下の SQL を Supabase の SQL Editor で実行してください：

```sql
-- Add hit_count column
ALTER TABLE logs ADD COLUMN hit_count INTEGER;
COMMENT ON COLUMN logs.hit_count IS 'あたり数（optional）';

-- Add size_30 column
ALTER TABLE logs ADD COLUMN size_30 INTEGER DEFAULT 0;
COMMENT ON COLUMN logs.size_30 IS '30-39cm のサイズ数';

-- Add size_under_30 column
ALTER TABLE logs ADD COLUMN size_under_30 INTEGER DEFAULT 0;
COMMENT ON COLUMN logs.size_under_30 IS '30cm未満のサイズ数';

-- Create baits table (if not exists)
CREATE TABLE IF NOT EXISTS baits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bait_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE baits ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Insert default baits
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

### 2. アプリの更新

- 強制リロード: `Ctrl + Shift + R` (Windows/Linux) または `Command + Shift + R` (Mac)
- バージョン表示が `Ver.1.1.0` になっていることを確認

---

## 🙏 謝辞

このバージョンでは、多くの新機能を追加しました。  
ユーザーの皆様のフィードバックに感謝いたします。

---

## 📞 サポート

質問や問題がある場合は、以下までご連絡ください：
- GitHub Issues: https://github.com/laurel-otoshikomi/record-fishing-practice/issues

---

**Happy Fishing! 🎣**
