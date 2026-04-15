'use client'

import { useEffect, useRef, useState } from 'react'
import { Target } from 'lucide-react'

interface ScoreCardProps {
  score: number
  label: string
  description: string
  delay?: number
}

function grade(s: number) {
  if (s >= 85) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-400/10 ring-emerald-400/20' }
  if (s >= 70) return { label: 'Good', color: 'text-cyan-400', bg: 'bg-cyan-400/10 ring-cyan-400/20' }
  if (s >= 50) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-400/10 ring-amber-400/20' }
  return { label: 'Needs Work', color: 'text-red-400', bg: 'bg-red-400/10 ring-red-400/20' }
}

function strokeColor(s: number) {
  if (s >= 85) return '#34d399'
  if (s >= 70) return '#22d3ee'
  if (s >= 50) return '#fbbf24'
  return '#f87171'
}

function ScoreCard({ score, label, description, delay = 0 }: ScoreCardProps) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    const start = Date.now() + delay
    const duration = 900

    const tick = () => {
      const now = Date.now()
      if (now < start) { raf.current = requestAnimationFrame(tick); return }
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * score))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }

    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [score, delay])

  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (display / 100) * circ
  const g = grade(display)

  return (
    <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05] hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        {/* Ring */}
        <div className="relative h-20 w-20 shrink-0">
          <svg className="-rotate-90 h-full w-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke={strokeColor(display)}
              strokeWidth="7"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold tabular-nums ${g.color}`}>{display}</span>
          </div>
        </div>

        {/* Grade badge */}
        <span className={`mt-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${g.color} ${g.bg}`}>
          {g.label}
        </span>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-0.5 text-xs text-white/50">{description}</p>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${display}%`, background: strokeColor(display) }}
        />
      </div>
    </div>
  )
}

interface SummaryBarProps {
  overallScore: number
  atsScore: number
  matchScore: number | null
}

export default function SummaryBar({ overallScore, atsScore, matchScore }: SummaryBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <ScoreCard score={overallScore} label="Overall Score" description="Resume quality & completeness" delay={0} />
      <ScoreCard score={atsScore} label="ATS Score" description="Applicant Tracking System compatibility" delay={80} />
      {matchScore !== null ? (
        <ScoreCard score={matchScore} label="Job Match" description="Keyword match with job description" delay={160} />
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-center text-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
            <Target className="h-5 w-5 text-white/30" />
          </div>
          <p className="text-sm font-medium text-white/50">Job Match Score</p>
          <p className="text-xs text-white/30">Paste a job description in the Job Match tab</p>
        </div>
      )}
    </div>
  )
}
