'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { History, LogOut, Plus, Sparkles } from 'lucide-react'
import type { ParsedResume } from '@/lib/resume-parser'
import type { AnalysisResult } from '@/lib/analysis-engine'
import { matchJobDescription } from '@/lib/analysis-engine'
import type { ResumeAnalyzerState } from '@/lib/types'
import { useAuth } from '@/hooks/use-auth'
import { useSignOut } from '@/hooks/use-sign-out'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import ResumeUpload from './resume-upload'
import ResumePreview from './resume-preview'
import AnalysisPanel from './analysis-panel'
import SummaryBar from './summary-bar'
import ErrorState from './error-state'
import AnalysisLoader from './analysis-loader'

const RESUME_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_RESUME_BUCKET ?? 'resumes'

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const INITIAL_STATE: ResumeAnalyzerState = {
  resumeFile: null,
  parsedResume: null,
  analysis: null,
  jobDescription: '',
  jobMatchResult: null,
  loading: false,
  error: null,
  stage: 'empty',
}

function isAllowedFile(file: File): boolean {
  const lower = file.name.toLowerCase()
  return ALLOWED_TYPES.has(file.type) || lower.endsWith('.pdf') || lower.endsWith('.docx')
}

export default function ResumeAnalyzer() {
  const router = useRouter()
  const { user } = useAuth()
  const handleSignOut = useSignOut()
  const [state, setState] = useState<ResumeAnalyzerState>(INITIAL_STATE)

  const handleFileUpload = async (file: File) => {
    if (!isAllowedFile(file)) {
      setState((prev) => ({ ...prev, error: 'Invalid file type. Please upload a PDF or DOCX file.', stage: 'error' }))
      return
    }

    setState((prev) => ({ ...prev, loading: true, stage: 'loading', error: null }))

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) throw new Error('You must be logged in to upload a resume.')

      const storagePath = `${userData.user.id}/${crypto.randomUUID()}-${file.name}`

      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/ai/analyze', { method: 'POST', body: formData })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const msg = data.details
          ? `${data.error ?? 'Failed to analyze'} (${data.details})`
          : (data.error ?? 'Failed to analyze resume')
        throw new Error(
          msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')
            ? 'Gemini is currently overloaded. Please wait a moment and try again.'
            : msg,
        )
      }

      const { parsedResume, analysis } = (await response.json()) as {
        parsedResume: ParsedResume
        analysis: AnalysisResult
      }

      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(storagePath, file, { cacheControl: '3600', upsert: false, contentType: file.type })

      if (uploadError) {
        throw new Error(
          uploadError.message?.toLowerCase().includes('bucket')
            ? `Storage bucket "${RESUME_BUCKET}" not found. Create it in Supabase Storage.`
            : (uploadError.message ?? 'Failed to upload resume file.'),
        )
      }

      const { data: resumeRow, error: resumeError } = await supabase
        .from('resumes')
        .insert({ user_id: userData.user.id, file_name: file.name, parsed_text: parsedResume.rawText ?? '', file_path: storagePath })
        .select('id')
        .single()

      if (resumeError || !resumeRow) {
        await supabase.storage.from(RESUME_BUCKET).remove([storagePath])
        throw new Error(resumeError?.message ?? 'Failed to save resume.')
      }

      const { error: analysisError } = await supabase.from('analysis_results').insert({
        resume_id: resumeRow.id,
        overall_score: analysis.overallScore,
        ats_score: analysis.atsScore,
        feedback: {
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          missingSkills: analysis.missingSkills,
          atsIssues: analysis.atsIssues,
          atsSuggestions: analysis.atsSuggestions,
          formattingQuality: analysis.formattingQuality,
          keywordDensity: analysis.keywordDensity,
        },
      })

      if (analysisError) {
        await supabase.from('resumes').delete().eq('id', resumeRow.id)
        await supabase.storage.from(RESUME_BUCKET).remove([storagePath])
        throw new Error(analysisError.message ?? 'Failed to save analysis.')
      }

      setState((prev) => ({ ...prev, resumeFile: file, parsedResume, analysis, loading: false, stage: 'success', error: null }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to process file. Please try again.',
        stage: 'error',
        loading: false,
      }))
    }
  }

  const handleJobDescriptionChange = (jobDescription: string) => {
    setState((prev) => ({
      ...prev,
      jobDescription,
      jobMatchResult:
        jobDescription.trim() && prev.parsedResume
          ? matchJobDescription(prev.parsedResume, jobDescription)
          : null,
    }))
  }

  const handleReset = () => setState(INITIAL_STATE)

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(99,102,241,0.08),transparent)]" />
      </div>

      {/* ── Sticky Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link href="/landing" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-500/30">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">ResumeAI</span>
            <span className="hidden rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-cyan-400 ring-1 ring-cyan-500/20 sm:inline">
              Beta
            </span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            {state.stage === 'success' && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-white/70 hover:text-white hover:bg-white/8 text-xs"
                onClick={handleReset}
              >
                <Plus className="h-3.5 w-3.5" />
                New Analysis
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-white/70 hover:text-white hover:bg-white/8 text-xs"
              onClick={() => router.push('/resumes')}
            >
              <History className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
            </Button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <span className="hidden text-xs text-white/50 sm:block max-w-[140px] truncate">{user.email}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-white/50 hover:text-white hover:bg-white/8"
                  onClick={() => void handleSignOut()}
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────────────── */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 sm:px-6">

        {/* ── Empty / Upload ──────────────────────────────────────────────── */}
        {state.stage === 'empty' && (
          <div className="animate-fade-in-up pt-16 pb-8">
            {/* Hero */}
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Powered by Gemini AI
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your resume,{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  analyzed
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base text-white/60 sm:text-lg">
                Get ATS scores, skill gaps, job match analysis, and AI-powered bullet rewrites in seconds.
              </p>
            </div>

            {/* Feature pills */}
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              {['ATS Compatibility', 'Skill Gap Detection', 'Job Match %', 'AI Bullet Rewrites', 'Formatting Quality'].map((f) => (
                <span key={f} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {f}
                </span>
              ))}
            </div>

            {/* Upload card */}
            <div className="mx-auto max-w-2xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl ring-1 ring-white/5 sm:p-8">
                <ResumeUpload onFileSelect={handleFileUpload} loading={state.loading} />
              </div>
            </div>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {state.stage === 'loading' && <AnalysisLoader />}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {state.stage === 'error' && (
          <div className="animate-fade-in pt-12">
            <ErrorState error={state.error ?? 'An error occurred'} onRetry={handleReset} />
            <div className="mx-auto mt-8 max-w-2xl">
              <ResumeUpload onFileSelect={handleFileUpload} loading={state.loading} />
            </div>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {state.stage === 'success' && state.parsedResume && state.analysis && (
          <div className="animate-fade-in pt-8 space-y-6">
            {/* File badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {state.resumeFile?.name ?? 'Resume analyzed'}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-white/50 hover:text-white text-xs"
                onClick={handleReset}
              >
                <Plus className="h-3.5 w-3.5" />
                Analyze another
              </Button>
            </div>

            {/* Score cards */}
            <SummaryBar
              overallScore={state.analysis.overallScore}
              atsScore={state.analysis.atsScore}
              matchScore={state.jobMatchResult?.matchScore ?? null}
            />

            {/* Main grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
              <ResumePreview resume={state.parsedResume} />
              <AnalysisPanel
                analysis={state.analysis}
                jobMatchResult={state.jobMatchResult}
                jobDescription={state.jobDescription}
                onJobDescriptionChange={handleJobDescriptionChange}
                resumeSections={state.parsedResume.sections}
                detectedSkills={state.parsedResume.skills}
              />
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06] py-6 text-center text-xs text-white/30">
        © {new Date().getFullYear()} ResumeAI · Built with Gemini
      </footer>
    </div>
  )
}
