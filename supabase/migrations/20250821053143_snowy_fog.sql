/*
  # 申請テーブル作成

  1. New Tables
    - `applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - 申請者のユーザーID
      - `organization_id` (uuid) - 組織ID
      - `type` (text) - 申請種別（business_trip, expense）
      - `title` (text) - 申請タイトル
      - `description` (text) - 申請説明
      - `data` (jsonb) - 申請データ（出張先、期間、経費詳細など）
      - `total_amount` (numeric) - 合計金額
      - `status` (text) - ステータス
      - `submitted_at` (timestamptz) - 提出日時
      - `approved_at` (timestamptz) - 承認日時
      - `approved_by` (uuid) - 承認者ID
      - `rejection_reason` (text) - 却下理由
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `application_approvals`
      - `id` (uuid, primary key)
      - `application_id` (uuid) - 申請ID
      - `approver_id` (uuid) - 承認者ID
      - `step` (integer) - 承認ステップ
      - `status` (text) - 承認ステータス
      - `comment` (text) - コメント
      - `approved_at` (timestamptz) - 承認日時

  2. Security
    - Enable RLS on both tables
    - Add policies for application access control
*/

-- 申請テーブル作成
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('business_trip', 'expense')),
  title text NOT NULL,
  description text,
  data jsonb DEFAULT '{}',
  total_amount numeric(10,2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'returned')),
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 承認履歴テーブル作成
CREATE TABLE IF NOT EXISTS application_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  approver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  step integer NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  comment text,
  approved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_approvals ENABLE ROW LEVEL SECURITY;

-- 申請のポリシー
CREATE POLICY "Users can read their own applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own applications"
  ON applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own draft applications"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'draft');

-- 管理者は全ての申請を閲覧可能
CREATE POLICY "Admins can read all applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 承認履歴のポリシー
CREATE POLICY "Users can read approvals for their applications"
  ON application_approvals
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can manage approvals"
  ON application_approvals
  FOR ALL
  TO authenticated
  USING (approver_id = auth.uid());

-- 更新日時の自動更新
DROP TRIGGER IF EXISTS handle_applications_updated_at ON applications;
CREATE TRIGGER handle_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();