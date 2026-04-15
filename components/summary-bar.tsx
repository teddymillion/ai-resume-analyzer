'use client'

import ScoreCard from './score-card'

interface SummaryBarProps {
  overallScore: number
  atsScore: number
  matchScore: number | null
}

export default function SummaryBar({ overallScore, atsScore, matchScore }: SummaryBarProps) {
  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <ScoreCard
        score={overallScore}
        label="Overall Score"
        description="Resume quality and completeness"
      />
      <ScoreCard
        score={atsScore}
        label="ATS Score"
        description="Applicant Tracking System compatibility"
      />
      {matchScore !== null ? (
        <ScoreCard
          score={matchScore}
          label="Job Match Score"
          description="Match with job description"
        />
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <div className="h-20 w-20 rounded-full border-2 border-dashed border-white/20 mb-4 flex items-center justify-center">
            <span className="text-white/30 text-2xl font-bold">—</span>
          </div>
          <p className="text-sm font-semibold text-white mb-1">Job Match Score</p>
          <p className="text-xs text-white/60">Paste a job description to see your match score</p>
        </div>
      )}
    </div>
  )
}
