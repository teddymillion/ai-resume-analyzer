'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const RESUME_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET ?? 'resumes'

interface UseDeleteResumeOptions {
  onSuccess?: (resumeId: string) => void
}

export function useDeleteResume({ onSuccess }: UseDeleteResumeOptions = {}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  /** Call this to show the confirmation prompt */
  const requestDelete = (resumeId: string) => setPendingDeleteId(resumeId)

  /** Call this to cancel the pending delete */
  const cancelDelete = () => setPendingDeleteId(null)

  /** Call this to confirm and execute the delete */
  const confirmDelete = async (): Promise<boolean> => {
    if (!pendingDeleteId) return false
    const resumeId = pendingDeleteId
    setPendingDeleteId(null)
    return executeDelete(resumeId)
  }

  /** Direct delete — use when you already have your own confirm UI */
  const deleteResume = async (resumeId: string): Promise<boolean> => {
    return executeDelete(resumeId)
  }

  const executeDelete = async (resumeId: string): Promise<boolean> => {
    setDeletingId(resumeId)
    setError(null)

    try {
      const { data: resume, error: fetchError } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', resumeId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(fetchError.message)
      }

      if (resume?.file_path) {
        const { error: storageError } = await supabase.storage
          .from(RESUME_BUCKET)
          .remove([resume.file_path])
        if (storageError) {
          console.warn('Failed to delete storage file:', storageError.message)
        }
      }

      const { error: analysisError } = await supabase
        .from('analysis_results')
        .delete()
        .eq('resume_id', resumeId)
      if (analysisError) throw new Error(analysisError.message)

      const { error: resumeError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
      if (resumeError) throw new Error(resumeError.message)

      onSuccess?.(resumeId)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume.')
      return false
    } finally {
      setDeletingId(null)
    }
  }

  return {
    deleteResume,
    requestDelete,
    confirmDelete,
    cancelDelete,
    pendingDeleteId,
    deletingId,
    error,
    clearError: () => setError(null),
  }
}
