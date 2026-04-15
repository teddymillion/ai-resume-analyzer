'use client'

import { useRef, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'

interface ResumeUploadProps {
  onFileSelect: (file: File) => void
  loading?: boolean
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ResumeUpload({ onFileSelect, loading = false }: ResumeUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    onFileSelect(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); if (!loading) setDragging(true) }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false) }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={loading ? undefined : handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      className={[
        'relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 select-none',
        loading
          ? 'cursor-not-allowed border-white/10 bg-white/[0.02] opacity-60'
          : dragging
          ? 'border-cyan-400/60 bg-cyan-400/[0.06] scale-[1.01]'
          : file
          ? 'border-emerald-500/40 bg-emerald-500/[0.04] hover:border-emerald-500/60'
          : 'border-white/[0.12] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        disabled={loading}
        onChange={(e) => { const f = e.currentTarget.files?.[0]; if (f) handleFile(f) }}
      />

      {file ? (
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <FileText className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-white/40">{formatBytes(file.size)}</p>
          </div>
          {!loading && (
            <button
              onClick={clear}
              className="ml-2 rounded-full p-1 text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className={[
            'flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-all duration-200',
            dragging
              ? 'bg-cyan-500/20 ring-cyan-500/40 scale-110'
              : 'bg-white/5 ring-white/10',
          ].join(' ')}>
            <Upload className={`h-6 w-6 transition-colors ${dragging ? 'text-cyan-400' : 'text-white/40'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {dragging ? 'Drop to analyze' : 'Drop your resume here'}
            </p>
            <p className="mt-1 text-xs text-white/40">or click to browse · PDF or DOCX · max 10 MB</p>
          </div>
        </div>
      )}
    </div>
  )
}
