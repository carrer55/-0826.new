import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface AccountingService {
  service: 'freee' | 'moneyforward' | 'yayoi'
  connected: boolean
  lastSync: string | null
  status: 'active' | 'error' | 'disconnected'
  apiVersion: string
  permissions: string[]
  credentials?: {
    accessToken?: string
    refreshToken?: string
    companyId?: string
    officeId?: string
  }
}

export interface AccountingLog {
  id: string
  application_id: string
  service_name: string
  operation_type: string
  request_data: any
  response_data: any
  status: 'success' | 'failed' | 'pending'
  error_message: string | null
  retry_count: number
  last_retry_at: string | null
  created_at: string
}

export function useAccountingIntegration() {
  const [services, setServices] = useState<AccountingService[]>([])
  const [logs, setLogs] = useState<AccountingLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.default_organization_id) {
      fetchAccountingSettings()
      fetchAccountingLogs()
    }
  }, [profile])

  const fetchAccountingSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: organization, error: fetchError } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', profile?.default_organization_id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const accountingSettings = organization?.settings?.accounting || {}
      const defaultServices: AccountingService[] = [
        {
          service: 'freee',
          connected: false,
          lastSync: null,
          status: 'disconnected',
          apiVersion: 'v1.0',
          permissions: []
        },
        {
          service: 'moneyforward',
          connected: false,
          lastSync: null,
          status: 'disconnected',
          apiVersion: 'v2.0',
          permissions: []
        },
        {
          service: 'yayoi',
          connected: false,
          lastSync: null,
          status: 'disconnected',
          apiVersion: 'v1.2',
          permissions: []
        }
      ]

      // 設定済みのサービス情報をマージ
      const configuredServices = defaultServices.map(service => {
        const serviceConfig = accountingSettings.services?.[service.service]
        if (serviceConfig) {
          return {
            ...service,
            connected: serviceConfig.connected || false,
            lastSync: serviceConfig.lastSync || null,
            status: serviceConfig.status || 'disconnected',
            permissions: serviceConfig.permissions || []
          }
        }
        return service
      })

      setServices(configuredServices)
    } catch (err) {
      console.error('Accounting settings fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch accounting settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchAccountingLogs = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('accounting_integration_logs')
        .select(`
          *,
          applications(id, title, type, total_amount)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (fetchError) {
        throw fetchError
      }

      setLogs(data || [])
    } catch (err) {
      console.error('Accounting logs fetch error:', err)
    }
  }

  const connectService = async (
    service: 'freee' | 'moneyforward' | 'yayoi',
    credentials: any
  ) => {
    try {
      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      // 組織の設定を更新
      const { data: currentOrg, error: fetchError } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', profile.default_organization_id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const updatedSettings = {
        ...currentOrg.settings,
        accounting: {
          ...currentOrg.settings?.accounting,
          services: {
            ...currentOrg.settings?.accounting?.services,
            [service]: {
              connected: true,
              status: 'active',
              lastSync: new Date().toISOString(),
              permissions: ['会計帳簿', '取引先', '品目'],
              credentials: credentials
            }
          }
        }
      }

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ settings: updatedSettings })
        .eq('id', profile.default_organization_id)

      if (updateError) {
        throw updateError
      }

      await fetchAccountingSettings()
      return { success: true }
    } catch (err) {
      console.error('Service connection error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to connect service' 
      }
    }
  }

  const disconnectService = async (service: 'freee' | 'moneyforward' | 'yayoi') => {
    try {
      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      const { data: currentOrg, error: fetchError } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', profile.default_organization_id)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const updatedSettings = {
        ...currentOrg.settings,
        accounting: {
          ...currentOrg.settings?.accounting,
          services: {
            ...currentOrg.settings?.accounting?.services,
            [service]: {
              connected: false,
              status: 'disconnected',
              lastSync: null,
              permissions: [],
              credentials: null
            }
          }
        }
      }

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ settings: updatedSettings })
        .eq('id', profile.default_organization_id)

      if (updateError) {
        throw updateError
      }

      await fetchAccountingSettings()
      return { success: true }
    } catch (err) {
      console.error('Service disconnection error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to disconnect service' 
      }
    }
  }

  const syncApplication = async (applicationId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/accounting-integration`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          action: 'create_entry'
        })
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      const result = await response.json()
      await fetchAccountingLogs()
      return { success: true, result }
    } catch (err) {
      console.error('Application sync error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to sync application' 
      }
    }
  }

  const retryFailedSync = async (logId: string) => {
    try {
      const log = logs.find(l => l.id === logId)
      if (!log) {
        throw new Error('Log not found')
      }

      const result = await syncApplication(log.application_id)
      return result
    } catch (err) {
      console.error('Retry sync error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to retry sync' 
      }
    }
  }

  return {
    services,
    logs,
    loading,
    error,
    connectService,
    disconnectService,
    syncApplication,
    retryFailedSync,
    refreshSettings: fetchAccountingSettings,
    refreshLogs: fetchAccountingLogs
  }
}