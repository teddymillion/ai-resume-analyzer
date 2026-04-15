'use client'

import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import type { KeywordMatchResult } from '@/lib/analysis-engine'
import { Textarea } from '@/components/ui/textarea'

interface JobMatchTabProps {
  jobMatchResult: KeywordMatchResult | null
  jobDescription: string
  onJobDescriptionChange: (value: string) => void
}

export default function JobMatchTab({
  jobMatchResult,
  jobDescription,
  onJobDescriptionChange,
}: JobMatchTabProps) {
  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Paste Job Description
        </label>
        <Textarea
          placeholder="Paste the job description here to analyze how well your resume matches..."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          className="min-h-[180px] resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/20"
        />
        <p className="text-xs text-white/50 mt-2">
          The analyzer shows which keywords from the job posting appear in your resume.
        </p>
      </div>

      {/* Match Results */}
      {jobMatchResult && (
        <>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Match Analysis</h3>
            <div className="rounded-lg bg-white/5 border border-white/10 p-6 text-center mb-6">
              <div className="text-4xl font-bold text-cyan-400 mb-2">
                {jobMatchResult.matchScore}%
              </div>
              <p className="text-sm text-white/60">
                Job Description Match ({jobMatchResult.matchedCount} of {jobMatchResult.totalJobKeywords} keywords)
              </p>
            </div>
          </div>

          {jobMatchResult.matchedKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">Matched Keywords</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobMatchResult.matchedKeywords.slice(0, 12).map((kw, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {jobMatchResult.missingKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold text-white">Missing Keywords</h4>
              </div>
              <p className="text-sm text-white/60 mb-3">
                Add these keywords naturally to improve your match:
              </p>
              <div className="flex flex-wrap gap-2">
                {jobMatchResult.missingKeywords.slice(0, 12).map((kw, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-4 flex gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-sm text-cyan-100">
              <p className="font-semibold mb-1">How to improve your match:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-cyan-200/80">
                <li>Add matched keywords naturally throughout your resume</li>
                <li>Focus on role-specific terms in your experience descriptions</li>
                <li>Ensure your skills section includes relevant keywords</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {!jobDescription && (
        <div className="rounded-lg bg-white/5 border border-white/10 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-white/50">
            Paste a job description above to see keyword matching
          </p>
        </div>
      )}
    </div>
  )
}
