# Supabase Migration: Add New Size Categories

## 目的
サイズ分類を細分化して、より詳細な記録を可能にする。

---

## 実行するSQL

Supabaseのダッシュボードで以下のSQLを実行してください：

```sql
-- Add size_30 column (30-39cm)
ALTER TABLE logs 
ADD COLUMN size_30 INTEGER DEFAULT 0;

-- Add size_under_30 column (<30cm)
ALTER TABLE logs 
ADD COLUMN size_under_30 INTEGER DEFAULT 0;

-- Add comments to explain the columns
COMMENT ON COLUMN logs.size_30 IS '30-39cm のサイズ数';
COMMENT ON COLUMN logs.size_under_30 IS '30cm未満のサイズ数';
```

---

## 動作確認

### 1. 列が追加されたか確認
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'logs' AND column_name IN ('size_30', 'size_under_30')
ORDER BY column_name;
```

### 2. テストデータで動作確認
```sql
-- Test insert with new size categories
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
  toshinashi,
  size_45,
  size_40,
  size_30,
  size_under_30
) VALUES (
  'your-user-id',
  'your-user-id',
  'Test User',
  '2024-01-31T10:00',
  'テストエリア',
  'テスト場所',
  'フカセ',
  'イガイ',
  10,  -- 合計10匹
  2,   -- 50cm over: 2匹
  1,   -- 45-49cm: 1匹
  3,   -- 40-44cm: 3匹
  2,   -- 30-39cm: 2匹
  1    -- <30cm: 1匹
  -- 不明: 1匹 (10 - 2 - 1 - 3 - 2 - 1 = 1)
);

-- Verify the insert
SELECT 
  id, 
  date, 
  count, 
  toshinashi,
  size_45,
  size_40,
  size_30,
  size_under_30,
  (count - COALESCE(toshinashi, 0) - COALESCE(size_45, 0) - COALESCE(size_40, 0) - COALESCE(size_30, 0) - COALESCE(size_under_30, 0)) as unknown_size
FROM logs 
WHERE user_name = 'Test User' 
ORDER BY created_at DESC 
LIMIT 1;

-- Clean up test data (optional)
DELETE FROM logs WHERE user_name = 'Test User';
```

---

## サイズ分類の詳細

### 新しいサイズ分類
| サイズ | カラム名 | 色 | 説明 |
|--------|----------|-----|------|
| 50cm over | `toshinashi` | 金色 (#c5a059) | 年無し |
| 45-49cm | `size_45` | 赤 (#cf4545) | - |
| 40-44cm | `size_40` | 青 (#4a90e2) | - |
| **30-39cm** | **`size_30`** | **緑 (#66bb6a)** | **新規追加** |
| **<30cm** | **`size_under_30`** | **灰色 (#999999)** | **新規追加** |
| **不明** | *計算値* | **濃灰色 (#555555)** | **未入力分を自動計算** |

### 不明サイズの計算
```
不明 = count - (toshinashi + size_45 + size_40 + size_30 + size_under_30)
```

例：
- 合計 10匹
- 年無し 2匹
- 45-49cm 1匹
- 40-44cm 3匹
- 30-39cm 2匹
- <30cm 1匹
- **不明 = 10 - (2+1+3+2+1) = 1匹**

---

## 既存データへの影響

### データの互換性
- **既存レコード**: 新しい列は `DEFAULT 0` なので、既存データは自動的に `0` になります
- **不明サイズの扱い**: 
  - 既存の記録で未入力のサイズは「不明」として月別グラフに表示されます
  - 例: `count=5`, `toshinashi=2`, `size_45=0`, `size_40=1` の場合
    - 不明 = 5 - (2 + 0 + 1 + 0 + 0) = **2匹**

### アプリの表示
- **月別グラフ**: 6つのサイズ分類で積み上げ棒グラフ表示
- **LOG タブ**: 「詳細サイズ(40/45)も記録」をONにすると、新しいサイズ欄が表示
- **DATA タブ**: 円グラフに「不明」が表示される（未入力分がある場合）

---

## ロールバック（必要な場合）

もし問題があった場合は、以下のSQLで列を削除できます：

```sql
-- Remove new size columns (if needed)
ALTER TABLE logs DROP COLUMN size_30;
ALTER TABLE logs DROP COLUMN size_under_30;
```

⚠️ **注意**: ロールバック後、新しいサイズ分類で記録したデータは失われます。

---

## UI の変更内容

### LOG タブ
```
SIZE BREAKDOWN
[✓] 詳細サイズ(40/45)も記録

↳ うち、年無し (50cm over): [0]

↳ うち、45~49cm: [0]  |  ↳ うち、40~44cm: [0]
↳ うち、30~39cm: [0]  |  ↳ うち、< 30cm: [0]
```

### 月別グラフ (MONTHLY)
```
[積み上げ棒グラフ]
■ 不明 (濃灰色)
■ <30cm (灰色)
■ 30-39cm (緑)
■ 40-44cm (青)
■ 45-49cm (赤)
■ 50cm+ (金色)
```

---

## 実行手順

1. Supabase ダッシュボードを開く: https://supabase.com/dashboard
2. プロジェクト「**record-fishing-practice**」を選択
3. 左メニューから「**SQL Editor**」を選択
4. 上記のSQLをコピー＆ペースト
5. 「**RUN**」ボタンをクリック
6. 成功メッセージを確認

---

## 注意事項

⚠️ **重要**: このSQLを実行する前に、必ず以下を確認してください：
1. 練習用環境（record-fishing-practice）のSupabaseで実行すること
2. 本番環境に適用する前に、必ず練習用で動作確認すること
3. 既存データは影響を受けません（新しい列は `0` になります）

---

## 期待される効果

### 1. データ分析の精度向上
- より細かいサイズ分類で、釣果の傾向を正確に把握
- 小型魚（30cm未満）の記録が可能に

### 2. 未入力データの可視化
- 「不明」として表示されることで、サイズ記録の漏れが分かりやすい
- データ入力の品質向上につながる

### 3. 統計の充実
- 月別グラフが6段階のサイズ分類で表示
- サイズ別の釣果傾向を詳細に分析可能

---

完了したら、アプリをリロードして動作確認してください！ 🎣
