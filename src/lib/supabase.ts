import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'kenja-seisan-auth'
  }
})

// Edge Functions のヘルパー関数
export const callEdgeFunction = async (
  functionName: string, 
  payload: any, 
  options: { method?: string } = {}
) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: options.method || 'POST',
    headers: {
      'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Edge function error: ${error}`)
  }

  return await response.json()
}

// 申請承認のヘルパー関数
export const approveApplication = async (
  applicationId: string,
  action: 'approved' | 'rejected' | 'returned',
  comment?: string
) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  return await callEdgeFunction('application-approval', {
    applicationId,
    action,
    comment,
    approverId: user.id
  })
}

// 会計連携のヘルパー関数
export const syncToAccounting = async (applicationId: string) => {
  return await callEdgeFunction('accounting-integration', {
    applicationId,
    action: 'create_entry'
  })
}

// 通知送信のヘルパー関数
export const sendNotification = async (
  userId: string,
  type: 'email' | 'push' | 'both',
  title: string,
  message: string,
  data?: any
) => {
  return await callEdgeFunction('notification-sender', {
    userId,
    type,
    title,
    message,
    data
  })
}

// ドキュメント生成のヘルパー関数
export const generateDocument = async (
  type: 'business_report' | 'allowance_detail' | 'expense_settlement' | 'travel_regulation',
  organizationId: string,
  format: 'pdf' | 'word' | 'html' = 'pdf',
  applicationId?: string,
  templateData?: any
) => {
  return await callEdgeFunction('document-generator', {
    type,
    organizationId,
    format,
    applicationId,
    templateData
  })
}

// OCR処理のヘルパー関数
export const processReceiptOCR = async (
  imageData: string,
  applicationId: string,
  expenseItemId?: string
) => {
  return await callEdgeFunction('expense-ocr', {
    imageData,
    applicationId,
    expenseItemId
  })
}

// データ分析のヘルパー関数
export const getAnalytics = async (
  organizationId: string,
  dateRange?: { start: string, end: string },
  metrics?: string[],
  groupBy?: string
) => {
  if (dateRange && metrics) {
    return await callEdgeFunction('data-analytics', {
      organizationId,
      dateRange,
      metrics,
      groupBy
    })
  } else {
    // 基本統計を取得
    const response = await fetch(`${supabaseUrl}/functions/v1/data-analytics?organizationId=${organizationId}`, {
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
      }
    })
    return await response.json()
  }
}

// Database types - 最新スキーマに対応
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          position: string | null
          department: string | null
          role: string | null
          default_organization_id: string | null
          avatar_url: string | null
          onboarding_completed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          position?: string | null
          department?: string | null
          role?: string | null
          default_organization_id?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          position?: string | null
          department?: string | null
          role?: string | null
          default_organization_id?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          type: string
          title: string
          description: string | null
          data: any
          total_amount: number
          status: string
          submitted_at: string | null
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          type: string
          title: string
          description?: string | null
          data?: any
          total_amount?: number
          status?: string
          submitted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          type?: string
          title?: string
          description?: string | null
          data?: any
          total_amount?: number
          status?: string
          submitted_at?: string | null
          approved_at?: string | null
          approved_by?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      application_approvals: {
        Row: {
          id: string
          application_id: string
          approver_id: string
          step: number
          status: string
          comment: string | null
          approved_at: string
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          approver_id: string
          step?: number
          status: string
          comment?: string | null
          approved_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          approver_id?: string
          step?: number
          status?: string
          comment?: string | null
          approved_at?: string
          created_at?: string
        }
      }
      travel_regulations: {
        Row: {
          id: string
          organization_id: string | null
          name: string
          version: string
          company_info: any
          articles: any
          allowance_settings: any
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          name: string
          version?: string
          company_info?: any
          articles?: any
          allowance_settings?: any
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          name?: string
          version?: string
          company_info?: any
          articles?: any
          allowance_settings?: any
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          application_id: string | null
          type: string
          title: string
          content: any
          file_url: string | null
          file_size: number | null
          mime_type: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          application_id?: string | null
          type: string
          title: string
          content?: any
          file_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          application_id?: string | null
          type?: string
          title?: string
          content?: any
          file_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: any
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: any
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: any
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      expense_categories: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      travel_destinations: {
        Row: {
          id: string
          organization_id: string
          name: string
          address: string | null
          country: string
          is_domestic: boolean
          distance_from_office: number | null
          standard_transportation_cost: number
          standard_accommodation_cost: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          address?: string | null
          country?: string
          is_domestic?: boolean
          distance_from_office?: number | null
          standard_transportation_cost?: number
          standard_accommodation_cost?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          address?: string | null
          country?: string
          is_domestic?: boolean
          distance_from_office?: number | null
          standard_transportation_cost?: number
          standard_accommodation_cost?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expense_items: {
        Row: {
          id: string
          application_id: string
          category_id: string | null
          date: string
          amount: number
          description: string | null
          receipt_url: string | null
          receipt_metadata: any
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          category_id?: string | null
          date: string
          amount: number
          description?: string | null
          receipt_url?: string | null
          receipt_metadata?: any
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          category_id?: string | null
          date?: string
          amount?: number
          description?: string | null
          receipt_url?: string | null
          receipt_metadata?: any
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      business_trip_details: {
        Row: {
          id: string
          application_id: string
          destination_id: string | null
          start_date: string
          end_date: string
          purpose: string
          participants: string | null
          estimated_daily_allowance: number
          estimated_transportation: number
          estimated_accommodation: number
          actual_daily_allowance: number
          actual_transportation: number
          actual_accommodation: number
          report_submitted: boolean
          report_content: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          destination_id?: string | null
          start_date: string
          end_date: string
          purpose: string
          participants?: string | null
          estimated_daily_allowance?: number
          estimated_transportation?: number
          estimated_accommodation?: number
          actual_daily_allowance?: number
          actual_transportation?: number
          actual_accommodation?: number
          report_submitted?: boolean
          report_content?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          destination_id?: string | null
          start_date?: string
          end_date?: string
          purpose?: string
          participants?: string | null
          estimated_daily_allowance?: number
          estimated_transportation?: number
          estimated_accommodation?: number
          actual_daily_allowance?: number
          actual_transportation?: number
          actual_accommodation?: number
          report_submitted?: boolean
          report_content?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounting_integration_logs: {
        Row: {
          id: string
          application_id: string
          service_name: string
          operation_type: string
          request_data: any
          response_data: any
          status: string
          error_message: string | null
          retry_count: number
          last_retry_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          service_name: string
          operation_type: string
          request_data?: any
          response_data?: any
          status: string
          error_message?: string | null
          retry_count?: number
          last_retry_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          service_name?: string
          operation_type?: string
          request_data?: any
          response_data?: any
          status?: string
          error_message?: string | null
          retry_count?: number
          last_retry_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

// 型定義 - 更新
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  position: string | null
  department: string | null
  role: string | null
  default_organization_id: string | null
  avatar_url: string | null
  onboarding_completed: boolean | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  description: string | null
  owner_id: string
  settings: any
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  organization_id: string | null
  type: 'business_trip' | 'expense'
  title: string
  description: string | null
  data: any
  total_amount: number
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'returned'
  submitted_at: string | null
  approved_at: string | null
  approved_by: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
}
// 認証関連のヘルパー関数
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentUserProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error);
    return null;
  }

  return profile;
};

export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // ローカルストレージのクリア
  localStorage.removeItem('userProfile');
  localStorage.removeItem('demoMode');
  localStorage.removeItem('demoSession');
};