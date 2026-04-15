'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { AnalysisResult } from '@/lib/analysis-engine'

interface SkillsTabProps {
  analysis: AnalysisResult
  detectedSkills?: string[]
}

export default function SkillsTab({ analysis, detectedSkills = [] }: SkillsTabProps) {
  return (
    <div className="space-y-6">
      {/* Detected */}
      {detectedSkills.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Detected Skills</h3>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
              {detectedSkills.length} found
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 text-xs font-medium text-emerald-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing */}
      {analysis.missingSkills.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Skills to Add</h3>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 ring-1 ring-amber-500/20">
              {analysis.missingSkills.length} missing
            </span>
          </div>
          <p className="mb-3 text-xs text-white/50">
            These are commonly expected but not found in your resume:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-3 py-1 text-xs font-medium text-amber-300"
              >
                + {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {detectedSkills.length === 0 && analysis.missingSkills.length === 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
          <p className="text-sm text-white/40">No skill data available for this resume.</p>
        </div>
      )}

      <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.06] p-4 text-xs text-cyan-200/80">
        <strong className="text-cyan-300">Tip:</strong> Add 2–3 missing skills that genuinely match the roles you&apos;re targeting — don&apos;t keyword-stuff.
      </div>
    </div>
  )
}
