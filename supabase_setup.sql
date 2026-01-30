-- エリア管理テーブルを作成
CREATE TABLE IF NOT EXISTS fishing_areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  area_name TEXT NOT NULL,
  location_name TEXT NOT NULL,
  point_name TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成（検索高速化）
CREATE INDEX IF NOT EXISTS idx_fishing_areas_user_id ON fishing_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_fishing_areas_area_name ON fishing_areas(area_name);
CREATE INDEX IF NOT EXISTS idx_fishing_areas_is_default ON fishing_areas(is_default);

-- RLS（Row Level Security）を有効化
ALTER TABLE fishing_areas ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデータのみ閲覧可能
CREATE POLICY "Users can view own fishing areas"
  ON fishing_areas FOR SELECT
  USING (auth.uid() = user_id OR is_default = true);

-- ポリシー: ユーザーは自分のデータのみ追加可能
CREATE POLICY "Users can insert own fishing areas"
  ON fishing_areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ更新可能
CREATE POLICY "Users can update own fishing areas"
  ON fishing_areas FOR UPDATE
  USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分のデータのみ削除可能
CREATE POLICY "Users can delete own fishing areas"
  ON fishing_areas FOR DELETE
  USING (auth.uid() = user_id);

-- 初期データを挿入（is_default = true）
-- ユーザーIDはNULLにして、全員が見れるようにする
INSERT INTO fishing_areas (user_id, area_name, location_name, point_name, is_default) VALUES
  -- 北港エリア
  (NULL, '北港エリア', 'スリット', '関門', true),
  (NULL, '北港エリア', 'スリット', 'ヤイタ', true),
  (NULL, '北港エリア', 'スリット', 'レーダー', true),
  (NULL, '北港エリア', 'スリット', '水門', true),
  (NULL, '北港エリア', 'スリット', '1コーナー', true),
  (NULL, '北港エリア', 'スリット', '出島', true),
  (NULL, '北港エリア', 'スリット', '事務所前', true),
  (NULL, '北港エリア', '関電', '灯台', true),
  (NULL, '北港エリア', '関電', '真ん中', true),
  (NULL, '北港エリア', '関電', '根本', true),
  (NULL, '北港エリア', '中の灯台', NULL, true),
  (NULL, '北港エリア', 'ヨット', NULL, true),
  
  -- 南港エリア
  (NULL, '南港エリア', '新波止', '真ん中', true),
  (NULL, '南港エリア', '新波止', '赤灯側', true),
  (NULL, '南港エリア', '新波止', '白灯側', true),
  (NULL, '南港エリア', 'Jグリーン', NULL, true),
  
  -- 久保渡船
  (NULL, '久保渡船', '尼崎フェニックス', 'スリット', true),
  (NULL, '久保渡船', '尼崎フェニックス', '運河筋', true),
  (NULL, '久保渡船', '尼崎フェニックス', '川筋ヤグラまで', true),
  (NULL, '久保渡船', '尼崎フェニックス', '川筋ヤグラ奥', true),
  (NULL, '久保渡船', '武庫川一文字(久保)', NULL, true),
  
  -- 武庫川渡船
  (NULL, '武庫川渡船', '武庫川一文字(武庫川)', '2番', true),
  (NULL, '武庫川渡船', '武庫川一文字(武庫川)', '3番', true),
  (NULL, '武庫川渡船', '武庫川一文字(武庫川)', '4番', true),
  (NULL, '武庫川渡船', '武庫川一文字(武庫川)', '5番', true),
  (NULL, '武庫川渡船', '武庫川一文字(武庫川)', '6番', true),
  
  -- 西野渡船
  (NULL, '西野渡船', '導流堤', NULL, true),
  (NULL, '西野渡船', '武庫川一文字(西野)', '7番', true),
  (NULL, '西野渡船', '武庫川一文字(西野)', '8番', true),
  (NULL, '西野渡船', '武庫川一文字(西野)', '9番', true),
  
  -- 岸和田渡船
  (NULL, '岸和田渡船', '岸和田沖の一文字', '沖の北', true),
  (NULL, '岸和田渡船', '旧一文字', '赤灯', true),
  (NULL, '岸和田渡船', '旧一文字', '2番', true),
  (NULL, '岸和田渡船', '旧一文字', '3番', true),
  (NULL, '岸和田渡船', '旧一文字', '4番', true),
  (NULL, '岸和田渡船', '旧一文字', 'カーブ', true),
  (NULL, '岸和田渡船', '旧一文字', '白灯', true),
  (NULL, '岸和田渡船', '中波止', '2番', true),
  (NULL, '岸和田渡船', '中波止', '3番', true),
  
  -- 中京エリア
  (NULL, '中京エリア', '四日市一文字', NULL, true),
  (NULL, '中京エリア', '霞一文字', NULL, true),
  
  -- その他エリア
  (NULL, 'その他エリア', 'その他', NULL, true)
ON CONFLICT DO NOTHING;
