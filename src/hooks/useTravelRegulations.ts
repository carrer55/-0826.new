import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface TravelRegulation {
  id: string
  organization_id: string | null
  name: string
  version: string
  company_info: {
    name: string
    address: string
    representative: string
    establishedDate: string
    revision: number
  }
  articles: {
    article1: string
    article2: string
    article3: string
    article4: string
    article5: string
    article6: string
    article7: string
    article8: string
    article9: string
    article10: string
  }
  allowance_settings: {
    positions: Array<{
      id: string
      name: string
      dailyAllowance: number
      transportationAllowance: number
      accommodationAllowance: number
    }>
    distanceThreshold: number
    isTransportationRealExpense: boolean
    isAccommodationRealExpense: boolean
  }
  status: 'draft' | 'active' | 'archived'
  created_by: string | null
  created_at: string
  updated_at: string
}

export function useTravelRegulations() {
  const [regulations, setRegulations] = useState<TravelRegulation[]>([])
  const [currentRegulation, setCurrentRegulation] = useState<TravelRegulation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  useEffect(() => {
    if (profile?.default_organization_id) {
      fetchRegulations()
      fetchCurrentRegulation()
    }
  }, [profile])

  const fetchRegulations = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('travel_regulations')
        .select('*')
        .eq('organization_id', profile?.default_organization_id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setRegulations(data || [])
    } catch (err) {
      console.error('Regulations fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch regulations')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentRegulation = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('travel_regulations')
        .select('*')
        .eq('organization_id', profile?.default_organization_id)
        .eq('status', 'active')
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      setCurrentRegulation(data)
    } catch (err) {
      console.error('Current regulation fetch error:', err)
    }
  }

  const createRegulation = async (regulationData: Omit<TravelRegulation, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user || !profile?.default_organization_id) {
        throw new Error('User not authenticated or no organization')
      }

      const { data, error: createError } = await supabase
        .from('travel_regulations')
        .insert({
          organization_id: profile.default_organization_id,
          created_by: user.id,
          ...regulationData
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      await fetchRegulations()
      return { success: true, regulation: data }
    } catch (err) {
      console.error('Regulation creation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create regulation' 
      }
    }
  }

  const updateRegulation = async (id: string, updates: Partial<TravelRegulation>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('travel_regulations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      await fetchRegulations()
      if (currentRegulation?.id === id) {
        setCurrentRegulation(data)
      }
      return { success: true, regulation: data }
    } catch (err) {
      console.error('Regulation update error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update regulation' 
      }
    }
  }

  const activateRegulation = async (id: string) => {
    try {
      // 現在のアクティブな規程を非アクティブにする
      if (currentRegulation) {
        await supabase
          .from('travel_regulations')
          .update({ status: 'archived' })
          .eq('id', currentRegulation.id)
      }

      // 新しい規程をアクティブにする
      const { data, error: activateError } = await supabase
        .from('travel_regulations')
        .update({ status: 'active' })
        .eq('id', id)
        .select()
        .single()

      if (activateError) {
        throw activateError
      }

      await fetchRegulations()
      setCurrentRegulation(data)
      return { success: true, regulation: data }
    } catch (err) {
      console.error('Regulation activation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to activate regulation' 
      }
    }
  }

  return {
    regulations,
    currentRegulation,
    loading,
    error,
    createRegulation,
    updateRegulation,
    activateRegulation,
    refreshRegulations: fetchRegulations
  }
}