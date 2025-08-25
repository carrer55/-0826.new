import { createClient } from 'npm:@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AccountingRequest {
  applicationId: string
  action: 'create_entry' | 'update_entry' | 'delete_entry'
  serviceConfig?: {
    service: 'freee' | 'moneyforward' | 'yayoi'
    apiKey: string
    companyId?: string
  }
}

interface FreeeTransactionData {
  company_id: number
  issue_date: string
  type: 'expense'
  partner_name: string
  details: Array<{
    account_item_id: number
    tax_code: number
    amount: number
    description: string
  }>
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

    const { applicationId, action, serviceConfig }: AccountingRequest = await req.json()

    // 申請データを取得
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .select(`
        *,
        user_profiles!applications_user_id_fkey(full_name, company_name),
        organizations(name, settings),
        expense_items(*),
        business_trip_details(*)
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

    // 組織の会計設定を取得
    const accountingSettings = application.organizations?.settings?.accounting || {}
    const defaultService = accountingSettings.defaultService || 'freee'
    const serviceCredentials = accountingSettings.services?.[defaultService]

    if (!serviceCredentials) {
      // ログに記録して失敗を返す
      await logAccountingOperation(supabaseClient, applicationId, defaultService, action, 'failed', 'Service credentials not configured')
      
      return new Response(
        JSON.stringify({ error: 'Accounting service not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let result
    try {
      switch (defaultService) {
        case 'freee':
          result = await handleFreeeIntegration(application, action, serviceCredentials)
          break
        case 'moneyforward':
          result = await handleMoneyForwardIntegration(application, action, serviceCredentials)
          break
        case 'yayoi':
          result = await handleYayoiIntegration(application, action, serviceCredentials)
          break
        default:
          throw new Error(`Unsupported accounting service: ${defaultService}`)
      }

      // 成功ログを記録
      await logAccountingOperation(
        supabaseClient, 
        applicationId, 
        defaultService, 
        action, 
        'success',
        null,
        result
      )

      return new Response(
        JSON.stringify({
          success: true,
          service: defaultService,
          result: result
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (error) {
      // エラーログを記録
      await logAccountingOperation(
        supabaseClient, 
        applicationId, 
        defaultService, 
        action, 
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      )

      return new Response(
        JSON.stringify({ 
          error: 'Accounting integration failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Accounting integration error:', error)
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

async function handleFreeeIntegration(application: any, action: string, credentials: any) {
  const apiUrl = 'https://api.freee.co.jp/api/1/deals'
  
  if (action === 'create_entry') {
    const transactionData: FreeeTransactionData = {
      company_id: credentials.companyId,
      issue_date: new Date().toISOString().split('T')[0],
      type: 'expense',
      partner_name: application.user_profiles.company_name || '出張者',
      details: []
    }

    // 出張申請の場合
    if (application.type === 'business_trip' && application.business_trip_details?.[0]) {
      const trip = application.business_trip_details[0]
      transactionData.details = [
        {
          account_item_id: 123, // 旅費交通費の勘定科目ID
          tax_code: 108, // 課税仕入8%
          amount: trip.estimated_daily_allowance || 0,
          description: `出張日当 - ${trip.purpose}`
        },
        {
          account_item_id: 123,
          tax_code: 108,
          amount: trip.estimated_transportation || 0,
          description: `交通費 - ${trip.purpose}`
        },
        {
          account_item_id: 123,
          tax_code: 108,
          amount: trip.estimated_accommodation || 0,
          description: `宿泊費 - ${trip.purpose}`
        }
      ].filter(detail => detail.amount > 0)
    }

    // 経費申請の場合
    if (application.type === 'expense' && application.expense_items) {
      transactionData.details = application.expense_items.map((item: any) => ({
        account_item_id: 123, // 旅費交通費の勘定科目ID
        tax_code: 108,
        amount: item.amount,
        description: item.description || item.category
      }))
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Freee API error: ${response.status} - ${errorData}`)
    }

    return await response.json()
  }

  return { message: 'Action not implemented' }
}

async function handleMoneyForwardIntegration(application: any, action: string, credentials: any) {
  // MoneyForward API連携の実装
  const apiUrl = 'https://expense.moneyforward.com/api/external/v1/offices'
  
  if (action === 'create_entry') {
    // MoneyForward固有のデータ形式に変換
    const expenseData = {
      office_id: credentials.officeId,
      title: application.title,
      amount: application.total_amount,
      expense_date: new Date().toISOString().split('T')[0],
      category: application.type === 'business_trip' ? '出張費' : '経費',
      description: application.description || ''
    }

    const response = await fetch(`${apiUrl}/${credentials.officeId}/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData)
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`MoneyForward API error: ${response.status} - ${errorData}`)
    }

    return await response.json()
  }

  return { message: 'Action not implemented' }
}

async function handleYayoiIntegration(application: any, action: string, credentials: any) {
  // 弥生会計 API連携の実装
  if (action === 'create_entry') {
    // 弥生会計は主にCSVインポートベースなので、CSVデータを生成
    const csvData = generateYayoiCSV(application)
    
    // 実際の実装では、弥生会計のAPIまたはファイル連携を使用
    return {
      message: 'CSV data generated for Yayoi',
      csvData: csvData,
      filename: `expense_${applicationId}_${new Date().toISOString().split('T')[0]}.csv`
    }
  }

  return { message: 'Action not implemented' }
}

function generateYayoiCSV(application: any): string {
  const headers = ['取引日', '借方勘定科目', '借方補助科目', '借方金額', '貸方勘定科目', '貸方補助科目', '貸方金額', '摘要']
  const rows = []

  if (application.type === 'business_trip' && application.business_trip_details?.[0]) {
    const trip = application.business_trip_details[0]
    const date = new Date().toISOString().split('T')[0]
    
    if (trip.estimated_daily_allowance > 0) {
      rows.push([
        date,
        '旅費交通費',
        '出張日当',
        trip.estimated_daily_allowance,
        '現金',
        '',
        trip.estimated_daily_allowance,
        `出張日当 - ${trip.purpose}`
      ])
    }
  }

  if (application.type === 'expense' && application.expense_items) {
    application.expense_items.forEach((item: any) => {
      const date = item.date || new Date().toISOString().split('T')[0]
      rows.push([
        date,
        '旅費交通費',
        item.category || '経費',
        item.amount,
        '現金',
        '',
        item.amount,
        item.description || item.category
      ])
    })
  }

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')

  return csvContent
}

async function logAccountingOperation(
  supabaseClient: any,
  applicationId: string,
  serviceName: string,
  operationType: string,
  status: 'success' | 'failed' | 'pending',
  errorMessage?: string | null,
  responseData?: any
) {
  try {
    await supabaseClient
      .from('accounting_integration_logs')
      .insert({
        application_id: applicationId,
        service_name: serviceName,
        operation_type: operationType,
        response_data: responseData || null,
        status: status,
        error_message: errorMessage,
        retry_count: 0
      })
  } catch (error) {
    console.error('Failed to log accounting operation:', error)
  }
}