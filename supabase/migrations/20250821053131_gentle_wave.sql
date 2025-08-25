/*
  # 組織テーブル作成

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text) - 組織名
      - `description` (text) - 組織説明
      - `owner_id` (uuid) - 組織オーナーのユーザーID
      - `settings` (jsonb) - 組織設定（日当額、承認フローなど）
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `organization_members`
      - `id` (uuid, primary key)
      - `organization_id` (uuid) - 組織ID
      - `user_id` (uuid) - ユーザーID
      - `role` (text) - 組織内での役割
      - `joined_at` (timestamptz) - 参加日時

  2. Security
    - Enable RLS on both tables
    - Add policies for organization access control
*/

-- 組織テーブル作成
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 組織メンバーテーブル作成
CREATE TABLE IF NOT EXISTS organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- RLS有効化
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- 組織のポリシー
CREATE POLICY "Users can read organizations they belong to"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners can update their organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Organization owners can delete their organizations"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- 組織メンバーのポリシー
CREATE POLICY "Users can read organization members of their organizations"
  ON organization_members
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization owners and admins can manage members"
  ON organization_members
  FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- 更新日時の自動更新
DROP TRIGGER IF EXISTS handle_organizations_updated_at ON organizations;
CREATE TRIGGER handle_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();