import { createClient } from 'npm:@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NotificationRequest {
  userId: string
  type: 'email' | 'push' | 'both'
  title: string
  message: string
  data?: any
  templateId?: string
}

interface EmailTemplate {
  subject: string
  htmlBody: string
  textBody: string
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

    const { userId, type, title, message, data, templateId }: NotificationRequest = await req.json()

    // ユーザー情報と通知設定を取得
    const { data: userProfile, error: userError } = await supabaseClient
      .from('user_profiles')
      .select('email, full_name, phone')
      .eq('id', userId)
      .single()

    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const results = []

    // メール通知
    if (type === 'email' || type === 'both') {
      try {
        const emailResult = await sendEmail(userProfile, title, message, data, templateId)
        results.push({ type: 'email', success: true, result: emailResult })
      } catch (error) {
        results.push({ 
          type: 'email', 
          success: false, 
          error: error instanceof Error ? error.message : 'Email send failed' 
        })
      }
    }

    // プッシュ通知
    if (type === 'push' || type === 'both') {
      try {
        const pushResult = await sendPushNotification(userId, title, message, data)
        results.push({ type: 'push', success: true, result: pushResult })
      } catch (error) {
        results.push({ 
          type: 'push', 
          success: false, 
          error: error instanceof Error ? error.message : 'Push notification failed' 
        })
      }
    }

    // 通知履歴をデータベースに保存
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: type === 'both' ? 'system' : type,
        title: title,
        message: message,
        data: data || {}
      })

    return new Response(
      JSON.stringify({
        success: true,
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Notification sender error:', error)
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

async function sendEmail(
  userProfile: any, 
  title: string, 
  message: string, 
  data?: any, 
  templateId?: string
): Promise<any> {
  // メールテンプレートを取得または生成
  const template = getEmailTemplate(templateId, title, message, data)
  
  // 実際のメール送信（例: SendGrid, Resend, etc.）
  // ここではシミュレーション
  const emailData = {
    to: userProfile.email,
    from: 'noreply@kenja-seisan.com',
    subject: template.subject,
    html: template.htmlBody,
    text: template.textBody
  }

  // 実際の実装では外部メールサービスのAPIを呼び出し
  console.log('Sending email:', emailData)
  
  return {
    messageId: `email_${Date.now()}`,
    status: 'sent',
    recipient: userProfile.email
  }
}

async function sendPushNotification(
  userId: string, 
  title: string, 
  message: string, 
  data?: any
): Promise<any> {
  // Web Push通知の実装
  // 実際の実装では、ユーザーのプッシュ通知トークンを取得して送信
  
  const pushData = {
    title: title,
    body: message,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data || {},
    actions: [
      {
        action: 'view',
        title: '確認する'
      }
    ]
  }

  console.log('Sending push notification:', pushData)
  
  return {
    messageId: `push_${Date.now()}`,
    status: 'sent',
    userId: userId
  }
}

function getEmailTemplate(
  templateId?: string, 
  title?: string, 
  message?: string, 
  data?: any
): EmailTemplate {
  // テンプレートID別の処理
  switch (templateId) {
    case 'application_approved':
      return {
        subject: `【賢者の精算】申請が承認されました - ${data?.applicationTitle || ''}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">申請が承認されました</h2>
            <p>お疲れ様です。</p>
            <p>以下の申請が承認されました：</p>
            <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>申請タイトル:</strong> ${data?.applicationTitle || ''}</p>
              <p><strong>金額:</strong> ¥${data?.amount?.toLocaleString() || '0'}</p>
              <p><strong>承認日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
            </div>
            <p>ご確認ください。</p>
          </div>
        `,
        textBody: `申請が承認されました\n\n申請タイトル: ${data?.applicationTitle || ''}\n金額: ¥${data?.amount?.toLocaleString() || '0'}\n承認日時: ${new Date().toLocaleString('ja-JP')}`
      }
    
    case 'application_rejected':
      return {
        subject: `【賢者の精算】申請が否認されました - ${data?.applicationTitle || ''}`,
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">申請が否認されました</h2>
            <p>お疲れ様です。</p>
            <p>以下の申請が否認されました：</p>
            <div style="background: #fef2f2; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>申請タイトル:</strong> ${data?.applicationTitle || ''}</p>
              <p><strong>否認理由:</strong> ${data?.reason || '理由なし'}</p>
              <p><strong>否認日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
            </div>
            <p>詳細については承認者にお問い合わせください。</p>
          </div>
        `,
        textBody: `申請が否認されました\n\n申請タイトル: ${data?.applicationTitle || ''}\n否認理由: ${data?.reason || '理由なし'}\n否認日時: ${new Date().toLocaleString('ja-JP')}`
      }

    default:
      return {
        subject: title || '【賢者の精算】通知',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${title || '通知'}</h2>
            <p>${message || ''}</p>
          </div>
        `,
        textBody: `${title || '通知'}\n\n${message || ''}`
      }
  }
}