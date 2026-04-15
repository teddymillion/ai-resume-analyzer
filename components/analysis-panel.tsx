'use client'

import { useState } from 'react'
import type { AnalysisResult, KeywordMatchResult } from '@/lib/analysis-engine'
import type { ResumeSection } from '@/lib/resume-parser'
import OverviewTab from './tabs/overview-tab'
import SkillsTab from './tabs/skills-tab'
import JobMatchTab from './tabs/job-match-tab'
import ATSTab from './tabs/ats-tab'
import SuggestionsTab from './tabs/suggestions-tab'

interface AnalysisPanelProps {
  analysis: AnalysisResult
  jobMatchResult: KeywordMatchResult | null
  jobDescription: string
  onJobDescriptionChange: (value: string) => void
  resumeSections: ResumeSection[]
  detectedSkills?: string[]
}

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'skills',       label: 'Skills' },
  { id: 'job-match',    label: 'Job Match' },
  { id: 'ats',          label: 'ATS' },
  { id: 'suggestions',  label: 'AI Rewrites' },
] as const

type TabId = typeof TABS[number]['id']

export default function AnalysisPanel({
  analysis,
  jobMatchResult,
  jobDescription,
  onJobDescriptionChange,
  resumeSections,
  detectedSkills = [],
}: AnalysisPanelProps) {
  const [active, setActive] = useState<TabId>('overview')

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
      {/* Tab bar — scrollable on mobile */}
      <div className="border-b border-white/[0.08] px-4 pt-4">
        <div className="flex gap-1 overflow-x-auto pb-px scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={[
                'shrink-0 rounded-lg px-3.5 py-2 text-xs font-medium transition-all duration-150',
                active === tab.id
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-5 sm:p-6">
        {active === 'overview' && <OverviewTab analysis={analysis} />}
        {active === 'skills' && <SkillsTab analysis={analysis} detectedSkills={detectedSkills} />}
        {active === 'job-match' && (
          <JobMatchTab
            jobMatchResult={jobMatchResult}
            jobDescription={jobDescription}
            onJobDescriptionChange={onJobDescriptionChange}
          />
        )}
        {active === 'ats' && <ATSTab analysis={analysis} />}
        {active === 'suggestions' && <SuggestionsTab resumeSections={resumeSections} />}
      </div>
    </div>
  )
}
