'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { AnalysisResult } from '@/lib/analysis-engine'

export default function SkillsTab({ analysis }: { analysis: AnalysisResult }) {
  return (
    <div className="space-y-6">
      {/* Missing Skills */}
      {analysis.missingSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Skills to Add</h3>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Consider adding these commonly valued skills to your resume:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.slice(0, 8).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4">
        <p className="text-sm text-cyan-100">
          <strong>Tip:</strong> Add 2–3 relevant skills from the list above that match the job descriptions you're targeting.
        </p>
      </div>

      {/* Skills Overview */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Your Skills Profile
        </h3>
        <p className="text-sm text-white/60 mb-4">
          A strong skills section helps recruiters quickly understand your capabilities.
        </p>
        <div className="rounded-lg bg-white/5 border border-white/10 p-4">
          <p className="text-xs text-white/50 mb-2">Recommended skills count:</p>
          <p className="text-2xl font-bold text-white">
            {analysis.missingSkills.length === 0 ? '15+' : '8–12'} skills
          </p>
        </div>
      </div>
    </div>
  )
}
