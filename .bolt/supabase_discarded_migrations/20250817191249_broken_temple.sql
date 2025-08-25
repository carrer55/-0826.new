/*
  # 認証システムの構築

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - auth.usersのidと連携
      - `full_name` (text) - 氏名
      - `phone` (text) - 電話番号
      - `company_name` (text) - 法人名
      - `position` (text) - 役職
      - `default_org_id` (uuid) - デフォルト組織ID
      - `onboarding_completed` (boolean) - 本登録完了フラグ
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

  2. Functions
    - `handle_new_user()` - 新規ユーザー作成時のプロフィール自動生成
    - `update_updated_at_column()` - 更新日時の自動更新

  3. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to manage their own data
    - Add trigger for automatic profile creation
    - Add trigger for updated_at column
*/

-- プロフィールテーブルの作成
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  company_name text,
  position text,
  default_org_id uuid,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- プロフィールのポリシー
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

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

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 新規ユーザー作成時のプロフィール自動生成関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- プロフィールのupdated_atトリガー
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 新規ユーザー作成時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();