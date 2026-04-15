'use client'

import { FileText } from 'lucide-react'

const FEATURES = [
  'Get your overall resume score',
  'Check ATS compatibility',
  'Match your resume to job descriptions',
  'Get AI-powered bullet rewrites',
]

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center py-10">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-500/15 rounded-full mb-6">
        <FileText className="w-10 h-10 text-cyan-400" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-3">Ready to optimize your resume?</h2>

      <p className="text-white/60 mb-8 max-w-md text-sm">
        Upload your resume to get intelligent feedback on formatting, ATS compatibility, and smart suggestions.
      </p>

      <ul className="space-y-2 text-left max-w-xs mb-6">
        {FEATURES.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-3 text-sm text-white/70">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs shrink-0">
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <p className="text-xs text-white/40">Supported formats: PDF, DOCX</p>
    </div>
  )
}
