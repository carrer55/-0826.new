/*
  # 出張規程テーブル作成

  1. New Tables
    - `travel_regulations`
      - `id` (uuid, primary key)
      - `organization_id` (uuid) - 組織ID
      - `name` (text) - 規程名
      - `version` (text) - バージョン
      - `company_info` (jsonb) - 会社情報
      - `articles` (jsonb) - 各条文の内容
      - `allowance_settings` (jsonb) - 日当設定
      - `status` (text) - ステータス
      - `created_by` (uuid) - 作成者ID
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

  2. Security
    - Enable RLS on table
    - Add policies for regulation access control
*/

-- 出張規程テーブル作成
CREATE TABLE IF NOT EXISTS travel_regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  version text NOT NULL DEFAULT 'v1.0',
  company_info jsonb DEFAULT '{}',
  articles jsonb DEFAULT '{}',
  allowance_settings jsonb DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE travel_regulations ENABLE ROW LEVEL SECURITY;

-- 組織メンバーが規程を閲覧できるポリシー
CREATE POLICY "Organization members can read travel regulations"
  ON travel_regulations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- 管理者が規程を作成・更新できるポリシー
CREATE POLICY "Organization admins can manage travel regulations"
  ON travel_regulations
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- 更新日時の自動更新
DROP TRIGGER IF EXISTS handle_travel_regulations_updated_at ON travel_regulations;
CREATE TRIGGER handle_travel_regulations_updated_at
  BEFORE UPDATE ON travel_regulations
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();