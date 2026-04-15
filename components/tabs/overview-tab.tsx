'use client'

import { AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import type { AnalysisResult } from '@/lib/analysis-engine'

const QUALITY_CONFIG = {
  excellent: { label: 'Excellent', cls: 'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20' },
  good:      { label: 'Good',      cls: 'text-cyan-400 bg-cyan-400/10 ring-cyan-400/20' },
  fair:      { label: 'Fair',      cls: 'text-amber-400 bg-amber-400/10 ring-amber-400/20' },
  poor:      { label: 'Needs Work',cls: 'text-red-400 bg-red-400/10 ring-red-400/20' },
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="font-semibold text-white">{value}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  )
}

export default function OverviewTab({ analysis }: { analysis: AnalysisResult }) {
  const qc = QUALITY_CONFIG[analysis.formattingQuality]

  const densityColor =
    analysis.keywordDensity >= 1 && analysis.keywordDensity <= 4
      ? '#34d399'
      : analysis.keywordDensity > 6
      ? '#f87171'
      : '#fbbf24'

  const densityLabel =
    analysis.keywordDensity >= 1 && analysis.keywordDensity <= 4
      ? 'Optimal for ATS'
      : analysis.keywordDensity > 6
      ? 'Over-optimized'
      : 'Too low — add keywords'

  return (
    <div className="space-y-6">
      {/* Score bars */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Score Breakdown</p>
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${qc.cls}`}>
            {qc.label}
          </span>
        </div>
        <ScoreBar label="Overall Score" value={analysis.overallScore} color="#22d3ee" />
        <ScoreBar label="ATS Score" value={analysis.atsScore} color="#34d399" />
      </div>

      {/* Keyword density */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-white/40" />
          <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Keyword Density</p>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-3xl font-bold tabular-nums" style={{ color: densityColor }}>
            {analysis.keywordDensity}%
          </span>
          <span className="mb-1 text-xs text-white/50">{densityLabel}</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(analysis.keywordDensity * 12, 100)}%`, background: densityColor }}
          />
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.07] p-3">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="text-sm text-emerald-100/90">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {analysis.weaknesses.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Areas to Improve</h3>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.07] p-3">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                <span className="text-sm text-amber-100/90">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
