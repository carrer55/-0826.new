import { createClient } from 'npm:@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface AnalyticsRequest {
  organizationId: string
  dateRange: {
    start: string
    end: string
  }
  metrics: string[]
  groupBy?: 'department' | 'user' | 'month' | 'category'
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

    if (req.method === 'GET') {
      // クエリパラメータから組織IDを取得
      const url = new URL(req.url)
      const organizationId = url.searchParams.get('organizationId')
      
      if (!organizationId) {
        return new Response(
          JSON.stringify({ error: 'Organization ID is required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // 基本統計を取得
      const stats = await getBasicStatistics(supabaseClient, organizationId)
      
      return new Response(
        JSON.stringify(stats),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'POST') {
      const { organizationId, dateRange, metrics, groupBy }: AnalyticsRequest = await req.json()

      // 詳細分析を実行
      const analytics = await generateDetailedAnalytics(
        supabaseClient, 
        organizationId, 
        dateRange, 
        metrics, 
        groupBy
      )

      return new Response(
        JSON.stringify(analytics),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Data analytics error:', error)
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

async function getBasicStatistics(supabaseClient: any, organizationId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
  const currentYear = new Date().getFullYear() + '-01-01'

  // 今月の統計
  const { data: monthlyStats } = await supabaseClient
    .from('applications')
    .select('type, total_amount, status')
    .eq('organization_id', organizationId)
    .gte('created_at', currentMonth)

  // 今年の統計
  const { data: yearlyStats } = await supabaseClient
    .from('applications')
    .select('type, total_amount, status, created_at')
    .eq('organization_id', organizationId)
    .gte('created_at', currentYear)

  // 部署別統計
  const { data: departmentStats } = await supabaseClient
    .from('applications')
    .select(`
      total_amount,
      user_profiles!applications_user_id_fkey(department)
    `)
    .eq('organization_id', organizationId)
    .eq('status', 'approved')
    .gte('created_at', currentMonth)

  // 統計を計算
  const monthlyTotal = monthlyStats?.reduce((sum, app) => sum + (app.total_amount || 0), 0) || 0
  const monthlyCount = monthlyStats?.length || 0
  const pendingCount = monthlyStats?.filter(app => app.status === 'pending').length || 0
  const approvedCount = monthlyStats?.filter(app => app.status === 'approved').length || 0

  // 月別トレンド（過去12ヶ月）
  const monthlyTrend = await getMonthlyTrend(supabaseClient, organizationId)

  // 部署別集計
  const departmentBreakdown = departmentStats?.reduce((acc: any, app: any) => {
    const dept = app.user_profiles?.department || '未設定'
    acc[dept] = (acc[dept] || 0) + (app.total_amount || 0)
    return acc
  }, {}) || {}

  return {
    summary: {
      monthlyTotal,
      monthlyCount,
      pendingCount,
      approvedCount,
      averageAmount: monthlyCount > 0 ? monthlyTotal / monthlyCount : 0
    },
    trends: {
      monthly: monthlyTrend
    },
    breakdowns: {
      byDepartment: departmentBreakdown
    },
    generatedAt: new Date().toISOString()
  }
}

async function getMonthlyTrend(supabaseClient: any, organizationId: string) {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const { data: trendData } = await supabaseClient
    .from('applications')
    .select('total_amount, created_at, type')
    .eq('organization_id', organizationId)
    .eq('status', 'approved')
    .gte('created_at', twelveMonthsAgo.toISOString())

  // 月別に集計
  const monthlyData: { [key: string]: { total: number, count: number, businessTrip: number, expense: number } } = {}

  trendData?.forEach((app: any) => {
    const month = app.created_at.slice(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { total: 0, count: 0, businessTrip: 0, expense: 0 }
    }
    monthlyData[month].total += app.total_amount || 0
    monthlyData[month].count += 1
    if (app.type === 'business_trip') {
      monthlyData[month].businessTrip += app.total_amount || 0
    } else {
      monthlyData[month].expense += app.total_amount || 0
    }
  })

  return monthlyData
}

async function generateDetailedAnalytics(
  supabaseClient: any,
  organizationId: string,
  dateRange: { start: string, end: string },
  metrics: string[],
  groupBy?: string
) {
  const results: any = {}

  // 期間内の申請データを取得
  const { data: applications } = await supabaseClient
    .from('applications')
    .select(`
      *,
      user_profiles!applications_user_id_fkey(full_name, department, position),
      expense_items(*),
      business_trip_details(*)
    `)
    .eq('organization_id', organizationId)
    .gte('created_at', dateRange.start)
    .lte('created_at', dateRange.end)

  if (!applications) {
    return { error: 'No data found for the specified period' }
  }

  // メトリクス別の計算
  for (const metric of metrics) {
    switch (metric) {
      case 'total_amount':
        results.totalAmount = applications.reduce((sum, app) => sum + (app.total_amount || 0), 0)
        break
        
      case 'application_count':
        results.applicationCount = applications.length
        break
        
      case 'average_amount':
        const total = applications.reduce((sum, app) => sum + (app.total_amount || 0), 0)
        results.averageAmount = applications.length > 0 ? total / applications.length : 0
        break
        
      case 'approval_rate':
        const approvedCount = applications.filter(app => app.status === 'approved').length
        results.approvalRate = applications.length > 0 ? (approvedCount / applications.length) * 100 : 0
        break
        
      case 'processing_time':
        const processedApps = applications.filter(app => app.approved_at && app.submitted_at)
        const avgProcessingTime = processedApps.reduce((sum, app) => {
          const submitted = new Date(app.submitted_at).getTime()
          const approved = new Date(app.approved_at).getTime()
          return sum + (approved - submitted)
        }, 0) / processedApps.length
        results.averageProcessingTime = avgProcessingTime / (1000 * 60 * 60 * 24) // 日数
        break
    }
  }

  // グループ化
  if (groupBy) {
    results.groupedData = groupApplications(applications, groupBy)
  }

  return {
    ...results,
    period: dateRange,
    totalRecords: applications.length,
    generatedAt: new Date().toISOString()
  }
}

function groupApplications(applications: any[], groupBy: string) {
  const grouped: { [key: string]: any } = {}

  applications.forEach(app => {
    let key = 'unknown'
    
    switch (groupBy) {
      case 'department':
        key = app.user_profiles?.department || '未設定'
        break
      case 'user':
        key = app.user_profiles?.full_name || '不明'
        break
      case 'month':
        key = app.created_at.slice(0, 7) // YYYY-MM
        break
      case 'category':
        key = app.type === 'business_trip' ? '出張申請' : '経費申請'
        break
    }

    if (!grouped[key]) {
      grouped[key] = {
        count: 0,
        totalAmount: 0,
        approvedCount: 0,
        pendingCount: 0,
        rejectedCount: 0
      }
    }

    grouped[key].count += 1
    grouped[key].totalAmount += app.total_amount || 0
    
    switch (app.status) {
      case 'approved':
        grouped[key].approvedCount += 1
        break
      case 'pending':
        grouped[key].pendingCount += 1
        break
      case 'rejected':
        grouped[key].rejectedCount += 1
        break
    }
  })

  return grouped
}