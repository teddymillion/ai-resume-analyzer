'use client'

import { useEffect, useState } from 'react'
import { FileText, Brain, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react'

const STEPS = [
  { icon: FileText,    label: 'Reading your resume',         detail: 'Extracting text locally…'              },
  { icon: Brain,       label: 'Running AI analysis',         detail: 'Groq LLM is scoring your content…'     },
  { icon: Sparkles,    label: 'Detecting skill gaps',        detail: 'Comparing against industry standards…'  },
  { icon: ShieldCheck, label: 'Checking ATS compatibility',  detail: 'Scanning for parsing issues…'           },
  { icon: CheckCircle2,label: 'Finalising your report',      detail: 'Almost ready…'                         },
]

// Each step is visible for ~2.5 s; total ≈ 12.5 s which covers the retry window
const STEP_DURATION_MS = 2500

export default function AnalysisLoader() {
  const [stepIdx, setStepIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  // Advance through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev))
    }, STEP_DURATION_MS)
    return () => clearInterval(interval)
  }, [])

  // Smooth progress bar — fills to ~95 % then holds until done
  useEffect(() => {
    const target = stepIdx === STEPS.length - 1 ? 95 : ((stepIdx + 1) / STEPS.length) * 90
    const diff = target - progress
    if (diff <= 0) return
    const step = diff / 30
    let current = progress
    const timer = setInterval(() => {
      current += step
      if (current >= target) { current = target; clearInterval(timer) }
      setProgress(current)
    }, 16)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx])

  const CurrentIcon = STEPS[stepIdx].icon

  return (
    <div className="flex items-center justify-center min-h-[520px] px-4">
      <div className="w-full max-w-md text-center">

        {/* ── Orb stack ─────────────────────────────────────────── */}
        <div className="relative mx-auto mb-10 w-32 h-32">
          {/* Outer glow rings */}
          <span className="absolute inset-0 rounded-full bg-cyan-500/10 animate-ping [animation-duration:2s]" />
          <span className="absolute inset-3 rounded-full bg-cyan-500/10 animate-ping [animation-duration:2.6s] [animation-delay:0.4s]" />

          {/* Main orb */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/30 via-blue-600/20 to-slate-900 border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.25)] flex items-center justify-center">
            {/* Rotating arc */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 animate-spin [animation-duration:2s]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="2" />
              <circle
                cx="50" cy="50" r="46"
                fill="none"
                stroke="rgba(34,211,238,0.7)"
                strokeWidth="2"
                strokeDasharray="72 217"
                strokeLinecap="round"
              />
            </svg>

            {/* Icon */}
            <CurrentIcon className="w-10 h-10 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500" />
          </div>
        </div>

        {/* ── Step label ────────────────────────────────────────── */}
        <div className="mb-1 h-7 overflow-hidden">
          <p
            key={stepIdx}
            className="text-xl font-semibold text-white animate-fade-in"
          >
            {STEPS[stepIdx].label}
          </p>
        </div>
        <div className="mb-8 h-5 overflow-hidden">
          <p
            key={`d-${stepIdx}`}
            className="text-sm text-white/50 animate-fade-in"
          >
            {STEPS[stepIdx].detail}
          </p>
        </div>

        {/* ── Progress bar ──────────────────────────────────────── */}
        <div className="relative h-1.5 w-full rounded-full bg-white/10 overflow-hidden mb-6">
          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.8s_linear_infinite] translate-x-[-100%]" />
          {/* Fill */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* ── Step dots ─────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-500 ${
                i < stepIdx
                  ? 'w-2 h-2 bg-cyan-400'
                  : i === stepIdx
                  ? 'w-3 h-3 bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                  : 'w-2 h-2 bg-white/15'
              }`}
            />
          ))}
        </div>

        {/* ── Retry notice ──────────────────────────────────────── */}
        <p className="mt-8 text-xs text-white/30">
          Powered by Groq · text extracted locally · no file upload to AI
        </p>
      </div>
    </div>
  )
}
