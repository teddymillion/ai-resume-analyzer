'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UseDeleteResumeOptions {
  onSuccess?: (resumeId: string) => void
}

export function useDeleteResume({ onSuccess }: UseDeleteResumeOptions = {}) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteResume = async (resumeId: string): Promise<boolean> => {
    if (!confirm('Delete this resume and its analysis? This cannot be undone.')) return false

    setDeletingId(resumeId)
    setError(null)

    try {
      // Delete analysis first (no FK cascade assumed)
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

  return { deleteResume, deletingId, error, clearError: () => setError(null) }
}
