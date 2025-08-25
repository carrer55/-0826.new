import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Organization {
  id: string
  name: string
  description: string | null
  owner_id: string
  settings: any
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member'
  joined_at: string
  user_profiles?: {
    full_name: string
    email: string
    position: string
    department: string
  }
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user && profile) {
      fetchOrganizations()
      if (profile.default_organization_id) {
        fetchCurrentOrganization(profile.default_organization_id)
        fetchOrganizationMembers(profile.default_organization_id)
      }
    }
  }, [user, profile])

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations(*)
        `)
        .eq('user_id', user?.id)

      if (fetchError) {
        throw fetchError
      }

      const orgs = data?.map(item => item.organizations).filter(Boolean) || []
      setOrganizations(orgs as Organization[])
    } catch (err) {
      console.error('Organizations fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations')
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentOrganization = async (organizationId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      setCurrentOrganization(data)
    } catch (err) {
      console.error('Current organization fetch error:', err)
    }
  }

  const fetchOrganizationMembers = async (organizationId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('organization_members')
        .select(`
          *,
          user_profiles(full_name, email, position, department)
        `)
        .eq('organization_id', organizationId)

      if (fetchError) {
        throw fetchError
      }

      setMembers(data || [])
    } catch (err) {
      console.error('Organization members fetch error:', err)
    }
  }

  const createOrganization = async (name: string, description?: string) => {
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: createError } = await supabase
        .from('organizations')
        .insert({
          name,
          description,
          owner_id: user.id,
          settings: {
            accounting: {
              defaultService: null,
              services: {}
            },
            allowances: {
              domestic: {
                executive: 8000,
                manager: 6000,
                general: 5000
              },
              overseas: {
                executive: 12000,
                manager: 9000,
                general: 7500
              }
            }
          }
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      await fetchOrganizations()
      return { success: true, organization: data }
    } catch (err) {
      console.error('Organization creation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create organization' 
      }
    }
  }

  const updateOrganization = async (id: string, updates: Partial<Organization>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      await fetchOrganizations()
      if (currentOrganization?.id === id) {
        setCurrentOrganization(data)
      }
      return { success: true, organization: data }
    } catch (err) {
      console.error('Organization update error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update organization' 
      }
    }
  }

  const inviteUser = async (email: string, role: 'admin' | 'manager' | 'member') => {
    try {
      if (!currentOrganization) {
        throw new Error('No current organization')
      }

      // 実際の実装では、招待メールを送信するEdge Functionを呼び出し
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-invitation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
          organizationId: currentOrganization.id,
          invitedBy: user?.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitation')
      }

      return { success: true }
    } catch (err) {
      console.error('User invitation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to invite user' 
      }
    }
  }

  return {
    organizations,
    currentOrganization,
    members,
    loading,
    error,
    createOrganization,
    updateOrganization,
    inviteUser,
    refreshOrganizations: fetchOrganizations,
    refreshMembers: () => currentOrganization && fetchOrganizationMembers(currentOrganization.id)
  }
}