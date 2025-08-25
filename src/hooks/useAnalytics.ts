import { useState, useEffect } from 'react'
import { getAnalytics } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface AnalyticsData {
  summary: {
    monthlyTotal: number
    monthlyCount: number
    pendingCount: number
    approvedCount: number
    averageAmount: number
  }
  trends: {
    monthly: { [key: string]: { total: number, count: number, businessTrip: number, expense: number } }
  }
  breakdowns: {
    byDepartment: { [key: string]: number }
  }
  generatedAt: string
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.default_organization_id) {
      fetchBasicAnalytics()
    }
  }, [profile])

  const fetchBasicAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      const data = await getAnalytics(profile.default_organization_id)
      setAnalytics(data)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailedAnalytics = async (
    dateRange: { start: string, end: string },
    metrics: string[],
    groupBy?: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      const data = await getAnalytics(
        profile.default_organization_id,
        dateRange,
        metrics,
        groupBy
      )

      return { success: true, data }
    } catch (err) {
      console.error('Detailed analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch detailed analytics')
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to fetch detailed analytics' 
      }
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async (
    format: 'csv' | 'excel',
    dateRange: { start: string, end: string },
    includeCharts: boolean = false
  ) => {
    try {
      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      // 詳細データを取得
      const analyticsData = await getAnalytics(
        profile.default_organization_id,
        dateRange,
        ['total_amount', 'application_count', 'approval_rate', 'processing_time'],
        'department'
      )

      // CSVまたはExcel形式でエクスポート
      const exportData = formatForExport(analyticsData, format)
      
      // ダウンロード用のBlobを作成
      const blob = new Blob([exportData], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics_${dateRange.start}_${dateRange.end}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return { success: true }
    } catch (err) {
      console.error('Export analytics error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to export analytics' 
      }
    }
  }

  return {
    analytics,
    loading,
    error,
    fetchBasicAnalytics,
    fetchDetailedAnalytics,
    exportAnalytics,
    refreshAnalytics: fetchBasicAnalytics
  }
}

function formatForExport(data: any, format: 'csv' | 'excel'): string {
  if (format === 'csv') {
    const headers = ['部署', '申請数', '合計金額', '承認率']
    const rows = Object.entries(data.groupedData || {}).map(([dept, stats]: [string, any]) => [
      dept,
      stats.count,
      stats.totalAmount,
      `${((stats.approvedCount / stats.count) * 100).toFixed(1)}%`
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  // Excel形式の場合（簡略化）
  return JSON.stringify(data, null, 2)
}