'use client'

import { AlertCircle, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react'
import type { AnalysisResult } from '@/lib/analysis-engine'

const ATS_BEST_PRACTICES = [
  'Standard section headers (Experience, Education, Skills)',
  'Bullet points for achievements and responsibilities',
  'No tables, columns, or text boxes',
  'No images, graphics, or icons',
  'Dates in consistent format (MM/YYYY or YYYY)',
  'Contact info in plain text at the top',
]

export default function ATSTab({ analysis }: { analysis: AnalysisResult }) {
  const hasIssues = analysis.atsIssues.length > 0
  const atsGrade = analysis.atsScore >= 80 ? 'pass' : analysis.atsScore >= 55 ? 'warn' : 'fail'

  return (
    <div className="space-y-6">
      {/* ATS grade banner */}
      <div className={[
        'flex items-center gap-3 rounded-xl border p-4',
        atsGrade === 'pass' ? 'border-emerald-500/20 bg-emerald-500/[0.07]' :
        atsGrade === 'warn' ? 'border-amber-500/20 bg-amber-500/[0.07]' :
                              'border-red-500/20 bg-red-500/[0.07]',
      ].join(' ')}>
        {atsGrade === 'pass'
          ? <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
          : <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />}
        <div>
          <p className={`text-sm font-semibold ${atsGrade === 'pass' ? 'text-emerald-300' : atsGrade === 'warn' ? 'text-amber-300' : 'text-red-300'}`}>
            {atsGrade === 'pass' ? 'ATS Friendly' : atsGrade === 'warn' ? 'Needs Improvement' : 'ATS Issues Detected'}
          </p>
          <p className="text-xs text-white/50 mt-0.5">
            Score: {analysis.atsScore}/100 · {hasIssues ? `${analysis.atsIssues.length} issue${analysis.atsIssues.length > 1 ? 's' : ''} found` : 'No critical issues'}
          </p>
        </div>
      </div>

      {/* Issues */}
      {analysis.atsIssues.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-white">Issues Found</h3>
          </div>
          <ul className="space-y-2">
            {analysis.atsIssues.map((issue, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-red-500/15 bg-red-500/[0.07] p-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                <span className="text-sm text-red-200/90">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.atsSuggestions.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {analysis.atsSuggestions.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-cyan-500/15 bg-cyan-500/[0.06] p-3">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span className="text-sm text-cyan-100/90">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Best practices checklist */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">ATS Best Practices</h3>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.05]">
          {ATS_BEST_PRACTICES.map((tip, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
              <span className="text-xs text-white/60">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
