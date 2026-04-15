'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResumeUploadProps {
  onFileSelect: (file: File) => void
  loading?: boolean
}

export default function ResumeUpload({ onFileSelect, loading = false }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setSelectedFile(file)
    onFileSelect(file)
  }

  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-white/20 bg-white/5 hover:border-cyan-400/60 hover:bg-white/8'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          id="resume-input"
          accept=".pdf,.docx"
          onChange={handleInputChange}
          className="hidden"
          disabled={loading}
        />

        <label htmlFor="resume-input" className="flex flex-col items-center gap-4 cursor-pointer">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/15 rounded-full">
            <Upload className="w-8 h-8 text-cyan-400" />
          </div>

          <div>
            <p className="text-lg font-semibold text-white mb-1">
              {selectedFile ? selectedFile.name : 'Drop your resume here'}
            </p>
            <p className="text-sm text-white/60">or click to browse from your computer</p>
          </div>

          <p className="text-xs text-white/40 mt-2">PDF or DOCX · Max 10 MB</p>
        </label>

        {selectedFile && !loading && (
          <Button
            onClick={() => inputRef.current?.click()}
            variant="outline"
            className="mt-6 border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            Choose Different File
          </Button>
        )}
      </div>
    </div>
  )
}
