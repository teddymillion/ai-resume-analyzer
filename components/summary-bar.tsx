'use client';

import { CheckCircle2 } from 'lucide-react';
import ScoreCard from './score-card';

interface SummaryBarProps {
  overallScore: number;
  atsScore: number;
  matchScore: number | null;
}

export default function SummaryBar({ overallScore, atsScore, matchScore }: SummaryBarProps) {
  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <ScoreCard
        score={overallScore}
        label="Overall Score"
        description="Resume quality and completeness"
        icon={CheckCircle2}
      />
      <ScoreCard
        score={atsScore}
        label="ATS Score"
        description="Applicant Tracking System compatibility"
        icon={CheckCircle2}
      />
      {matchScore !== null ? (
        <ScoreCard
          score={matchScore}
          label="Job Match Score"
          description="Match with job description"
          icon={CheckCircle2}
        />
      ) : (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-100 mb-4"></div>
          <p className="text-sm font-medium text-slate-600 mb-1">Job Match Score</p>
          <p className="text-xs text-slate-500">Paste a job description below to see your match score</p>
        </div>
      )}
    </div>
  );
}
