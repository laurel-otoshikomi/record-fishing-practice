# Supabase Database Updates

このファイルは、Supabaseデータベースに対して実行したSQL変更を記録します。

## 2026-01-30

### fishing_areasテーブルのRLSポリシー更新

**目的**: 初期データ（is_default=true, user_id=NULL）を含むすべてのエリアデータを、ログインユーザーが削除・編集できるようにする。

**実行したSQL**:

```sql
-- 既存の削除ポリシーを削除
DROP POLICY IF EXISTS "Users can delete fishing areas" ON fishing_areas;
DROP POLICY IF EXISTS "Users can delete own fishing areas" ON fishing_areas;

-- 新しい削除ポリシー：ログインしていれば削除可能
CREATE POLICY "Users can delete fishing areas"
  ON fishing_areas FOR DELETE
  USING (auth.uid() IS NOT NULL);
```

**変更内容**:
- 旧ポリシー: `user_id`が一致するデータのみ削除可能
- 新ポリシー: ログインしていれば、すべてのデータ（初期データを含む）を削除可能

**影響**:
- AREAタブで初期データを削除できるようになった
- ユーザーが追加したデータも削除できる

---

### 初期データ追加

**実行したSQL**:

```sql
-- 南港エリア
INSERT INTO fishing_areas (user_id, area_name, location_name, point_name, is_default) VALUES
(NULL, '南港エリア', '新波止', '真ん中', true),
(NULL, '南港エリア', '新波止', '赤灯側', true),
(NULL, '南港エリア', '新波止', '白灯側', true),
(NULL, '南港エリア', 'Jグリーン', NULL, true),
(NULL, '久保渡船', '尼崎フェニックス', 'スリット', true),
(NULL, '久保渡船', '尼崎フェニックス', '運河筋', true),
(NULL, '久保渡船', '尼崎フェニックス', '川筋ヤグラまで', true),
(NULL, '久保渡船', '尼崎フェニックス', '川筋ヤグラ奥', true),
(NULL, '久保渡船', '武庫川一文字(久保)', NULL, true),
(NULL, '武庫川渡船', '武庫川一文字(武庫川)', '2番', true),
(NULL, '武庫川渡船', '武庫川一文字(武庫川)', '3番', true),
(NULL, '武庫川渡船', '武庫川一文字(武庫川)', '4番', true),
(NULL, '武庫川渡船', '武庫川一文字(武庫川)', '5番', true),
(NULL, '武庫川渡船', '武庫川一文字(武庫川)', '6番', true),
(NULL, '西野渡船', '導流堤', NULL, true),
(NULL, '西野渡船', '武庫川一文字(西野)', '7番', true),
(NULL, '西野渡船', '武庫川一文字(西野)', '8番', true),
(NULL, '西野渡船', '武庫川一文字(西野)', '9番', true),
(NULL, '岸和田渡船', '岸和田沖の一文字', '沖の北', true),
(NULL, '岸和田渡船', '旧一文字', '赤灯', true),
(NULL, '岸和田渡船', '旧一文字', '2番', true),
(NULL, '岸和田渡船', '旧一文字', '3番', true),
(NULL, '岸和田渡船', '旧一文字', '4番', true),
(NULL, '岸和田渡船', '旧一文字', 'カーブ', true),
(NULL, '岸和田渡船', '旧一文字', '白灯', true),
(NULL, '岸和田渡船', '中波止', '2番', true),
(NULL, '岸和田渡船', '中波止', '3番', true),
(NULL, '中京エリア', '四日市一文字', NULL, true),
(NULL, '中京エリア', '霞一文字', NULL, true)
ON CONFLICT DO NOTHING;
```

**追加されたエリア**:
- 南港エリア（新波止、Jグリーン）
- 久保渡船（尼崎フェニックス、武庫川一文字）
- 武庫川渡船（武庫川一文字）
- 西野渡船（導流堤、武庫川一文字）
- 岸和田渡船（岸和田沖の一文字、旧一文字、中波止）
- 中京エリア（四日市一文字、霞一文字）
