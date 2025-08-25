/*
  # 包括的バックエンドセットアップ

  1. データベーススキーマの最適化
    - 既存テーブルの構造改善
    - 新しいテーブルの追加（approval_workflows, expense_categories, travel_destinations等）
    - インデックスとパフォーマンス最適化
    
  2. Row Level Security (RLS) の強化
    - 全テーブルでRLS有効化
    - 役割ベースのアクセス制御
    - 組織レベルでのデータ分離
    
  3. トリガーとストアドプロシージャ
    - 自動タイムスタンプ更新
    - 承認ワークフロー自動化
    - 通知生成
    - データ整合性チェック
    
  4. パフォーマンス最適化
    - 適切なインデックス設定
    - クエリ最適化
*/

-- ストアドプロシージャ: updated_atの自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ストアドプロシージャ: 通知の自動生成
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (p_user_id, p_type, p_title, p_message, p_data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ストアドプロシージャ: 承認ワークフローの進行
CREATE OR REPLACE FUNCTION advance_approval_workflow(
    p_application_id UUID,
    p_approver_id UUID,
    p_action TEXT,
    p_comment TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    app_record RECORD;
    next_approver UUID;
    result JSONB;
BEGIN
    -- アプリケーション情報を取得
    SELECT * INTO app_record FROM applications WHERE id = p_application_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Application not found');
    END IF;
    
    -- 承認記録を作成
    INSERT INTO application_approvals (
        application_id, 
        approver_id, 
        status, 
        comment
    ) VALUES (
        p_application_id, 
        p_approver_id, 
        p_action, 
        p_comment
    );
    
    -- アプリケーションステータスを更新
    IF p_action = 'approved' THEN
        -- 次の承認者を確認（簡略化）
        UPDATE applications 
        SET status = 'approved', approved_at = NOW(), approved_by = p_approver_id
        WHERE id = p_application_id;
        
        -- 申請者に通知
        PERFORM create_notification(
            app_record.user_id,
            'approval',
            '申請が承認されました',
            format('申請「%s」が承認されました。', app_record.title),
            jsonb_build_object('application_id', p_application_id, 'action', 'approved')
        );
        
    ELSIF p_action = 'rejected' THEN
        UPDATE applications 
        SET status = 'rejected', rejection_reason = p_comment
        WHERE id = p_application_id;
        
        -- 申請者に通知
        PERFORM create_notification(
            app_record.user_id,
            'approval',
            '申請が否認されました',
            format('申請「%s」が否認されました。理由: %s', app_record.title, COALESCE(p_comment, '理由なし')),
            jsonb_build_object('application_id', p_application_id, 'action', 'rejected')
        );
        
    ELSIF p_action = 'returned' THEN
        UPDATE applications 
        SET status = 'returned'
        WHERE id = p_application_id;
        
        -- 申請者に通知
        PERFORM create_notification(
            app_record.user_id,
            'approval',
            '申請が差戻されました',
            format('申請「%s」が差戻されました。コメント: %s', app_record.title, COALESCE(p_comment, 'コメントなし')),
            jsonb_build_object('application_id', p_application_id, 'action', 'returned')
        );
    END IF;
    
    RETURN jsonb_build_object('success', true, 'status', p_action);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新しいテーブル: 経費カテゴリ
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read expense categories"
    ON expense_categories FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can manage expense categories"
    ON expense_categories FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 新しいテーブル: 出張先マスタ
CREATE TABLE IF NOT EXISTS travel_destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    country TEXT DEFAULT 'Japan',
    is_domestic BOOLEAN DEFAULT true,
    distance_from_office INTEGER, -- km
    standard_transportation_cost INTEGER DEFAULT 0,
    standard_accommodation_cost INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE travel_destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read travel destinations"
    ON travel_destinations FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can manage travel destinations"
    ON travel_destinations FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 新しいテーブル: 承認ワークフロー設定
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    application_type TEXT NOT NULL CHECK (application_type IN ('business_trip', 'expense')),
    conditions JSONB DEFAULT '{}', -- 金額条件、部署条件など
    steps JSONB NOT NULL, -- 承認ステップの定義
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read approval workflows"
    ON approval_workflows FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can manage approval workflows"
    ON approval_workflows FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 新しいテーブル: 経費明細
CREATE TABLE IF NOT EXISTS expense_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    receipt_url TEXT,
    receipt_metadata JSONB DEFAULT '{}', -- OCR結果など
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expense_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own expense items"
    ON expense_items FOR ALL
    TO authenticated
    USING (
        application_id IN (
            SELECT id FROM applications WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        application_id IN (
            SELECT id FROM applications WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization members can read expense items"
    ON expense_items FOR SELECT
    TO authenticated
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN organization_members om ON a.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

-- 新しいテーブル: 出張詳細
CREATE TABLE IF NOT EXISTS business_trip_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES travel_destinations(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    purpose TEXT NOT NULL,
    participants TEXT,
    estimated_daily_allowance DECIMAL(10,2) DEFAULT 0,
    estimated_transportation DECIMAL(10,2) DEFAULT 0,
    estimated_accommodation DECIMAL(10,2) DEFAULT 0,
    actual_daily_allowance DECIMAL(10,2) DEFAULT 0,
    actual_transportation DECIMAL(10,2) DEFAULT 0,
    actual_accommodation DECIMAL(10,2) DEFAULT 0,
    report_submitted BOOLEAN DEFAULT false,
    report_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE business_trip_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own business trip details"
    ON business_trip_details FOR ALL
    TO authenticated
    USING (
        application_id IN (
            SELECT id FROM applications WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        application_id IN (
            SELECT id FROM applications WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization members can read business trip details"
    ON business_trip_details FOR SELECT
    TO authenticated
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN organization_members om ON a.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

-- 新しいテーブル: 会計連携ログ
CREATE TABLE IF NOT EXISTS accounting_integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
    request_data JSONB,
    response_data JSONB,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounting_integration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read accounting logs"
    ON accounting_integration_logs FOR SELECT
    TO authenticated
    USING (
        application_id IN (
            SELECT a.id FROM applications a
            JOIN organization_members om ON a.organization_id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

-- インデックスの追加
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_organization_id ON applications(organization_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_type_status ON applications(type, status);

CREATE INDEX IF NOT EXISTS idx_expense_items_application_id ON expense_items(application_id);
CREATE INDEX IF NOT EXISTS idx_expense_items_date ON expense_items(date);
CREATE INDEX IF NOT EXISTS idx_expense_items_category_id ON expense_items(category_id);

CREATE INDEX IF NOT EXISTS idx_business_trip_details_application_id ON business_trip_details(application_id);
CREATE INDEX IF NOT EXISTS idx_business_trip_details_dates ON business_trip_details(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_business_trip_details_destination_id ON business_trip_details(destination_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_accounting_logs_application_id ON accounting_integration_logs(application_id);
CREATE INDEX IF NOT EXISTS idx_accounting_logs_status ON accounting_integration_logs(status);
CREATE INDEX IF NOT EXISTS idx_accounting_logs_created_at ON accounting_integration_logs(created_at);

-- トリガーの設定
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_categories_updated_at
    BEFORE UPDATE ON expense_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_destinations_updated_at
    BEFORE UPDATE ON travel_destinations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approval_workflows_updated_at
    BEFORE UPDATE ON approval_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_items_updated_at
    BEFORE UPDATE ON expense_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_trip_details_updated_at
    BEFORE UPDATE ON business_trip_details
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 申請提出時の自動通知トリガー
CREATE OR REPLACE FUNCTION notify_on_application_submit()
RETURNS TRIGGER AS $$
DECLARE
    approver_id UUID;
    org_name TEXT;
BEGIN
    -- ステータスが'pending'に変更された場合のみ実行
    IF NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status != 'pending') THEN
        -- 組織名を取得
        SELECT name INTO org_name FROM organizations WHERE id = NEW.organization_id;
        
        -- 承認者を決定（簡略化: 組織のオーナーに通知）
        SELECT owner_id INTO approver_id 
        FROM organizations 
        WHERE id = NEW.organization_id;
        
        -- 承認者に通知
        IF approver_id IS NOT NULL THEN
            PERFORM create_notification(
                approver_id,
                'approval',
                '新しい申請が提出されました',
                format('「%s」から新しい%s申請が提出されました。', 
                    COALESCE(org_name, '組織'), 
                    CASE WHEN NEW.type = 'business_trip' THEN '出張' ELSE '経費' END
                ),
                jsonb_build_object(
                    'application_id', NEW.id,
                    'application_type', NEW.type,
                    'amount', NEW.total_amount
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_application_submit
    AFTER UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_application_submit();

-- 通知の既読処理トリガー
CREATE OR REPLACE FUNCTION handle_notification_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read = true AND (OLD.read IS NULL OR OLD.read = false) THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_notification_read
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION handle_notification_read();

-- 新しいユーザー作成時のプロフィール自動作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersテーブルへのトリガー（Supabaseの内部テーブル）
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- 組織作成時のデフォルトデータ作成
CREATE OR REPLACE FUNCTION setup_default_organization_data()
RETURNS TRIGGER AS $$
BEGIN
    -- デフォルトの経費カテゴリを作成
    INSERT INTO expense_categories (organization_id, name, description, sort_order) VALUES
    (NEW.id, '交通費', '電車、バス、タクシー等の交通費', 1),
    (NEW.id, '宿泊費', 'ホテル、旅館等の宿泊費', 2),
    (NEW.id, '日当', '出張時の日当・食事代', 3),
    (NEW.id, '雑費', 'その他の出張関連費用', 4);
    
    -- デフォルトの承認ワークフローを作成
    INSERT INTO approval_workflows (organization_id, name, application_type, steps, created_by) VALUES
    (NEW.id, 'デフォルト出張申請承認フロー', 'business_trip', 
     '[{"step": 1, "role": "manager", "required": true}, {"step": 2, "role": "admin", "required": true}]'::JSONB,
     NEW.owner_id),
    (NEW.id, 'デフォルト経費申請承認フロー', 'expense',
     '[{"step": 1, "role": "manager", "required": true}]'::JSONB,
     NEW.owner_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_setup_default_organization_data
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION setup_default_organization_data();

-- 申請の合計金額自動計算
CREATE OR REPLACE FUNCTION calculate_application_total()
RETURNS TRIGGER AS $$
DECLARE
    total_amount DECIMAL(10,2) := 0;
BEGIN
    -- 経費申請の場合
    IF NEW.type = 'expense' THEN
        SELECT COALESCE(SUM(amount), 0) INTO total_amount
        FROM expense_items
        WHERE application_id = NEW.id;
        
        NEW.total_amount = total_amount;
    END IF;
    
    -- 出張申請の場合
    IF NEW.type = 'business_trip' THEN
        SELECT COALESCE(
            estimated_daily_allowance + estimated_transportation + estimated_accommodation, 
            0
        ) INTO total_amount
        FROM business_trip_details
        WHERE application_id = NEW.id;
        
        NEW.total_amount = total_amount;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_application_total
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION calculate_application_total();

-- 経費項目変更時の申請合計金額更新
CREATE OR REPLACE FUNCTION update_application_total_on_expense_change()
RETURNS TRIGGER AS $$
DECLARE
    total_amount DECIMAL(10,2);
    app_id UUID;
BEGIN
    -- 削除の場合はOLD、それ以外はNEW
    app_id := COALESCE(NEW.application_id, OLD.application_id);
    
    SELECT COALESCE(SUM(amount), 0) INTO total_amount
    FROM expense_items
    WHERE application_id = app_id;
    
    UPDATE applications
    SET total_amount = total_amount, updated_at = NOW()
    WHERE id = app_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_application_total_on_expense_change
    AFTER INSERT OR UPDATE OR DELETE ON expense_items
    FOR EACH ROW
    EXECUTE FUNCTION update_application_total_on_expense_change();

-- 出張詳細変更時の申請合計金額更新
CREATE OR REPLACE FUNCTION update_application_total_on_trip_change()
RETURNS TRIGGER AS $$
DECLARE
    total_amount DECIMAL(10,2);
BEGIN
    total_amount := NEW.estimated_daily_allowance + NEW.estimated_transportation + NEW.estimated_accommodation;
    
    UPDATE applications
    SET total_amount = total_amount, updated_at = NOW()
    WHERE id = NEW.application_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_application_total_on_trip_change
    AFTER INSERT OR UPDATE ON business_trip_details
    FOR EACH ROW
    EXECUTE FUNCTION update_application_total_on_trip_change();

-- 新しいテーブル: システム設定
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, key)
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read public settings"
    ON system_settings FOR SELECT
    TO authenticated
    USING (
        is_public = true AND organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization admins can manage all settings"
    ON system_settings FOR ALL
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 新しいテーブル: 監査ログ
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization admins can read audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- 監査ログ生成関数
CREATE OR REPLACE FUNCTION create_audit_log(
    p_table_name TEXT,
    p_record_id UUID,
    p_action TEXT,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
    user_org_id UUID;
BEGIN
    -- ユーザーの組織IDを取得
    SELECT organization_id INTO user_org_id
    FROM organization_members
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    INSERT INTO audit_logs (
        organization_id,
        user_id,
        table_name,
        record_id,
        action,
        old_values,
        new_values
    ) VALUES (
        user_org_id,
        auth.uid(),
        p_table_name,
        p_record_id,
        p_action,
        p_old_values,
        p_new_values
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 重要テーブルの監査ログトリガー
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB;
    new_values JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_values := to_jsonb(OLD);
        PERFORM create_audit_log(TG_TABLE_NAME, OLD.id, 'DELETE', old_values, NULL);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        PERFORM create_audit_log(TG_TABLE_NAME, NEW.id, 'UPDATE', old_values, new_values);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        new_values := to_jsonb(NEW);
        PERFORM create_audit_log(TG_TABLE_NAME, NEW.id, 'INSERT', NULL, new_values);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 監査ログトリガーの適用
CREATE TRIGGER audit_applications_trigger
    AFTER INSERT OR UPDATE OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_organizations_trigger
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- ビュー: 申請の詳細情報
CREATE OR REPLACE VIEW application_details AS
SELECT 
    a.*,
    up.full_name as applicant_name,
    up.department as applicant_department,
    o.name as organization_name,
    CASE 
        WHEN a.type = 'business_trip' THEN btd.purpose
        ELSE NULL
    END as trip_purpose,
    CASE 
        WHEN a.type = 'business_trip' THEN btd.start_date
        ELSE NULL
    END as trip_start_date,
    CASE 
        WHEN a.type = 'business_trip' THEN btd.end_date
        ELSE NULL
    END as trip_end_date,
    CASE 
        WHEN a.type = 'expense' THEN (
            SELECT COUNT(*) FROM expense_items WHERE application_id = a.id
        )
        ELSE NULL
    END as expense_item_count
FROM applications a
LEFT JOIN user_profiles up ON a.user_id = up.id
LEFT JOIN organizations o ON a.organization_id = o.id
LEFT JOIN business_trip_details btd ON a.id = btd.application_id AND a.type = 'business_trip';

-- RLSポリシーをビューに適用
CREATE POLICY "Users can read their own application details"
    ON application_details FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Organization members can read application details"
    ON application_details FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- 統計用ビュー
CREATE OR REPLACE VIEW organization_statistics AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT om.user_id) as total_users,
    COUNT(DISTINCT CASE WHEN a.created_at >= date_trunc('month', CURRENT_DATE) THEN a.id END) as monthly_applications,
    COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_applications,
    COALESCE(SUM(CASE WHEN a.status = 'approved' AND a.created_at >= date_trunc('month', CURRENT_DATE) THEN a.total_amount END), 0) as monthly_approved_amount,
    COALESCE(SUM(CASE WHEN a.status = 'approved' AND a.created_at >= date_trunc('year', CURRENT_DATE) THEN a.total_amount END), 0) as yearly_approved_amount
FROM organizations o
LEFT JOIN organization_members om ON o.id = om.organization_id
LEFT JOIN applications a ON o.id = a.organization_id
GROUP BY o.id, o.name;

-- デフォルトデータの挿入
INSERT INTO expense_categories (organization_id, name, description, sort_order) 
SELECT DISTINCT organization_id, '交通費', '電車、バス、タクシー等の交通費', 1
FROM organization_members
WHERE NOT EXISTS (
    SELECT 1 FROM expense_categories 
    WHERE organization_id = organization_members.organization_id 
    AND name = '交通費'
);

INSERT INTO expense_categories (organization_id, name, description, sort_order) 
SELECT DISTINCT organization_id, '宿泊費', 'ホテル、旅館等の宿泊費', 2
FROM organization_members
WHERE NOT EXISTS (
    SELECT 1 FROM expense_categories 
    WHERE organization_id = organization_members.organization_id 
    AND name = '宿泊費'
);

INSERT INTO expense_categories (organization_id, name, description, sort_order) 
SELECT DISTINCT organization_id, '日当', '出張時の日当・食事代', 3
FROM organization_members
WHERE NOT EXISTS (
    SELECT 1 FROM expense_categories 
    WHERE organization_id = organization_members.organization_id 
    AND name = '日当'
);

INSERT INTO expense_categories (organization_id, name, description, sort_order) 
SELECT DISTINCT organization_id, '雑費', 'その他の出張関連費用', 4
FROM organization_members
WHERE NOT EXISTS (
    SELECT 1 FROM expense_categories 
    WHERE organization_id = organization_members.organization_id 
    AND name = '雑費'
);