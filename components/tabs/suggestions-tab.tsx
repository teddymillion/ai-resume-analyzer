'use client'

import { useState } from 'react'
import { Sparkles, Loader } from 'lucide-react'
import type { ResumeSection } from '@/lib/resume-parser'
import { Button } from '@/components/ui/button'
import RewriteModal from '../rewrite-modal'

interface SuggestionsTabProps {
  resumeSections: ResumeSection[]
}

const WRITING_TIPS = [
  'Start with strong action verbs (Led, Implemented, Optimized, etc.)',
  'Include quantifiable results when possible (%, $, numbers)',
  'Focus on impact and business value, not just tasks',
  'Keep bullets concise but descriptive (1–2 lines)',
]

export default function SuggestionsTab({ resumeSections }: SuggestionsTabProps) {
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null)
  const [selectedBullet, setSelectedBullet] = useState<string | null>(null)
  const [improvedBullet, setImprovedBullet] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const experienceBullets =
    resumeSections.find((s) => s.type === 'experience')?.bullets ?? []

  const handleRewrite = async (bullet: string, idx: number) => {
    setLoadingIdx(idx)
    setError(null)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate rewrite')

      setSelectedBullet(bullet)
      setImprovedBullet(data.rewritten)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoadingIdx(null)
    }
  }

  const handleClose = () => {
    setSelectedBullet(null)
    setImprovedBullet(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4 flex gap-3">
        <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-sm text-cyan-100">
          <p className="font-semibold mb-1">AI-Powered Rewrite Suggestions</p>
          <p>Click "Rewrite" on any bullet point to get an improved version with stronger action verbs and metrics.</p>
        </div>
      </div>

      {/* Bullets */}
      {experienceBullets.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Experience Bullets</h3>
          <div className="space-y-3">
            {experienceBullets.slice(0, 8).map((bullet, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-400/30 hover:bg-white/8 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm text-white/80">{bullet}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRewrite(bullet, idx)}
                  className="shrink-0 whitespace-nowrap border-white/20 bg-white/5 text-white hover:bg-cyan-500/20 hover:border-cyan-400/40"
                  disabled={loadingIdx !== null}
                >
                  {loadingIdx === idx ? (
                    <>
                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                      Rewriting…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Rewrite
                    </>
                  )}
                </Button>
              </div>
            ))}
            {experienceBullets.length > 8 && (
              <p className="text-sm text-white/50 text-center py-2">
                Showing 8 of {experienceBullets.length} bullets
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white/5 border border-white/10 p-6 text-center">
          <p className="text-sm text-white/50">
            No experience bullets found. Add more detail to your experience section to get suggestions.
          </p>
        </div>
      )}

      {/* Tips */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Writing Better Bullets</h3>
        <ul className="space-y-2 text-sm text-white/70">
          {WRITING_TIPS.map((tip, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-cyan-400 font-bold shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-sm text-red-200">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Modal */}
      {selectedBullet && improvedBullet && (
        <RewriteModal
          originalBullet={selectedBullet}
          improvedBullet={improvedBullet}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
