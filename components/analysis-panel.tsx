'use client'

import { useState } from 'react'
import type { AnalysisResult, KeywordMatchResult } from '@/lib/analysis-engine'
import type { ResumeSection } from '@/lib/resume-parser'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
}

const TAB_TRIGGER_CLASS =
  'rounded-none border-0 text-white/60 data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-cyan-400 data-[state=active]:text-cyan-300'

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'skills', label: 'Skills' },
  { value: 'job-match', label: 'Job Match' },
  { value: 'ats', label: 'ATS' },
  { value: 'suggestions', label: 'AI Suggestions' },
]

export default function AnalysisPanel({
  analysis,
  jobMatchResult,
  jobDescription,
  onJobDescriptionChange,
  resumeSections,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="animate-fade-in rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none p-0 h-auto">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={TAB_TRIGGER_CLASS}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="p-6">
          <TabsContent value="overview" className="m-0">
            <OverviewTab analysis={analysis} />
          </TabsContent>
          <TabsContent value="skills" className="m-0">
            <SkillsTab analysis={analysis} />
          </TabsContent>
          <TabsContent value="job-match" className="m-0">
            <JobMatchTab
              jobMatchResult={jobMatchResult}
              jobDescription={jobDescription}
              onJobDescriptionChange={onJobDescriptionChange}
            />
          </TabsContent>
          <TabsContent value="ats" className="m-0">
            <ATSTab analysis={analysis} />
          </TabsContent>
          <TabsContent value="suggestions" className="m-0">
            <SuggestionsTab resumeSections={resumeSections} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
