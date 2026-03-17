'use client';

import { useState } from 'react';
import { X, Copy, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RewriteModalProps {
  originalBullet: string;
  improvedBullet: string;
  onClose: () => void;
}

export default function RewriteModal({
  originalBullet,
  improvedBullet,
  onClose,
}: RewriteModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(improvedBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Improved Bullet Point</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Original
            </label>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-slate-900">{originalBullet}</p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-slate-400">↓</div>
          </div>

          {/* Improved */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Improved Version
            </label>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-slate-900 font-medium">{improvedBullet}</p>
            </div>
          </div>

          {/* What Changed */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">What Improved:</p>
            <ul className="text-sm text-blue-900 space-y-1 list-disc list-inside">
              <li>Stronger action verb</li>
              <li>More specific and measurable</li>
              <li>Emphasizes impact and results</li>
              <li>Better for ATS and recruiters</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Keep Original
          </Button>
          <Button
            onClick={handleCopy}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
