'use client'

import { AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react'
import type { AnalysisResult } from '@/lib/analysis-engine'

const ATS_TIPS = [
  'Use standard fonts and formatting',
  'Include clear section headers',
  'Use bullet points for content',
  'Include relevant keywords naturally',
  'Avoid images and complex formatting',
]

export default function ATSTab({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Issues */}
      {analysis.atsIssues.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Issues Found</h3>
          </div>
          <ul className="space-y-2">
            {analysis.atsIssues.map((issue, idx) => (
              <li key={idx} className="flex gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-200">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {analysis.atsSuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {analysis.atsSuggestions.map((suggestion, idx) => (
              <li key={idx} className="flex gap-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-sm text-cyan-100">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ATS Info */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">What is ATS?</h3>
        <p className="text-sm text-white/60 mb-4">
          Applicant Tracking Systems (ATS) are used by most companies to parse and rank resumes. Optimizing for ATS ensures recruiters can find and review your application.
        </p>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4 space-y-3">
          {ATS_TIPS.map((tip, idx) => (
            <div key={idx} className="flex gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-white/70">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
