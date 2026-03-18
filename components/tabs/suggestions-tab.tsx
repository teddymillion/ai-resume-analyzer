'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Loader } from 'lucide-react';
import { ResumeSection } from '@/lib/resume-parser';
import { Button } from '@/components/ui/button';
import RewriteModal from '../rewrite-modal';

interface SuggestionsTabProps {
  resumeSections: ResumeSection[];
}

export default function SuggestionsTab({ resumeSections }: SuggestionsTabProps) {
  const [selectedBullet, setSelectedBullet] = useState<string | null>(null);
  const [improvedBullet, setImprovedBullet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get experience bullets
  const experienceSection = resumeSections.find((s) => s.type === 'experience');
  const experienceBullets = experienceSection?.bullets || [];

  const generateRewrite = async (bullet: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bullet }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate rewrite');
      }

      const data = await response.json();
      setImprovedBullet(data.rewritten);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Rewrite error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-2">
          <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">AI-Powered Rewrite Suggestions</p>
            <p>Click "Rewrite" on any bullet point to get an improved version with stronger action verbs and metrics.</p>
          </div>
        </div>
      </div>

      {/* Experience Bullets */}
      {experienceBullets.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Experience Bullets</h3>
          <div className="space-y-3">
            {experienceBullets.slice(0, 8).map((bullet, idx) => (
              <div
                key={idx}
                className="flex gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{bullet}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    setSelectedBullet(bullet);
                    await generateRewrite(bullet);
                  }}
                  className="flex-shrink-0 whitespace-nowrap"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-1 animate-spin" />
                      Rewriting...
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
              <p className="text-sm text-slate-600 text-center py-4">
                Showing 8 of {experienceBullets.length} bullets
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-lg p-6 text-center">
          <p className="text-sm text-slate-600">
            No experience bullets found. Add more detail to your experience section to get suggestions.
          </p>
        </div>
      )}

      {/* Tips */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Writing Better Bullets</h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Start with strong action verbs (Led, Implemented, Optimized, etc.)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Include quantifiable results when possible (%, $, numbers)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Focus on impact and business value, not just tasks</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Keep bullets concise but descriptive (1-2 lines)</span>
          </li>
        </ul>
      </div>

      {/* Rewrite Modal */}
      {selectedBullet && improvedBullet && (
        <RewriteModal
          originalBullet={selectedBullet}
          improvedBullet={improvedBullet}
          onClose={() => {
            setSelectedBullet(null);
            setImprovedBullet(null);
            setError(null);
          }}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-900">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}
    </div>
  );
}
