'use client'

import type { ParsedResume } from '@/lib/resume-parser'

interface ResumePreviewProps {
  resume: ParsedResume
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white">Resume Preview</h3>
        <p className="text-xs text-white/50 mt-1">
          {resume.wordCount} words · {resume.charCount} characters
        </p>
      </div>

      {/* Sections */}
      <div className="p-6 space-y-6 max-h-[800px] overflow-y-auto">
        {resume.sections.length > 0 ? (
          resume.sections.map((section, idx) => (
            <div key={idx}>
              <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-3 pb-2 border-b border-white/10">
                {section.title}
              </h4>

              {section.bullets.length > 0 ? (
                <ul className="space-y-2">
                  {section.bullets.slice(0, 5).map((bullet, bIdx) => (
                    <li key={bIdx} className="text-xs text-white/70 leading-relaxed flex gap-2">
                      <span className="text-cyan-400 font-bold mt-0.5 shrink-0">•</span>
                      <span className="line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                  {section.bullets.length > 5 && (
                    <p className="text-xs text-white/40 italic mt-1">
                      +{section.bullets.length - 5} more items
                    </p>
                  )}
                </ul>
              ) : (
                <p className="text-xs text-white/60 line-clamp-3">{section.content}</p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-white/50">No sections detected</p>
        )}

        {/* Detected Skills */}
        {resume.skills.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-widest mb-3">
              Detected Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {resume.skills.slice(0, 8).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-cyan-500/15 text-cyan-300 text-xs font-medium rounded-full border border-cyan-500/20"
                >
                  {skill}
                </span>
              ))}
              {resume.skills.length > 8 && (
                <span className="px-2.5 py-1 bg-white/10 text-white/60 text-xs font-medium rounded-full">
                  +{resume.skills.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
