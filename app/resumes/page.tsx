'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, AlertTriangle, Plus, Sparkles, LogOut, ArrowRight } from 'lucide-react'
import AuthGuard from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/use-auth'
import { useSignOut } from '@/hooks/use-sign-out'
import { useDeleteResume } from '@/hooks/use-delete-resume'
import { supabase } from '@/lib/supabase'
import type { ResumeRow, AnalysisRow } from '@/lib/types'
import { Button } from '@/components/ui/button'

export default function ResumesPage() {
  return <AuthGuard><ResumesContent /></AuthGuard>
}

function ScorePill({ value, color }: { value: number | undefined; color: string }) {
  if (value === undefined) return <span className="text-lg font-bold text-white/30">—</span>
  return <span className={`text-2xl font-bold tabular-nums ${color}`}>{value}</span>
}

function ResumesContent() {
  const router = useRouter()
  const { user } = useAuth()
  const handleSignOut = useSignOut()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [resumes, setResumes] = useState<ResumeRow[]>([])
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])

  const { requestDelete, confirmDelete, cancelDelete, pendingDeleteId, deletingId, error: deleteError } =
    useDeleteResume({
      onSuccess: (id) => {
        setResumes((p) => p.filter((r) => r.id !== id))
        setAnalyses((p) => p.filter((a) => a.resume_id !== id))
      },
    })

  const error = fetchError ?? deleteError

  useEffect(() => {
    if (!user) return
    let active = true
    const load = async () => {
      setLoading(true)
      setFetchError(null)
      const { data: rows, error: e } = await supabase
        .from('resumes')
        .select('id, user_id, file_name, parsed_text, file_path, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (!active) return
      if (e) { setFetchError(e.message); setLoading(false); return }
      const list = rows ?? []
      setResumes(list)
      if (!list.length) { setLoading(false); return }
      const { data: aRows, error: ae } = await supabase
        .from('analysis_results')
        .select('id, resume_id, overall_score, ats_score, feedback, created_at')
        .in('resume_id', list.map((r) => r.id))
      if (!active) return
      if (ae) { setFetchError(ae.message); setLoading(false); return }
      setAnalyses(aRows ?? [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  }, [user])

  const analysisByResume = useMemo(() => {
    const m = new Map<string, AnalysisRow>()
    analyses.forEach((a) => m.set(a.resume_id, a))
    return m
  }, [analyses])

  const avgOverall = useMemo(() => {
    const scores = analyses.map((a) => a.overall_score).filter((s): s is number => s != null)
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  }, [analyses])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-500/30">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <span className="text-sm font-semibold text-white">ResumeAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/8" onClick={() => router.push('/')}>
              <Plus className="h-3.5 w-3.5" /> New Analysis
            </Button>
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <span className="hidden text-xs text-white/40 sm:block max-w-[140px] truncate">{user.email}</span>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/8" onClick={() => void handleSignOut()} title="Sign out">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Resume History</h1>
          <p className="mt-1 text-sm text-white/50">All your uploaded resumes and AI analysis results.</p>
        </div>

        {/* Stats */}
        {!loading && resumes.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: 'Total Resumes', value: resumes.length },
              { label: 'Avg Overall Score', value: avgOverall ?? '—' },
              { label: 'Analyses Run', value: analyses.length },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-xs text-white/40">{s.label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="ml-3 text-sm text-white/50">Loading resumes…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.07] p-4 text-sm text-red-300">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && resumes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
              <FileText className="h-7 w-7 text-white/30" />
            </div>
            <h2 className="text-lg font-semibold text-white">No resumes yet</h2>
            <p className="mt-2 text-sm text-white/50">Upload your first resume to get started.</p>
            <Button className="mt-6 bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-semibold" onClick={() => router.push('/')}>
              Analyze a Resume
            </Button>
          </div>
        )}

        {/* Grid */}
        {!loading && resumes.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {resumes.map((resume) => {
              const analysis = analysisByResume.get(resume.id)
              const isPending = pendingDeleteId === resume.id
              const isDeleting = deletingId === resume.id

              return (
                <div key={resume.id} className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-white/15 hover:bg-white/[0.05]">
                  {/* File info */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                        <FileText className="h-4 w-4 text-white/50" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{resume.file_name}</p>
                        <p className="text-xs text-white/40">{new Date(resume.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Overall</p>
                      <ScorePill value={analysis?.overall_score} color="text-cyan-400" />
                    </div>
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">ATS</p>
                      <ScorePill value={analysis?.ats_score} color="text-emerald-400" />
                    </div>
                  </div>

                  {/* Confirm delete */}
                  {isPending ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-3">
                      <div className="flex items-center gap-2 mb-2.5">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                        <p className="text-xs text-amber-200">Delete this resume and its analysis?</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="flex-1 text-xs border border-white/10 hover:bg-white/8" onClick={cancelDelete}>Cancel</Button>
                        <Button size="sm" className="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white" onClick={() => void confirmDelete()} disabled={isDeleting}>
                          {isDeleting ? 'Deleting…' : 'Delete'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 gap-1.5 text-xs border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/8 hover:border-white/15"
                        onClick={() => router.push(`/resumes/${resume.id}`)}
                      >
                        View Details <ArrowRight className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs border border-red-500/20 text-red-400/70 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/30"
                        onClick={() => requestDelete(resume.id)}
                        disabled={isDeleting}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
