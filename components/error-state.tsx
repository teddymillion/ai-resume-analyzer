'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  error: string
  onRetry: () => void
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center py-10">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/15 rounded-full mb-6">
        <AlertCircle className="w-10 h-10 text-red-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>

      <p className="text-white/60 mb-4 max-w-md text-sm">{error}</p>

      <p className="text-xs text-white/40 mb-8">
        Please check the file format and try again. Supported formats: PDF, DOCX
      </p>

      <Button
        onClick={onRetry}
        className="gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  )
}
