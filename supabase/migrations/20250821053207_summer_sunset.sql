/*
  # 書類管理テーブル作成

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - 作成者ID
      - `organization_id` (uuid) - 組織ID
      - `application_id` (uuid) - 関連申請ID（任意）
      - `type` (text) - 書類種別
      - `title` (text) - 書類タイトル
      - `content` (jsonb) - 書類内容
      - `file_url` (text) - ファイルURL（Supabase Storage）
      - `file_size` (bigint) - ファイルサイズ
      - `mime_type` (text) - MIMEタイプ
      - `status` (text) - ステータス
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

  2. Security
    - Enable RLS on table
    - Add policies for document access control
*/

-- 書類テーブル作成
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN (
    'business_report', 
    'allowance_detail', 
    'expense_settlement', 
    'travel_detail', 
    'gps_log', 
    'monthly_report', 
    'annual_report'
  )),
  title text NOT NULL,
  content jsonb DEFAULT '{}',
  file_url text,
  file_size bigint,
  mime_type text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分の書類を管理できるポリシー
CREATE POLICY "Users can manage their own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- 組織メンバーが書類を閲覧できるポリシー
CREATE POLICY "Organization members can read documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- 更新日時の自動更新
DROP TRIGGER IF EXISTS handle_documents_updated_at ON documents;
CREATE TRIGGER handle_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();