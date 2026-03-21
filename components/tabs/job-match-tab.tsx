'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { KeywordMatchResult } from '@/lib/analysis-engine';
import { Textarea } from '@/components/ui/textarea';

interface JobMatchTabProps {
  jobMatchResult: KeywordMatchResult | null;
  onJobDescriptionChange: (jobDescription: string) => void;
}

export default function JobMatchTab({ jobMatchResult, onJobDescriptionChange }: JobMatchTabProps) {
  const [jobDescription, setJobDescription] = useState('');

  const handleChange = (value: string) => {
    setJobDescription(value);
    onJobDescriptionChange(value);
  };

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-3">
          Paste Job Description
        </label>
        <Textarea
          placeholder="Paste the job description here to analyze how well your resume matches..."
          value={jobDescription}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[200px] resize-none bg-white text-slate-900 placeholder:text-slate-400 border-slate-200 focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
        />
        <p className="text-xs text-slate-600 mt-2">
          The analyzer will show which keywords from the job posting are present in your resume
        </p>
      </div>

      {/* Match Results */}
      {jobMatchResult && (
        <>
          {/* Match Score */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Match Analysis</h3>
            <div className="bg-slate-50 rounded-lg p-6 text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {jobMatchResult.matchScore}%
              </div>
              <p className="text-sm text-slate-600">
                Job Description Match ({jobMatchResult.matchedCount} of {jobMatchResult.totalJobKeywords} keywords)
              </p>
            </div>
          </div>

          {/* Matched Keywords */}
          {jobMatchResult.matchedKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-slate-900">Matched Keywords</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {jobMatchResult.matchedKeywords.slice(0, 12).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {jobMatchResult.missingKeywords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-slate-900">Top Missing Keywords</h4>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Consider adding these keywords to your resume to improve your match:
              </p>
              <div className="flex flex-wrap gap-2">
                {jobMatchResult.missingKeywords.slice(0, 12).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How to improve your match:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Add matched keywords naturally throughout your resume</li>
                <li>Focus on role-specific terms in your experience descriptions</li>
                <li>Ensure your skills section includes relevant keywords</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {!jobDescription && (
        <div className="bg-slate-50 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600">
            Paste a job description above to see keyword matching
          </p>
        </div>
      )}
    </div>
  );
}
