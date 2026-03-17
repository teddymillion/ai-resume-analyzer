'use client';

import { useState } from 'react';
import { AnalysisResult, KeywordMatchResult } from '@/lib/analysis-engine';
import { ResumeSection } from '@/lib/resume-parser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './tabs/overview-tab';
import SkillsTab from './tabs/skills-tab';
import JobMatchTab from './tabs/job-match-tab';
import ATSTab from './tabs/ats-tab';
import SuggestionsTab from './tabs/suggestions-tab';

interface AnalysisPanelProps {
  analysis: AnalysisResult;
  jobMatchResult: KeywordMatchResult | null;
  onJobDescriptionChange: (jobDescription: string) => void;
  resumeSections: ResumeSection[];
}

export default function AnalysisPanel({
  analysis,
  jobMatchResult,
  onJobDescriptionChange,
  resumeSections,
}: AnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="animate-fade-in bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab List */}
        <TabsList className="w-full bg-slate-50 border-b border-slate-200 rounded-none p-0">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-0"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-0"
          >
            Skills
          </TabsTrigger>
          <TabsTrigger
            value="job-match"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-0"
          >
            Job Match
          </TabsTrigger>
          <TabsTrigger
            value="ats"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-0"
          >
            ATS
          </TabsTrigger>
          <TabsTrigger
            value="suggestions"
            className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-0"
          >
            AI Suggestions
          </TabsTrigger>
        </TabsList>

        {/* Tab Contents */}
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
  );
}
