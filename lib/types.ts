import type { ParsedResume } from './resume-parser'
import type { AnalysisResult, KeywordMatchResult } from './analysis-engine'

// ─── Analyzer UI State ────────────────────────────────────────────────────────

export interface ResumeAnalyzerState {
  resumeFile: File | null
  parsedResume: ParsedResume | null
  analysis: AnalysisResult | null
  jobDescription: string
  jobMatchResult: KeywordMatchResult | null
  loading: boolean
  error: string | null
  stage: 'empty' | 'loading' | 'success' | 'error'
}

export interface RewriteSuggestion {
  original: string
  improved: string
}

export type TabType = 'overview' | 'skills' | 'job-match' | 'ats' | 'suggestions'

// ─── Supabase DB Row Types ────────────────────────────────────────────────────

export interface ResumeRow {
  id: string
  user_id: string
  file_name: string
  parsed_text: string | null
  file_path: string | null
  created_at: string
}

export interface AnalysisRow {
  id: string
  resume_id: string
  overall_score: number
  ats_score: number
  feedback: Record<string, unknown> | null
  created_at: string
}
