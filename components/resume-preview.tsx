'use client';

import { ParsedResume } from '@/lib/resume-parser';
import { Card } from '@/components/ui/card';

interface ResumePreviewProps {
  resume: ParsedResume;
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <Card className="bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">Resume Preview</h3>
        <p className="text-xs text-slate-600 mt-1">
          {resume.wordCount} words • {resume.charCount} characters
        </p>
      </div>

      {/* Sections */}
      <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto">
        {resume.sections.length > 0 ? (
          resume.sections.map((section, idx) => (
            <div key={idx}>
              {/* Section Title */}
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 pb-2 border-b border-slate-200">
                {section.title}
              </h4>

              {/* Section Content */}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="space-y-2">
                  {section.bullets.slice(0, 5).map((bullet, bulletIdx) => (
                    <li key={bulletIdx} className="text-xs text-slate-700 leading-relaxed flex gap-2">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                  {section.bullets.length > 5 && (
                    <p className="text-xs text-slate-500 italic mt-2">
                      +{section.bullets.length - 5} more items
                    </p>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-slate-600 line-clamp-3">{section.content}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-600">No sections detected</p>
        )}

        {/* Skills Badge */}
        {resume.skills.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
              Detected Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {resume.skills.slice(0, 8).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
              {resume.skills.length > 8 && (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                  +{resume.skills.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
