/*
  # 通知テーブル作成

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - 通知対象ユーザーID
      - `type` (text) - 通知種別
      - `title` (text) - 通知タイトル
      - `message` (text) - 通知メッセージ
      - `data` (jsonb) - 通知データ
      - `read` (boolean) - 既読フラグ
      - `read_at` (timestamptz) - 既読日時
      - `created_at` (timestamptz) - 作成日時

  2. Security
    - Enable RLS on table
    - Add policies for notification access control
*/

-- 通知テーブル作成
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('approval', 'reminder', 'system', 'update')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS有効化
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分の通知を管理できるポリシー
CREATE POLICY "Users can manage their own notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- 通知既読時の自動更新関数
CREATE OR REPLACE FUNCTION handle_notification_read()
RETURNS trigger AS $$
BEGIN
  IF NEW.read = true AND OLD.read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 通知既読時のトリガー
DROP TRIGGER IF EXISTS handle_notification_read_trigger ON notifications;
CREATE TRIGGER handle_notification_read_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE PROCEDURE handle_notification_read();