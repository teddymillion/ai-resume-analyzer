'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '@/lib/analysis-engine';

interface SkillsTabProps {
  analysis: AnalysisResult;
}

export default function SkillsTab({ analysis }: SkillsTabProps) {
  return (
    <div className="space-y-6">
      {/* Missing Skills */}
      {analysis.missingSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-900">Skills to Add</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Consider adding these commonly valued skills to your resume:
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.slice(0, 8).map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Add 2-3 relevant skills from the list above that match the job descriptions you're targeting.
        </p>
      </div>

      {/* Skills Overview */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Your Skills Profile
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Your resume mentions {analysis.missingSkills.length === 0 ? 'many relevant' : 'some'} professional skills. A strong skills section helps recruiters quickly understand your capabilities.
        </p>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-600 mb-2">Skills Sections:</p>
          <p className="text-2xl font-bold text-slate-900">
            {analysis.missingSkills.length === 0 ? '15+' : '8-12'} skills recommended
          </p>
        </div>
      </div>
    </div>
  );
}
