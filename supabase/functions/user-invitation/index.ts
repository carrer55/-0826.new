import { createClient } from 'npm:@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface InvitationRequest {
  email: string
  role: 'admin' | 'manager' | 'member'
  organizationId: string
  invitedBy: string
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

    const { email, role, organizationId, invitedBy }: InvitationRequest = await req.json()

    // 入力検証
    if (!email || !role || !organizationId || !invitedBy) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 招待者の権限確認
    const { data: inviter, error: inviterError } = await supabaseClient
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', invitedBy)
      .single()

    if (inviterError || !inviter || !['owner', 'admin'].includes(inviter.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 組織情報を取得
    const { data: organization, error: orgError } = await supabaseClient
      .from('organizations')
      .select('name')
      .eq('id', organizationId)
      .single()

    if (orgError || !organization) {
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 既存の招待をチェック
    const { data: existingInvitation } = await supabaseClient
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .is('accepted_at', null)
      .single()

    let invitationToken: string

    if (existingInvitation) {
      // 既存の招待を更新
      invitationToken = generateInvitationToken()
      
      const { error: updateError } = await supabaseClient
        .from('user_invitations')
        .update({
          role,
          invitation_token: invitationToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invited_by: invitedBy
        })
        .eq('id', existingInvitation.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // 新しい招待を作成
      invitationToken = generateInvitationToken()
      
      const { error: insertError } = await supabaseClient
        .from('user_invitations')
        .insert({
          organization_id: organizationId,
          email,
          role,
          invited_by: invitedBy,
          invitation_token: invitationToken
        })

      if (insertError) {
        throw insertError
      }
    }

    // 招待メールを送信
    const invitationUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/invite/${invitationToken}`
    
    const emailResult = await sendInvitationEmail(
      email,
      organization.name,
      invitationUrl,
      role
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        invitationToken,
        emailResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('User invitation error:', error)
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

function generateInvitationToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function sendInvitationEmail(
  email: string,
  organizationName: string,
  invitationUrl: string,
  role: string
): Promise<any> {
  // 実際の実装では、メール送信サービス（SendGrid、Resend等）を使用
  const emailData = {
    to: email,
    from: 'noreply@kenja-seisan.com',
    subject: `【賢者の精算】${organizationName}への招待`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>組織への招待</h2>
        <p>${organizationName}に${role}として招待されました。</p>
        <p>以下のリンクをクリックして登録を完了してください：</p>
        <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background: #0369a1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          招待を受け入れる
        </a>
        <p style="color: #666; font-size: 12px;">このリンクは7日間有効です。</p>
      </div>
    `,
    text: `${organizationName}に招待されました。以下のURLから登録を完了してください：\n${invitationUrl}`
  }

  // メール送信のシミュレーション
  console.log('Sending invitation email:', emailData)
  
  return {
    messageId: `invitation_${Date.now()}`,
    status: 'sent',
    recipient: email
  }
}