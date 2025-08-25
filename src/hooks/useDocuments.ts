import { useState, useEffect } from 'react'
import { supabase, generateDocument } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface Document {
  id: string
  user_id: string
  organization_id: string | null
  application_id: string | null
  type: 'business_report' | 'allowance_detail' | 'expense_settlement' | 'travel_detail' | 'gps_log' | 'monthly_report' | 'annual_report'
  title: string
  content: any
  file_url: string | null
  file_size: number | null
  mime_type: string | null
  status: 'draft' | 'submitted' | 'approved' | 'completed'
  created_at: string
  updated_at: string
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setDocuments(data || [])
    } catch (err) {
      console.error('Documents fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async (
    type: Document['type'],
    title: string,
    content: any,
    applicationId?: string
  ) => {
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: createError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          organization_id: profile?.default_organization_id,
          application_id: applicationId || null,
          type,
          title,
          content,
          status: 'draft'
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      await fetchDocuments()
      return { success: true, document: data }
    } catch (err) {
      console.error('Document creation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create document' 
      }
    }
  }

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      await fetchDocuments()
      return { success: true, document: data }
    } catch (err) {
      console.error('Document update error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update document' 
      }
    }
  }

  const generateDocumentFile = async (
    type: Document['type'],
    format: 'pdf' | 'word' | 'html' = 'pdf',
    applicationId?: string,
    templateData?: any
  ) => {
    try {
      if (!profile?.default_organization_id) {
        throw new Error('No organization ID available')
      }

      const result = await generateDocument(
        type,
        profile.default_organization_id,
        format,
        applicationId,
        templateData
      )

      return { success: true, result }
    } catch (err) {
      console.error('Document generation error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to generate document' 
      }
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      await fetchDocuments()
      return { success: true }
    } catch (err) {
      console.error('Document deletion error:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete document' 
      }
    }
  }

  return {
    documents,
    loading,
    error,
    createDocument,
    updateDocument,
    generateDocumentFile,
    deleteDocument,
    refreshDocuments: fetchDocuments
  }
}