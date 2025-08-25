import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface ExpenseCategory {
  id: string
  organization_id: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    if (profile?.default_organization_id) {
      fetchCategories()
    }
  }, [profile])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('organization_id', profile?.default_organization_id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      setCategories(data || [])
    } catch (err) {
      console.error('Categories fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const createCategory = async (name: string, description?: string) => {
    try {
      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      const { data, error: createError } = await supabase
        .from('expense_categories')
        .insert({
          organization_id: profile.default_organization_id,
          name,
          description,
          is_active: true,
          sort_order: categories.length
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      await fetchCategories()
      return { success: true, category: data }
    } catch (err) {
      console.error('Category creation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create category' 
      }
    }
  }

  const updateCategory = async (id: string, updates: Partial<ExpenseCategory>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('expense_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      await fetchCategories()
      return { success: true, category: data }
    } catch (err) {
      console.error('Category update error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update category' 
      }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('expense_categories')
        .update({ is_active: false })
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      await fetchCategories()
      return { success: true }
    } catch (err) {
      console.error('Category deletion error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete category' 
      }
    }
  }

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories
  }
}