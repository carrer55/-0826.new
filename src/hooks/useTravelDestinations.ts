import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface TravelDestination {
  id: string
  organization_id: string
  name: string
  address: string | null
  country: string
  is_domestic: boolean
  distance_from_office: number | null
  standard_transportation_cost: number
  standard_accommodation_cost: number
  notes: string | null
  created_at: string
  updated_at: string
}

export function useTravelDestinations() {
  const [destinations, setDestinations] = useState<TravelDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.default_organization_id) {
      fetchDestinations()
    }
  }, [profile])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('travel_destinations')
        .select('*')
        .eq('organization_id', profile?.default_organization_id)
        .order('name', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setDestinations(data || [])
    } catch (err) {
      console.error('Destinations fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch destinations')
    } finally {
      setLoading(false)
    }
  }

  const createDestination = async (destinationData: Omit<TravelDestination, 'id' | 'organization_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      const { data, error: createError } = await supabase
        .from('travel_destinations')
        .insert({
          organization_id: profile.default_organization_id,
          ...destinationData
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      await fetchDestinations()
      return { success: true, destination: data }
    } catch (err) {
      console.error('Destination creation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create destination' 
      }
    }
  }

  const updateDestination = async (id: string, updates: Partial<TravelDestination>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('travel_destinations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      await fetchDestinations()
      return { success: true, destination: data }
    } catch (err) {
      console.error('Destination update error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update destination' 
      }
    }
  }

  const deleteDestination = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('travel_destinations')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      await fetchDestinations()
      return { success: true }
    } catch (err) {
      console.error('Destination deletion error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete destination' 
      }
    }
  }

  return {
    destinations,
    loading,
    error,
    createDestination,
    updateDestination,
    deleteDestination,
    refreshDestinations: fetchDestinations
  }
}