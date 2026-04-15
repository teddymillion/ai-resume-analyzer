'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FileText, Loader2, AlertTriangle, ArrowLeft, Download, Sparkles, LogOut, CheckCircle2, AlertCircle, Lightbulb, Zap } from 'lucide-react'
import AuthGuard from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSignOut } from '@/hooks/use-sign-out'
import { useDeleteResume } from '@/hooks/use-delete-resume'
import { supabase } from '@/lib/supabase'
import type { ResumeRow, AnalysisRow } from '@/lib/types'
import { Button } from '@/components/ui/button'

export default function ResumeDetailPage() {
  return <AuthGuard><ResumeDetailContent /></AuthGuard>
}

const FEEDBACK_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  strengths:        { label: 'Strengths',         icon: CheckCircle2, color: 'text-emerald-400', bg: 'border-emerald-500/15 bg-emerald-500/[0.07]' },
  weaknesses:       { label: 'Areas to Improve',  icon: AlertCircle,  color: 'text-amber-400',   bg: 'border-amber-500/15 bg-amber-500/[0.07]' },
  missingSkills:    { label: 'Missing Skills',     icon: Zap,          color: 'text-blue-400',    bg: 'border-blue-500/15 bg-blue-500/[0.07]' },
  atsIssues:        { label: 'ATS Issues',         icon: AlertCircle,  color: 'text-red-400',     bg: 'border-red-500/15 bg-red-500/[0.07]' },
  atsSuggestions:   { label: 'ATS Suggestions',    icon: Lightbulb,    color: 'text-cyan-400',    bg: 'border-cyan-500/15 bg-cyan-500/[0.07]' },
  formattingQuality:{ label: 'Formatting Quality', icon: CheckCircle2, color: 'text-violet-400',  bg: 'border-violet-500/15 bg-violet-500/[0.07]' },
}

function ResumeDetailContent() {
  const router = useRouter()
  const params = useParams()
  const resumeId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const { user } = useAuth()
  const handleSignOut = useSignOut()

  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [resume, setResume] = useState<ResumeRow | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const { requestDelete, confirmDelete, cancelDelete, pendingDeleteId, deletingId, error: deleteError } =
    useDeleteResume({ onSuccess: () => router.replace('/resumes') })

  const error = fetchError ?? deleteError
  const isPending = pendingDeleteId === resumeId

  useEffect(() => {
    if (!user || !resumeId) return
    let active = true
    const load = async () => {
      setLoading(true)
      setFetchError(null)
      const { data: row, error: e } = await supabase
        .from('resumes')
        .select('id, user_id, file_name, parsed_text, file_path, created_at')
        .eq('id', resumeId).eq('user_id', user.id).single()
      if (!active) return
      if (e) { setFetchError(e.message); setLoading(false); return }
      setResume(row)
      if (row?.file_path) {
        const { data: signed } = await supabase.storage.from('resumes').createSignedUrl(row.file_path, 600)
        if (signed?.signedUrl) setDownloadUrl(signed.signedUrl)
      }
      const { data: aRow, error: ae } = await supabase
        .from('analysis_results')
        .select('id, resume_id, overall_score, ats_score, feedback, created_at')
        .eq('resume_id', resumeId).order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (!active) return
      if (ae) { setFetchError(ae.message); setLoading(false); return }
      setAnalysis(aRow ?? null)
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [user, resumeId])

  const feedbackEntries = useMemo(() => {
    if (!analysis?.feedback || typeof analysis.feedback !== 'object') return []
    return Object.entries(analysis.feedback)
  }, [analysis])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-500/30">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-white">ResumeAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/8" onClick={() => router.push('/resumes')}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/8" onClick={() => void handleSignOut()} title="Sign out">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="ml-3 text-sm text-white/50">Loading…</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300">{error}</div>
        )}

        {!loading && !error && resume && (
          <div className="space-y-6 animate-fade-in">
            {/* File header */}
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                  <FileText className="h-5 w-5 text-white/50" />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-white">{resume.file_name}</h1>
                  <p className="text-xs text-white/40">{new Date(resume.created_at).toLocaleString()} · {resume.parsed_text?.length ?? 0} chars parsed</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {downloadUrl && (
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/8" onClick={() => window.open(downloadUrl, '_blank')}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                )}
                {!isPending && (
                  <Button size="sm" variant="ghost" className="text-xs border border-red-500/20 text-red-400/70 hover:text-red-300 hover:bg-red-500/10" onClick={() => resumeId && requestDelete(resumeId)} disabled={!!deletingId}>
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Delete confirm */}
            {isPending && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <p className="text-sm text-amber-200">Delete this resume and all analysis data? This cannot be undone.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="border border-white/10 text-xs hover:bg-white/8" onClick={cancelDelete}>Cancel</Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white text-xs" onClick={() => void confirmDelete()} disabled={!!deletingId}>
                    {deletingId ? 'Deleting…' : 'Yes, Delete'}
                  </Button>
                </div>
              </div>
            )}

            {/* Scores */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Overall Score', value: analysis?.overall_score, color: 'text-cyan-400' },
                { label: 'ATS Score', value: analysis?.ats_score, color: 'text-emerald-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
                  <p className="text-xs text-white/40 mb-2">{s.label}</p>
                  <p className={`text-4xl font-bold tabular-nums ${s.color}`}>{s.value ?? '—'}</p>
                  <p className="text-xs text-white/30 mt-1">out of 100</p>
                </div>
              ))}
            </div>

            {/* Feedback */}
            {feedbackEntries.length > 0 && (
              <div>
                <h2 className="mb-4 text-sm font-semibold text-white">AI Feedback</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {feedbackEntries.map(([key, value]) => {
                    const cfg = FEEDBACK_CONFIG[key]
                    const Icon = cfg?.icon ?? CheckCircle2
                    return (
                      <div key={key} className={`rounded-xl border p-4 ${cfg?.bg ?? 'border-white/[0.08] bg-white/[0.03]'}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`h-4 w-4 ${cfg?.color ?? 'text-white/50'}`} />
                          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                            {cfg?.label ?? key}
                          </p>
                        </div>
                        {Array.isArray(value) ? (
                          <ul className="space-y-1.5">
                            {(value as unknown[]).map((item, i) => (
                              <li key={i} className="flex gap-2 text-sm text-white/75">
                                <span className={`mt-1 h-1 w-1 shrink-0 rounded-full ${cfg?.color ?? 'bg-white/30'}`} style={{ background: 'currentColor' }} />
                                {String(item)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm font-medium text-white/80 capitalize">{String(value)}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Parsed text */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <h2 className="mb-3 text-sm font-semibold text-white">Parsed Resume Text</h2>
              <div className="max-h-80 overflow-y-auto rounded-xl bg-slate-900/60 p-4">
                <pre className="whitespace-pre-wrap text-xs text-white/50 leading-relaxed font-mono">
                  {resume.parsed_text || 'No parsed text available.'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
