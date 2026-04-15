'use client'

import { useEffect, useRef, useState } from 'react'

interface ScoreCardProps {
  score: number
  label: string
  description: string
}

function getScoreColor(s: number): string {
  if (s >= 80) return 'text-emerald-400'
  if (s >= 60) return 'text-cyan-400'
  if (s >= 40) return 'text-amber-400'
  return 'text-red-400'
}

function getStrokeColor(s: number): string {
  if (s >= 80) return '#34d399' // emerald-400
  if (s >= 60) return '#22d3ee' // cyan-400
  if (s >= 40) return '#fbbf24' // amber-400
  return '#f87171' // red-400
}

export default function ScoreCard({ score, label, description }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      setDisplayScore(Math.round(progress * score))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [score])

  const circumference = 2 * Math.PI * 45 // r=45 → 282.74
  const dashOffset = circumference - (displayScore / 100) * circumference

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Circular progress */}
      <div className="relative w-20 h-20 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={getStrokeColor(displayScore)}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-100"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreColor(displayScore)}`}>
            {displayScore}
          </span>
        </div>
      </div>

      <p className="text-sm font-semibold text-white mb-1">{label}</p>
      <p className="text-xs text-white/60">{description}</p>
    </div>
  )
}
