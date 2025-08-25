import { createClient } from 'npm:@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DocumentRequest {
  type: 'business_report' | 'allowance_detail' | 'expense_settlement' | 'travel_regulation'
  applicationId?: string
  organizationId: string
  format: 'pdf' | 'word' | 'html'
  templateData?: any
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

    const { type, applicationId, organizationId, format, templateData }: DocumentRequest = await req.json()

    let documentData: any = {}

    // ドキュメントタイプ別のデータ取得
    switch (type) {
      case 'business_report':
        documentData = await generateBusinessReport(supabaseClient, applicationId!, organizationId)
        break
        
      case 'allowance_detail':
        documentData = await generateAllowanceDetail(supabaseClient, organizationId, templateData)
        break
        
      case 'expense_settlement':
        documentData = await generateExpenseSettlement(supabaseClient, applicationId!, organizationId)
        break
        
      case 'travel_regulation':
        documentData = await generateTravelRegulation(supabaseClient, organizationId, templateData)
        break
        
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported document type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

    // ドキュメント生成
    const document = await generateDocument(documentData, format, type)

    // ドキュメントをストレージに保存
    const fileName = `${type}_${Date.now()}.${format}`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('documents')
      .upload(fileName, document.content, {
        contentType: document.mimeType,
        upsert: false
      })

    if (uploadError) {
      console.error('Document upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to save document' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // ドキュメント記録をデータベースに保存
    const { data: docRecord, error: docError } = await supabaseClient
      .from('documents')
      .insert({
        organization_id: organizationId,
        application_id: applicationId || null,
        type: type,
        title: documentData.title || `${type}_${new Date().toLocaleDateString('ja-JP')}`,
        file_url: uploadData.path,
        file_size: document.content.length,
        mime_type: document.mimeType,
        status: 'completed',
        content: documentData
      })
      .select()
      .single()

    if (docError) {
      console.error('Document record error:', docError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentId: docRecord?.id,
        fileName: fileName,
        downloadUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/documents/${fileName}`,
        generatedAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Document generator error:', error)
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

async function generateBusinessReport(supabaseClient: any, applicationId: string, organizationId: string) {
  const { data: application } = await supabaseClient
    .from('applications')
    .select(`
      *,
      user_profiles!applications_user_id_fkey(full_name, position, department),
      organizations(name, settings),
      business_trip_details(*)
    `)
    .eq('id', applicationId)
    .single()

  const tripDetails = application.business_trip_details?.[0]

  return {
    title: `出張報告書 - ${application.title}`,
    applicant: application.user_profiles.full_name,
    position: application.user_profiles.position,
    department: application.user_profiles.department,
    organization: application.organizations.name,
    tripPurpose: tripDetails?.purpose || '',
    startDate: tripDetails?.start_date || '',
    endDate: tripDetails?.end_date || '',
    reportContent: tripDetails?.report_content || '',
    totalAmount: application.total_amount,
    generatedAt: new Date().toISOString()
  }
}

async function generateAllowanceDetail(supabaseClient: any, organizationId: string, templateData: any) {
  const { startDate, endDate, userId } = templateData

  // 期間内の出張申請を取得
  const { data: applications } = await supabaseClient
    .from('applications')
    .select(`
      *,
      user_profiles!applications_user_id_fkey(full_name, position),
      business_trip_details(*)
    `)
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('type', 'business_trip')
    .eq('status', 'approved')
    .gte('created_at', startDate)
    .lte('created_at', endDate)

  const trips = applications?.map(app => ({
    date: app.business_trip_details?.[0]?.start_date || app.created_at.split('T')[0],
    destination: app.business_trip_details?.[0]?.destination || '不明',
    days: calculateDays(
      app.business_trip_details?.[0]?.start_date,
      app.business_trip_details?.[0]?.end_date
    ),
    allowance: app.business_trip_details?.[0]?.actual_daily_allowance || 0
  })) || []

  const totalAllowance = trips.reduce((sum, trip) => sum + trip.allowance, 0)

  return {
    title: `日当支給明細書 - ${startDate} ～ ${endDate}`,
    period: { startDate, endDate },
    applicant: applications?.[0]?.user_profiles?.full_name || '',
    position: applications?.[0]?.user_profiles?.position || '',
    trips: trips,
    totalAllowance: totalAllowance,
    generatedAt: new Date().toISOString()
  }
}

async function generateExpenseSettlement(supabaseClient: any, applicationId: string, organizationId: string) {
  const { data: application } = await supabaseClient
    .from('applications')
    .select(`
      *,
      user_profiles!applications_user_id_fkey(full_name, position, department),
      organizations(name),
      expense_items(*)
    `)
    .eq('id', applicationId)
    .single()

  return {
    title: `旅費精算書 - ${application.title}`,
    applicant: application.user_profiles.full_name,
    position: application.user_profiles.position,
    department: application.user_profiles.department,
    organization: application.organizations.name,
    expenseItems: application.expense_items || [],
    totalAmount: application.total_amount,
    submittedDate: application.submitted_at,
    approvedDate: application.approved_at,
    generatedAt: new Date().toISOString()
  }
}

async function generateTravelRegulation(supabaseClient: any, organizationId: string, templateData: any) {
  const { data: organization } = await supabaseClient
    .from('organizations')
    .select('name, settings')
    .eq('id', organizationId)
    .single()

  const { data: regulation } = await supabaseClient
    .from('travel_regulations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .single()

  return {
    title: `出張旅費規程 - ${organization.name}`,
    companyName: organization.name,
    version: regulation?.version || 'v1.0',
    articles: regulation?.articles || {},
    allowanceSettings: regulation?.allowance_settings || {},
    generatedAt: new Date().toISOString(),
    ...templateData
  }
}

async function generateDocument(data: any, format: string, type: string) {
  switch (format) {
    case 'html':
      return {
        content: generateHTMLDocument(data, type),
        mimeType: 'text/html'
      }
      
    case 'pdf':
      // 実際の実装では、HTMLをPDFに変換するライブラリを使用
      const htmlContent = generateHTMLDocument(data, type)
      return {
        content: new TextEncoder().encode(htmlContent), // 簡略化
        mimeType: 'application/pdf'
      }
      
    case 'word':
      // 実際の実装では、Word文書を生成するライブラリを使用
      return {
        content: new TextEncoder().encode(generateWordDocument(data, type)),
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
      
    default:
      throw new Error(`Unsupported format: ${format}`)
  }
}

function generateHTMLDocument(data: any, type: string): string {
  const baseStyle = `
    <style>
      body { font-family: 'Noto Sans JP', Arial, sans-serif; line-height: 1.6; margin: 40px; }
      .header { text-align: center; margin-bottom: 30px; }
      .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
      .subtitle { font-size: 14px; color: #666; }
      .section { margin-bottom: 20px; }
      .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; }
      .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
      .info-item { padding: 8px; background: #f5f5f5; }
      .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
      .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      .table th { background: #f5f5f5; font-weight: bold; }
      .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; }
    </style>
  `

  switch (type) {
    case 'business_report':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title}</title>
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="title">${data.title}</div>
            <div class="subtitle">作成日: ${new Date(data.generatedAt).toLocaleDateString('ja-JP')}</div>
          </div>
          
          <div class="section">
            <div class="info-grid">
              <div class="info-item"><strong>報告者:</strong> ${data.applicant}</div>
              <div class="info-item"><strong>役職:</strong> ${data.position}</div>
              <div class="info-item"><strong>部署:</strong> ${data.department}</div>
              <div class="info-item"><strong>所属:</strong> ${data.organization}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">出張概要</div>
            <div class="info-grid">
              <div class="info-item"><strong>出張期間:</strong> ${data.startDate} ～ ${data.endDate}</div>
              <div class="info-item"><strong>出張目的:</strong> ${data.tripPurpose}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">出張内容</div>
            <div style="padding: 15px; background: #f9f9f9; border-radius: 5px;">
              ${data.reportContent || '出張内容が入力されていません。'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">経費概要</div>
            <div class="total">合計金額: ¥${data.totalAmount?.toLocaleString() || '0'}</div>
          </div>
        </body>
        </html>
      `

    case 'allowance_detail':
      const tripsTable = data.trips.map((trip: any) => `
        <tr>
          <td>${trip.date}</td>
          <td>${trip.destination}</td>
          <td>${trip.days}日</td>
          <td>¥${trip.allowance.toLocaleString()}</td>
        </tr>
      `).join('')

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title}</title>
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="title">${data.title}</div>
            <div class="subtitle">作成日: ${new Date(data.generatedAt).toLocaleDateString('ja-JP')}</div>
          </div>
          
          <div class="section">
            <div class="info-grid">
              <div class="info-item"><strong>氏名:</strong> ${data.applicant}</div>
              <div class="info-item"><strong>役職:</strong> ${data.position}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">出張日当明細</div>
            <table class="table">
              <thead>
                <tr>
                  <th>出張日</th>
                  <th>出張先</th>
                  <th>日数</th>
                  <th>日当額</th>
                </tr>
              </thead>
              <tbody>
                ${tripsTable}
              </tbody>
            </table>
            <div class="total">合計支給額: ¥${data.totalAllowance.toLocaleString()}</div>
          </div>
        </body>
        </html>
      `

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Document</title>
          ${baseStyle}
        </head>
        <body>
          <div class="header">
            <div class="title">ドキュメント</div>
          </div>
          <p>このドキュメントタイプはまだサポートされていません。</p>
        </body>
        </html>
      `
  }
}

function generateWordDocument(data: any, type: string): string {
  // 実際の実装では、docxライブラリを使用してWord文書を生成
  // ここでは簡略化してXMLベースの内容を返す
  return `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <title>${data.title}</title>
  <content>${JSON.stringify(data, null, 2)}</content>
</document>`
}

function calculateDays(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 1
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays + 1 // 出発日も含める
}