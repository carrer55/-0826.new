/*
  # 不足テーブルの作成とシステム強化

  1. 新しいテーブル
    - `expense_categories` - 経費カテゴリ管理
    - `travel_destinations` - 出張先管理
    - `expense_items` - 経費明細
    - `business_trip_details` - 出張詳細
    - `approval_workflows` - 承認ワークフロー
    - `accounting_integration_logs` - 会計連携ログ
    - `system_settings` - システム設定
    - `audit_logs` - 監査ログ

  2. セキュリティ
    - 全テーブルでRLS有効化
    - 組織レベルでのデータ分離
    - 役割ベースのアクセス制御

  3. パフォーマンス
    - 適切なインデックス設定
    - 外部キー制約
*/

-- 経費カテゴリテーブル
CREATE TABLE IF NOT EXISTS expense_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read expense categories"
  ON expense_categories
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage expense categories"
  ON expense_categories
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- 出張先管理テーブル
CREATE TABLE IF NOT EXISTS travel_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  country text DEFAULT 'Japan',
  is_domestic boolean DEFAULT true,
  distance_from_office integer,
  standard_transportation_cost integer DEFAULT 0,
  standard_accommodation_cost integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE travel_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read travel destinations"
  ON travel_destinations
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage travel destinations"
  ON travel_destinations
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- 経費明細テーブル
CREATE TABLE IF NOT EXISTS expense_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  category_id uuid REFERENCES expense_categories(id) ON DELETE SET NULL,
  date date NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  description text,
  receipt_url text,
  receipt_metadata jsonb DEFAULT '{}',
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expense items"
  ON expense_items
  FOR ALL
  TO authenticated
  USING (application_id IN (
    SELECT id FROM applications WHERE user_id = auth.uid()
  ))
  WITH CHECK (application_id IN (
    SELECT id FROM applications WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organization members can read expense items"
  ON expense_items
  FOR SELECT
  TO authenticated
  USING (application_id IN (
    SELECT id FROM applications WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- 出張詳細テーブル
CREATE TABLE IF NOT EXISTS business_trip_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  destination_id uuid REFERENCES travel_destinations(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  purpose text NOT NULL,
  participants text,
  estimated_daily_allowance numeric(10,2) DEFAULT 0,
  estimated_transportation numeric(10,2) DEFAULT 0,
  estimated_accommodation numeric(10,2) DEFAULT 0,
  actual_daily_allowance numeric(10,2) DEFAULT 0,
  actual_transportation numeric(10,2) DEFAULT 0,
  actual_accommodation numeric(10,2) DEFAULT 0,
  report_submitted boolean DEFAULT false,
  report_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_trip_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own business trip details"
  ON business_trip_details
  FOR ALL
  TO authenticated
  USING (application_id IN (
    SELECT id FROM applications WHERE user_id = auth.uid()
  ))
  WITH CHECK (application_id IN (
    SELECT id FROM applications WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organization members can read business trip details"
  ON business_trip_details
  FOR SELECT
  TO authenticated
  USING (application_id IN (
    SELECT id FROM applications WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- 承認ワークフローテーブル
CREATE TABLE IF NOT EXISTS approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  steps jsonb NOT NULL DEFAULT '[]',
  conditions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read approval workflows"
  ON approval_workflows
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Organization admins can manage approval workflows"
  ON approval_workflows
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- 会計連携ログテーブル
CREATE TABLE IF NOT EXISTS accounting_integration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  operation_type text NOT NULL,
  request_data jsonb DEFAULT '{}',
  response_data jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE accounting_integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read accounting logs"
  ON accounting_integration_logs
  FOR SELECT
  TO authenticated
  USING (application_id IN (
    SELECT id FROM applications WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  ));

-- システム設定テーブル
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  category text NOT NULL,
  key text NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, category, key)
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- 監査ログテーブル
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb DEFAULT '{}',
  new_values jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_expense_categories_org_active ON expense_categories(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_travel_destinations_org_domestic ON travel_destinations(organization_id, is_domestic);
CREATE INDEX IF NOT EXISTS idx_expense_items_app_date ON expense_items(application_id, date);
CREATE INDEX IF NOT EXISTS idx_business_trip_details_app ON business_trip_details(application_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_org_active ON approval_workflows(organization_id, is_active);
CREATE INDEX IF NOT EXISTS idx_accounting_logs_app_status ON accounting_integration_logs(application_id, status);
CREATE INDEX IF NOT EXISTS idx_system_settings_org_category ON system_settings(organization_id, category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id, created_at);

-- 更新日時の自動更新トリガー関数
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルに更新トリガーを追加
CREATE TRIGGER handle_expense_categories_updated_at
  BEFORE UPDATE ON expense_categories
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_travel_destinations_updated_at
  BEFORE UPDATE ON travel_destinations
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_expense_items_updated_at
  BEFORE UPDATE ON expense_items
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_business_trip_details_updated_at
  BEFORE UPDATE ON business_trip_details
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_approval_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 承認ワークフロー処理関数
CREATE OR REPLACE FUNCTION advance_approval_workflow(
  p_application_id uuid,
  p_approver_id uuid,
  p_action text,
  p_comment text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_application applications%ROWTYPE;
  v_current_step integer;
  v_workflow_steps jsonb;
  v_next_approver_id uuid;
  v_result jsonb;
BEGIN
  -- 申請情報を取得
  SELECT * INTO v_application FROM applications WHERE id = p_application_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Application not found');
  END IF;

  -- 現在の承認ステップを取得
  SELECT COALESCE(MAX(step), 0) INTO v_current_step 
  FROM application_approvals 
  WHERE application_id = p_application_id;

  -- 承認記録を挿入
  INSERT INTO application_approvals (
    application_id,
    approver_id,
    step,
    status,
    comment
  ) VALUES (
    p_application_id,
    p_approver_id,
    v_current_step + 1,
    p_action,
    p_comment
  );

  -- 申請ステータスを更新
  IF p_action = 'approved' THEN
    -- 最終承認かチェック（簡略化：2段階承認）
    IF v_current_step >= 1 THEN
      UPDATE applications 
      SET status = 'approved', approved_at = now(), approved_by = p_approver_id
      WHERE id = p_application_id;
    ELSE
      UPDATE applications 
      SET status = 'pending'
      WHERE id = p_application_id;
    END IF;
  ELSIF p_action = 'rejected' THEN
    UPDATE applications 
    SET status = 'rejected', rejection_reason = p_comment
    WHERE id = p_application_id;
  ELSIF p_action = 'returned' THEN
    UPDATE applications 
    SET status = 'returned'
    WHERE id = p_application_id;
  END IF;

  -- 通知を作成
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    v_application.user_id,
    'approval',
    CASE 
      WHEN p_action = 'approved' THEN '申請が承認されました'
      WHEN p_action = 'rejected' THEN '申請が否認されました'
      WHEN p_action = 'returned' THEN '申請が差戻されました'
    END,
    CASE 
      WHEN p_action = 'approved' THEN v_application.title || 'が承認されました。'
      WHEN p_action = 'rejected' THEN v_application.title || 'が否認されました。理由: ' || COALESCE(p_comment, '理由なし')
      WHEN p_action = 'returned' THEN v_application.title || 'が差戻されました。理由: ' || COALESCE(p_comment, '理由なし')
    END,
    jsonb_build_object(
      'application_id', p_application_id,
      'action', p_action,
      'approver_id', p_approver_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'action', p_action,
    'step', v_current_step + 1
  );
END;
$$;

-- 申請合計金額の自動計算関数
CREATE OR REPLACE FUNCTION calculate_application_total()
RETURNS TRIGGER AS $$
DECLARE
  v_total numeric(10,2) := 0;
BEGIN
  -- 出張申請の場合
  IF NEW.type = 'business_trip' THEN
    SELECT COALESCE(
      estimated_daily_allowance + estimated_transportation + estimated_accommodation, 0
    ) INTO v_total
    FROM business_trip_details 
    WHERE application_id = NEW.id;
  
  -- 経費申請の場合
  ELSIF NEW.type = 'expense' THEN
    SELECT COALESCE(SUM(amount), 0) INTO v_total
    FROM expense_items 
    WHERE application_id = NEW.id;
  END IF;

  NEW.total_amount = v_total;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 申請の合計金額自動計算トリガー
CREATE TRIGGER calculate_application_total_trigger
  BEFORE UPDATE ON applications
  FOR EACH ROW
  WHEN (OLD.data IS DISTINCT FROM NEW.data)
  EXECUTE FUNCTION calculate_application_total();

-- 監査ログ記録関数
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.organization_id, OLD.organization_id),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id::text, OLD.id::text),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE '{}'::jsonb END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE '{}'::jsonb END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重要テーブルに監査ログトリガーを追加
CREATE TRIGGER audit_applications_trigger
  AFTER INSERT OR UPDATE OR DELETE ON applications
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER audit_application_approvals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON application_approvals
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- 通知の既読処理関数
CREATE OR REPLACE FUNCTION handle_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = true AND OLD.read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存のテーブルに不足しているカラムを追加
DO $$
BEGIN
  -- user_profilesテーブルの拡張
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN avatar_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN last_login_at timestamptz;
  END IF;

  -- organizationsテーブルの拡張
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE organizations ADD COLUMN subscription_plan text DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'subscription_expires_at'
  ) THEN
    ALTER TABLE organizations ADD COLUMN subscription_expires_at timestamptz;
  END IF;
END $$;

-- デフォルトデータの挿入
INSERT INTO expense_categories (organization_id, name, description, sort_order) 
SELECT 
  id as organization_id,
  category,
  description,
  sort_order
FROM (
  VALUES 
    ('交通費', '電車、バス、タクシー、航空券などの交通費', 1),
    ('宿泊費', 'ホテル、旅館などの宿泊費', 2),
    ('日当', '出張時の日当・食事代', 3),
    ('会議費', '会議室利用料、資料代など', 4),
    ('通信費', '電話代、インターネット利用料など', 5),
    ('雑費', 'その他の経費', 6)
) AS default_categories(category, description, sort_order)
CROSS JOIN organizations
WHERE NOT EXISTS (
  SELECT 1 FROM expense_categories 
  WHERE organization_id = organizations.id
);

-- 承認ワークフローのデフォルト設定
INSERT INTO approval_workflows (organization_id, name, description, steps)
SELECT 
  id as organization_id,
  'デフォルト承認フロー',
  '標準的な2段階承認フロー',
  '[
    {"step": 1, "role": "manager", "name": "直属上司承認"},
    {"step": 2, "role": "admin", "name": "管理者承認"}
  ]'::jsonb
FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM approval_workflows 
  WHERE organization_id = organizations.id
);