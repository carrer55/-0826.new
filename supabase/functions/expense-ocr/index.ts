import { createClient } from 'npm:@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OCRRequest {
  imageData: string // base64 encoded image
  applicationId: string
  expenseItemId?: string
}

interface OCRResult {
  storeName: string
  date: string
  amount: number
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    amount: number
  }>
  confidence: number
  rawText: string
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

    const { imageData, applicationId, expenseItemId }: OCRRequest = await req.json()

    if (!imageData || !applicationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 画像をストレージに保存
    const fileName = `receipt_${applicationId}_${Date.now()}.jpg`
    const imageBuffer = Uint8Array.from(atob(imageData), c => c.charCodeAt(0))
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('receipts')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Image upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Failed to upload image' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // OCR処理を実行
    const ocrResult = await performOCR(imageData)

    // OCR結果をデータベースに保存
    if (expenseItemId) {
      await supabaseClient
        .from('expense_items')
        .update({
          receipt_url: uploadData.path,
          receipt_metadata: {
            ocr_result: ocrResult,
            processed_at: new Date().toISOString()
          },
          amount: ocrResult.amount > 0 ? ocrResult.amount : undefined,
          date: ocrResult.date || undefined
        })
        .eq('id', expenseItemId)
    }

    return new Response(
      JSON.stringify({
        success: true,
        ocrResult: ocrResult,
        receiptUrl: uploadData.path,
        processedAt: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('OCR processing error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'OCR processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function performOCR(imageData: string): Promise<OCRResult> {
  // 実際の実装では、Google Cloud Vision API、AWS Textract、Azure Computer Visionなどを使用
  // ここではシミュレーション結果を返す
  
  // 簡単なパターンマッチングでレシートの情報を抽出（実際のOCRの代替）
  const mockOCRResult: OCRResult = {
    storeName: extractStoreName(imageData),
    date: extractDate(imageData),
    amount: extractAmount(imageData),
    items: extractItems(imageData),
    confidence: 0.85,
    rawText: 'Mock OCR raw text output'
  }

  return mockOCRResult
}

function extractStoreName(imageData: string): string {
  // 実際の実装では、OCRで抽出したテキストから店舗名を特定
  const storeNames = ['コンビニエンスストア', 'レストラン', 'ホテル', 'タクシー会社', 'JR東日本']
  return storeNames[Math.floor(Math.random() * storeNames.length)]
}

function extractDate(imageData: string): string {
  // 実際の実装では、OCRで抽出したテキストから日付を特定
  const today = new Date()
  const randomDays = Math.floor(Math.random() * 30)
  const receiptDate = new Date(today.getTime() - randomDays * 24 * 60 * 60 * 1000)
  return receiptDate.toISOString().split('T')[0]
}

function extractAmount(imageData: string): number {
  // 実際の実装では、OCRで抽出したテキストから金額を特定
  const amounts = [1200, 2500, 3800, 5000, 8500, 12000, 15000]
  return amounts[Math.floor(Math.random() * amounts.length)]
}

function extractItems(imageData: string): Array<{name: string, quantity: number, unitPrice: number, amount: number}> {
  // 実際の実装では、OCRで抽出したテキストから商品明細を特定
  const mockItems = [
    { name: '弁当', quantity: 1, unitPrice: 500, amount: 500 },
    { name: '飲み物', quantity: 2, unitPrice: 150, amount: 300 },
    { name: 'タクシー代', quantity: 1, unitPrice: 1200, amount: 1200 }
  ]
  
  const numItems = Math.floor(Math.random() * 3) + 1
  return mockItems.slice(0, numItems)
}