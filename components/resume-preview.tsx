'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import type { ParsedResume, ResumeSection } from '@/lib/resume-parser'

const SECTION_COLORS: Record<ResumeSection['type'], string> = {
  summary:    'text-blue-400 bg-blue-400/10 ring-blue-400/20',
  experience: 'text-cyan-400 bg-cyan-400/10 ring-cyan-400/20',
  skills:     'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20',
  education:  'text-violet-400 bg-violet-400/10 ring-violet-400/20',
  other:      'text-white/40 bg-white/5 ring-white/10',
}

function SectionBlock({ section }: { section: ResumeSection }) {
  const [open, setOpen] = useState(true)
  const colorCls = SECTION_COLORS[section.type]

  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${colorCls}`}>
            {section.type}
          </span>
          <span className="truncate text-xs font-medium text-white/70">{section.title}</span>
        </div>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 shrink-0 text-white/30" />
          : <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/30" />}
      </button>

      {open && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          {section.bullets.length > 0 ? (
            <ul className="space-y-1.5">
              {section.bullets.slice(0, 6).map((b, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                  <span className="line-clamp-2">{b}</span>
                </li>
              ))}
              {section.bullets.length > 6 && (
                <li className="text-xs text-white/30 italic pl-3">+{section.bullets.length - 6} more</li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">{section.content}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function ResumePreview({ resume }: { resume: ParsedResume }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
          <FileText className="h-4 w-4 text-white/50" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Resume Preview</p>
          <p className="text-xs text-white/40">{resume.wordCount} words · {resume.charCount} chars</p>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
        {resume.sections.length > 0 ? (
          resume.sections.map((section, i) => (
            <SectionBlock key={i} section={section} />
          ))
        ) : (
          <p className="py-8 text-center text-sm text-white/40">No sections detected</p>
        )}

        {/* Skills */}
        {resume.skills.length > 0 && (
          <div className="pt-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">Detected Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {resume.skills.slice(0, 12).map((skill, i) => (
                <span key={i} className="rounded-full border border-cyan-500/20 bg-cyan-500/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
                  {skill}
                </span>
              ))}
              {resume.skills.length > 12 && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/40">
                  +{resume.skills.length - 12}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
