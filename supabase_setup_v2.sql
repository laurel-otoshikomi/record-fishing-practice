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

-- 既存のポリシーを削除（エラー回避）
DROP POLICY IF EXISTS "Users can view own fishing areas" ON fishing_areas;
DROP POLICY IF EXISTS "Users can insert own fishing areas" ON fishing_areas;
DROP POLICY IF EXISTS "Users can update own fishing areas" ON fishing_areas;
DROP POLICY IF EXISTS "Users can delete own fishing areas" ON fishing_areas;

-- ポリシー: ユーザーは自分のデータと初期データを閲覧可能
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
