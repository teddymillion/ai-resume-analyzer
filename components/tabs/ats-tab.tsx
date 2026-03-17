'use client';

import { AlertCircle, CheckCircle2, Lightbulb } from 'lucide-react';
import { AnalysisResult } from '@/lib/analysis-engine';

interface ATSTabProps {
  analysis: AnalysisResult;
}

export default function ATSTab({ analysis }: ATSTabProps) {
  return (
    <div className="space-y-6">
      {/* ATS Issues */}
      {analysis.atsIssues.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-slate-900">Issues Found</h3>
          </div>
          <ul className="space-y-2">
            {analysis.atsIssues.map((issue, idx) => (
              <li
                key={idx}
                className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-900">{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ATS Suggestions */}
      {analysis.atsSuggestions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {analysis.atsSuggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-blue-900">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ATS Compatibility Info */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3">What is ATS?</h3>
        <p className="text-sm text-slate-700 mb-4">
          Applicant Tracking Systems (ATS) are used by most companies to parse and rank resumes. Optimizing your resume for ATS ensures recruiters can find and review your application.
        </p>
        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
          <div className="flex gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-slate-700">Use standard fonts and formatting</span>
          </div>
          <div className="flex gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-slate-700">Include clear section headers</span>
          </div>
          <div className="flex gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-slate-700">Use bullet points for content</span>
          </div>
          <div className="flex gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-slate-700">Include relevant keywords naturally</span>
          </div>
          <div className="flex gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-slate-700">Avoid images and complex formatting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
