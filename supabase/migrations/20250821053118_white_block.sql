/*
  # ユーザープロフィールテーブル作成

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - Supabase Auth のユーザーIDと連携
      - `full_name` (text) - フルネーム
      - `company_name` (text) - 会社名
      - `position` (text) - 役職
      - `phone` (text) - 電話番号
      - `department` (text) - 部署
      - `role` (text) - システム内の役割（admin, manager, user）
      - `default_org_id` (uuid) - デフォルト組織ID（将来の拡張用）
      - `onboarding_completed` (boolean) - オンボーディング完了フラグ
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read/update their own profile
    - Add policy for admins to read all profiles
*/

-- プロフィールテーブル作成
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company_name text,
  position text,
  phone text,
  department text,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  default_org_id uuid,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のプロフィールを読み取り・更新できるポリシー
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 管理者がすべてのプロフィールを読み取れるポリシー
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- プロフィール作成時の自動更新トリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (new.id, now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー登録時にプロフィールを自動作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();