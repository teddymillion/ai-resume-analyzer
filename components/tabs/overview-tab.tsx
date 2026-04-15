'use client'

import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import type { AnalysisResult } from '@/lib/analysis-engine'

const QUALITY_STYLES: Record<AnalysisResult['formattingQuality'], string> = {
  excellent: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  good: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',
  fair: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  poor: 'bg-red-500/15 text-red-300 border border-red-500/20',
}

export default function OverviewTab({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Formatting Quality */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-white/70" />
          <h3 className="text-lg font-semibold text-white">Resume Quality</h3>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">Formatting Quality</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${QUALITY_STYLES[analysis.formattingQuality]}`}>
              {analysis.formattingQuality}
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="flex gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-emerald-100">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {analysis.weaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, idx) => (
              <li key={idx} className="flex gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-sm text-amber-100">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keyword Density */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-white/70" />
          <h3 className="text-lg font-semibold text-white">Keyword Density</h3>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-cyan-400">{analysis.keywordDensity}%</p>
              <p className="text-xs text-white/50 mt-1">Keywords per word count</p>
            </div>
            <p className="text-xs text-white/60 flex-1">
              {analysis.keywordDensity >= 1 && analysis.keywordDensity <= 4
                ? 'Optimal keyword density for ATS'
                : analysis.keywordDensity > 6
                ? 'High density — avoid over-optimization'
                : 'Low density — add more relevant keywords'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
