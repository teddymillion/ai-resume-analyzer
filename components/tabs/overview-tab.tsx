'use client';

import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { AnalysisResult } from '@/lib/analysis-engine';

interface OverviewTabProps {
  analysis: AnalysisResult;
}

export default function OverviewTab({ analysis }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Formatting Quality */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-slate-900" />
          <h3 className="text-lg font-semibold text-slate-900">Resume Quality</h3>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Formatting Quality</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
              analysis.formattingQuality === 'excellent'
                ? 'bg-green-100 text-green-700'
                : analysis.formattingQuality === 'good'
                ? 'bg-blue-100 text-blue-700'
                : analysis.formattingQuality === 'fair'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {analysis.formattingQuality}
            </span>
          </div>
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-slate-900">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, idx) => (
              <li
                key={idx}
                className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-green-900">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {analysis.weaknesses.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((weakness, idx) => (
              <li
                key={idx}
                className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-amber-900">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Keyword Density */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-slate-900" />
          <h3 className="text-lg font-semibold text-slate-900">Keyword Density</h3>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-3xl font-bold text-blue-600">{analysis.keywordDensity}%</p>
              <p className="text-xs text-slate-600 mt-1">Keywords per word count</p>
            </div>
            <p className="text-xs text-slate-600 flex-1">
              {analysis.keywordDensity >= 1 && analysis.keywordDensity <= 4
                ? 'Optimal keyword density for ATS'
                : analysis.keywordDensity > 6
                ? 'High keyword density - avoid over-optimization'
                : 'Low keyword density - add more relevant keywords'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
