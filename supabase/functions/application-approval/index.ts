import { createClient } from 'npm:@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ApprovalRequest {
  applicationId: string
  action: 'approved' | 'rejected' | 'returned'
  comment?: string
  approverId: string
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { applicationId, action, comment, approverId }: ApprovalRequest = await req.json()

    // 入力検証
    if (!applicationId || !action || !approverId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 承認者の権限確認
    const { data: approver, error: approverError } = await supabaseClient
      .from('user_profiles')
      .select('id, role, default_organization_id')
      .eq('id', approverId)
      .single()

    if (approverError || !approver) {
      return new Response(
        JSON.stringify({ error: 'Approver not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 申請情報を取得
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .select(`
        *,
        user_profiles!applications_user_id_fkey(full_name, email),
        organizations(name)
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 承認ワークフロー関数を呼び出し
    const { data: workflowResult, error: workflowError } = await supabaseClient
      .rpc('advance_approval_workflow', {
        p_application_id: applicationId,
        p_approver_id: approverId,
        p_action: action,
        p_comment: comment || null
      })

    if (workflowError) {
      console.error('Workflow error:', workflowError)
      return new Response(
        JSON.stringify({ error: 'Approval workflow failed', details: workflowError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 会計システム連携（承認済みの場合）
    if (action === 'approved') {
      try {
        // 会計システム連携のEdge Functionを呼び出し
        const accountingResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/accounting-integration`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: applicationId,
            action: 'create_entry'
          })
        })

        if (!accountingResponse.ok) {
          console.warn('Accounting integration failed, but approval succeeded')
        }
      } catch (error) {
        console.warn('Accounting integration error:', error)
        // 会計連携の失敗は承認処理を止めない
      }
    }

    // レスポンス
    return new Response(
      JSON.stringify({
        success: true,
        message: `Application ${action} successfully`,
        applicationId: applicationId,
        action: action,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Application approval error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})