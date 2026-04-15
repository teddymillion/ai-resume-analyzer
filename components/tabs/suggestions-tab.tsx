'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { ResumeSection } from '@/lib/resume-parser'
import { Button } from '@/components/ui/button'

interface SuggestionsTabProps {
  resumeSections: ResumeSection[]
}

const TIPS = [
  'Start with a strong past-tense action verb (Led, Built, Reduced…)',
  'Quantify impact wherever possible (%, $, time saved)',
  'Focus on outcomes, not just tasks',
  'Keep each bullet to 1–2 lines maximum',
]

interface BulletRowProps {
  bullet: string
  sectionTitle: string
}

function BulletRow({ bullet, sectionTitle }: BulletRowProps) {
  const [loading, setLoading] = useState(false)
  const [rewritten, setRewritten] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleRewrite = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate rewrite')
      setRewritten(data.rewritten)
      setExpanded(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!rewritten) return
    await navigator.clipboard.writeText(rewritten)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-1">{sectionTitle}</p>
          <p className="text-sm text-white/80 leading-relaxed">{bullet}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRewrite}
          disabled={loading}
          className="shrink-0 gap-1.5 text-xs text-white/50 hover:text-cyan-300 hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/30"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? 'Rewriting…' : 'Rewrite'}
        </Button>
      </div>

      {error && (
        <div className="border-t border-red-500/15 bg-red-500/[0.07] px-4 py-2.5">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {rewritten && (
        <div className="border-t border-white/[0.06]">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-emerald-400 hover:bg-white/[0.02]"
          >
            <span className="font-semibold">AI Rewrite ready</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {expanded && (
            <div className="border-t border-emerald-500/10 bg-emerald-500/[0.05] px-4 py-3">
              <p className="text-sm text-emerald-100/90 leading-relaxed">{rewritten}</p>
              <button
                onClick={handleCopy}
                className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400/70 hover:text-emerald-300 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy to clipboard'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function SuggestionsTab({ resumeSections }: SuggestionsTabProps) {
  // Collect bullets from all sections, not just experience
  const allBullets = resumeSections.flatMap((s) =>
    s.bullets.map((b) => ({ bullet: b, sectionTitle: s.title })),
  ).slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="flex gap-3 rounded-xl border border-cyan-500/15 bg-cyan-500/[0.06] p-4">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
        <div>
          <p className="text-sm font-semibold text-cyan-300">AI Bullet Rewrites</p>
          <p className="mt-0.5 text-xs text-cyan-200/70">
            Click Rewrite on any bullet to get a stronger, ATS-optimized version with better action verbs and metrics.
          </p>
        </div>
      </div>

      {/* Bullets */}
      {allBullets.length > 0 ? (
        <div className="space-y-3">
          {allBullets.map((item, i) => (
            <BulletRow key={i} bullet={item.bullet} sectionTitle={item.sectionTitle} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
          <p className="text-sm text-white/40">
            No bullet points detected. Make sure your resume uses bullet points (- or •) in experience sections.
          </p>
        </div>
      )}

      {/* Writing tips */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-white">Writing Better Bullets</h3>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] divide-y divide-white/[0.05]">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5 text-cyan-400 text-xs font-bold shrink-0">{i + 1}.</span>
              <span className="text-xs text-white/60">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
