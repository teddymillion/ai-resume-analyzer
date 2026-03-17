/**
 * Shared types for the Resume Analyzer application
 */

import { ParsedResume } from './resume-parser';
import { AnalysisResult, KeywordMatchResult } from './analysis-engine';

export interface ResumeAnalyzerState {
  resumeFile: File | null;
  parsedResume: ParsedResume | null;
  analysis: AnalysisResult | null;
  jobDescription: string;
  jobMatchResult: KeywordMatchResult | null;
  loading: boolean;
  error: string | null;
  stage: 'empty' | 'loading' | 'success' | 'error';
}

export interface RewriteSuggestion {
  original: string;
  improved: string;
}

export type TabType = 'overview' | 'skills' | 'job-match' | 'ats' | 'suggestions';
