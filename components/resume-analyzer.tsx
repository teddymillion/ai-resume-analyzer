'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import EmptyState from './empty-state'
import ErrorState from './error-state'
import AnalysisLoader from './analysis-loader'

// Module-level constant — not re-evaluated on every render
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

const NEURAL_PATTERN =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='none'/%3E%3Cg stroke='%2365d8ff' stroke-width='1.2' opacity='0.35'%3E%3Cline x1='80' y1='120' x2='240' y2='80'/%3E%3Cline x1='80' y1='120' x2='220' y2='180'/%3E%3Cline x1='240' y1='80' x2='420' y2='120'/%3E%3Cline x1='220' y1='180' x2='420' y2='120'/%3E%3Cline x1='420' y1='120' x2='600' y2='90'/%3E%3Cline x1='420' y1='120' x2='600' y2='180'/%3E%3Cline x1='600' y1='90' x2='780' y2='140'/%3E%3Cline x1='600' y1='180' x2='780' y2='140'/%3E%3Cline x1='220' y1='180' x2='260' y2='320'/%3E%3Cline x1='260' y1='320' x2='420' y2='260'/%3E%3Cline x1='420' y1='260' x2='620' y2='320'/%3E%3Cline x1='620' y1='320' x2='780' y2='240'/%3E%3C/g%3E%3Cg fill='%23b9f2ff' opacity='0.55'%3E%3Ccircle cx='80' cy='120' r='6'/%3E%3Ccircle cx='240' cy='80' r='7'/%3E%3Ccircle cx='220' cy='180' r='7'/%3E%3Ccircle cx='420' cy='120' r='8'/%3E%3Ccircle cx='600' cy='90' r='7'/%3E%3Ccircle cx='600' cy='180' r='7'/%3E%3Ccircle cx='780' cy='140' r='8'/%3E%3Ccircle cx='260' cy='320' r='6'/%3E%3Ccircle cx='420' cy='260' r='7'/%3E%3Ccircle cx='620' cy='320' r='7'/%3E%3Ccircle cx='780' cy='240' r='6'/%3E%3C/g%3E%3C/svg%3E\")"

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

      // Analyze with Gemini
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/ai/analyze', { method: 'POST', body: formData })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const msg = data.details ? `${data.error ?? 'Failed to analyze'} (${data.details})` : (data.error ?? 'Failed to analyze resume')
        // Make 503 errors user-friendly
        const friendlyMsg = msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')
          ? 'Gemini is currently overloaded. We retried 3 times automatically. Please wait a minute and try again.'
          : msg
        throw new Error(friendlyMsg)
      }

      const { parsedResume, analysis } = await response.json() as {
        parsedResume: ParsedResume
        analysis: AnalysisResult
      }

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(RESUME_BUCKET)
        .upload(storagePath, file, { cacheControl: '3600', upsert: false, contentType: file.type })

      if (uploadError) {
        const msg = uploadError.message?.toLowerCase().includes('bucket')
          ? `Storage bucket "${RESUME_BUCKET}" not found. Create it in Supabase Storage.`
          : uploadError.message ?? 'Failed to upload resume file.'
        throw new Error(msg)
      }

      // Save resume row
      const { data: resumeRow, error: resumeError } = await supabase
        .from('resumes')
        .insert({ user_id: userData.user.id, file_name: file.name, parsed_text: parsedResume.rawText ?? '', file_path: storagePath })
        .select('id')
        .single()

      if (resumeError || !resumeRow) {
        await supabase.storage.from(RESUME_BUCKET).remove([storagePath])
        throw new Error(resumeError?.message ?? 'Failed to save resume.')
      }

      // Save analysis row
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
    setState((prev) => {
      const jobMatchResult =
        jobDescription.trim() && prev.parsedResume
          ? matchJobDescription(prev.parsedResume, jobDescription)
          : null
      return { ...prev, jobDescription, jobMatchResult }
    })
  }

  const handleRetry = () => setState(INITIAL_STATE)

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_45%),radial-gradient(circle_at_20%_60%,rgba(34,197,94,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(14,116,144,0.4),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-70"
          style={{ backgroundImage: NEURAL_PATTERN, backgroundSize: '900px 600px', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/75 to-slate-950" />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-[1440px]">

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/60">Gemini-powered Career Intel</p>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-2">AI Resume Analyzer</h1>
              <p className="text-lg text-white/70 mt-3 max-w-2xl">
                Get ATS-focused insights, skill gaps, and rewrite-ready suggestions in one smart scan.
              </p>
            </div>
            {user && (
              <div className="flex flex-col items-start gap-2 md:items-end">
                <span className="text-sm text-white/70">{user.email}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => router.push('/resumes')}>
                    My Resumes
                  </Button>
                  <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={handleSignOut}>
                    Log out
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Hero / Upload section — only shown when empty */}
          {state.stage === 'empty' && (
            <section className="mb-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                  Smart Scan
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-white mt-4">
                  One upload. Full resume intelligence.
                </h2>
                <p className="text-white/70 mt-3 max-w-xl">
                  We parse structure, highlight impact gaps, and surface ATS risks with a clean, recruiter-ready summary.
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-white/80">
                  {['ATS Readiness', 'Skill Gaps', 'Bullet Rewrites'].map((label) => (
                    <div key={label} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">{label}</div>
                  ))}
                </div>
                <div className="mt-6">
                  <ResumeUpload onFileSelect={handleFileUpload} loading={state.loading} />
                </div>
              </div>

              {/* Decorative preview card */}
              <div className="relative hidden lg:block">
                <div className="absolute -inset-6 bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-transparent blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/60 p-6">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>AI Resume Analyzer</span>
                    <span className="rounded-full border border-white/10 px-2 py-0.5">Live</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[3, 2, 5, 1].map((w, i) => (
                      <div key={i} className={`h-2 rounded-full bg-white/10`} style={{ width: `${w * 15 + 20}%` }} />
                    ))}
                  </div>
                  <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Signal Extraction</div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="h-10 rounded-lg bg-cyan-500/20 animate-[float_5s_ease-in-out_infinite]" />
                      <div className="h-10 rounded-lg bg-blue-500/20 animate-[float_6s_ease-in-out_infinite]" />
                      <div className="h-10 rounded-lg bg-emerald-500/20 animate-[float_4.5s_ease-in-out_infinite]" />
                    </div>
                  </div>
                  <div className="pointer-events-none absolute left-0 top-0 h-20 w-full bg-gradient-to-b from-cyan-400/30 to-transparent animate-[scan_3.5s_ease-in-out_infinite]" />
                </div>
              </div>
            </section>
          )}

          {/* Summary scores */}
          {state.stage === 'success' && state.analysis && (
            <SummaryBar
              overallScore={state.analysis.overallScore}
              atsScore={state.analysis.atsScore}
              matchScore={state.jobMatchResult?.matchScore ?? null}
            />
          )}

          {/* Error state */}
          {state.stage === 'error' && (
            <ErrorState error={state.error ?? 'An error occurred'} onRetry={handleRetry} />
          )}

          {/* Loading state */}
          {state.stage === 'loading' && <AnalysisLoader />}

          {/* Results */}
          {state.stage === 'success' && state.parsedResume && state.analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="lg:col-span-1">
                <ResumePreview resume={state.parsedResume} />
              </div>
              <div className="lg:col-span-2">
                <AnalysisPanel
                  analysis={state.analysis}
                  jobMatchResult={state.jobMatchResult}
                  jobDescription={state.jobDescription}
                  onJobDescriptionChange={handleJobDescriptionChange}
                  resumeSections={state.parsedResume.sections}
                />
              </div>
            </div>
          )}

          {/* Upload again — shown on error state */}
          {state.stage === 'error' && (
            <div className="mt-8">
              <ResumeUpload onFileSelect={handleFileUpload} loading={state.loading} />
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
