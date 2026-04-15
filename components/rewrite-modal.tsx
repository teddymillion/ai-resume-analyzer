'use client'

import { useState } from 'react'
import { Copy, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface RewriteModalProps {
  originalBullet: string
  improvedBullet: string
  onClose: () => void
}

export default function RewriteModal({ originalBullet, improvedBullet, onClose }: RewriteModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(improvedBullet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Improved Bullet Point
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Original */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Original</p>
            <div className="rounded-lg bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white/80">{originalBullet}</p>
            </div>
          </div>

          <div className="flex justify-center text-white/30 text-lg">↓</div>

          {/* Improved */}
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">Improved Version</p>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
              <p className="text-sm text-emerald-100 font-medium">{improvedBullet}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
          >
            Keep Original
          </Button>
          <Button
            onClick={handleCopy}
            className="flex-1 gap-2 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          >
            {copied ? (
              <><Check className="w-4 h-4" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy to Clipboard</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
