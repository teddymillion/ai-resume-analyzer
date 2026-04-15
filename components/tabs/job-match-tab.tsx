'use client'

import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import type { KeywordMatchResult } from '@/lib/analysis-engine'
import { Textarea } from '@/components/ui/textarea'

interface JobMatchTabProps {
  jobMatchResult: KeywordMatchResult | null
  jobDescription: string
  onJobDescriptionChange: (value: string) => void
}

function MatchMeter({ score }: { score: number }) {
  const color = score >= 70 ? '#34d399' : score >= 45 ? '#22d3ee' : score >= 25 ? '#fbbf24' : '#f87171'
  const label = score >= 70 ? 'Strong Match' : score >= 45 ? 'Moderate Match' : score >= 25 ? 'Weak Match' : 'Low Match'

  // Arc: semicircle from 180° to 0°
  const r = 52
  const circ = Math.PI * r // half circumference
  const offset = circ - (score / 100) * circ

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative h-28 w-56 overflow-hidden">
        <svg viewBox="0 0 120 64" className="h-full w-full">
          {/* Track */}
          <path
            d="M 8 60 A 52 52 0 0 1 112 60"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d="M 8 60 A 52 52 0 0 1 112 60"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="text-4xl font-bold tabular-nums" style={{ color }}>{score}%</span>
          <span className="text-xs font-medium" style={{ color }}>{label}</span>
        </div>
      </div>
    </div>
  )
}

export default function JobMatchTab({ jobMatchResult, jobDescription, onJobDescriptionChange }: JobMatchTabProps) {
  return (
    <div className="space-y-5">
      {/* Input */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/40">
          Paste Job Description
        </label>
        <Textarea
          placeholder="Paste the full job description here…"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          className="min-h-[140px] resize-none border-white/[0.08] bg-white/[0.03] text-sm text-white placeholder:text-white/25 focus-visible:border-cyan-500/50 focus-visible:ring-0"
        />
        <p className="mt-1.5 text-xs text-white/35">
          We extract tech keywords and compare them against your resume.
        </p>
      </div>

      {/* Results */}
      {jobMatchResult && (
        <>
          <MatchMeter score={jobMatchResult.matchScore} />

          <p className="text-center text-xs text-white/40">
            {jobMatchResult.matchedCount} of {jobMatchResult.totalJobKeywords} keywords matched
          </p>

          {jobMatchResult.matchedKeywords.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-semibold text-white">Matched</h4>
                <span className="ml-auto text-xs text-white/40">{jobMatchResult.matchedKeywords.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {jobMatchResult.matchedKeywords.map((kw, i) => (
                  <span key={i} className="rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-xs text-emerald-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {jobMatchResult.missingKeywords.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">Missing</h4>
                <span className="ml-auto text-xs text-white/40">{jobMatchResult.missingKeywords.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {jobMatchResult.missingKeywords.map((kw, i) => (
                  <span key={i} className="rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-2.5 py-1 text-xs text-amber-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.06] p-3.5 flex gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
            <p className="text-xs text-cyan-200/80">
              Add missing keywords naturally in your experience descriptions and skills section to improve your match score.
            </p>
          </div>
        </>
      )}

      {!jobDescription && (
        <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
          <p className="text-sm text-white/35">Paste a job description above to see your match score</p>
        </div>
      )}
    </div>
  )
}
