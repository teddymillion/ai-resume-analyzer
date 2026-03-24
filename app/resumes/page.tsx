'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2 } from 'lucide-react'
import AuthGuard from '@/components/auth/auth-guard'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type ResumeRow = {
  id: string
  user_id: string
  file_name: string
  parsed_text: string | null
  file_path?: string | null
  created_at: string
}

type AnalysisRow = {
  id: string
  resume_id: string
  overall_score: number
  ats_score: number
  feedback: Record<string, unknown> | null
  created_at: string
}

export default function ResumesPage() {
  return (
    <AuthGuard>
      <ResumesContent />
    </AuthGuard>
  )
}

function ResumesContent() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resumes, setResumes] = useState<ResumeRow[]>([])
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      if (!user) return
      setLoading(true)
      setError(null)

      const { data: resumeRows, error: resumeError } = await supabase
        .from('resumes')
        .select('id, user_id, file_name, parsed_text, file_path, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!active) return

      if (resumeError) {
        setError(resumeError.message)
        setLoading(false)
        return
      }

      const resumeList = resumeRows ?? []
      setResumes(resumeList)

      if (resumeList.length === 0) {
        setAnalyses([])
        setLoading(false)
        return
      }

      const resumeIds = resumeList.map((resume) => resume.id)
      const { data: analysisRows, error: analysisError } = await supabase
        .from('analysis_results')
        .select('id, resume_id, overall_score, ats_score, feedback, created_at')
        .in('resume_id', resumeIds)

      if (!active) return

      if (analysisError) {
        setError(analysisError.message)
        setLoading(false)
        return
      }

      setAnalyses(analysisRows ?? [])
      setLoading(false)
    }

    loadData()

    return () => {
      active = false
    }
  }, [user])

  const analysisByResume = useMemo(() => {
    const map = new Map<string, AnalysisRow>()
    analyses.forEach((row) => {
      map.set(row.resume_id, row)
    })
    return map
  }, [analyses])

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Delete this resume and its analysis? This cannot be undone.')) {
      return
    }
    setDeletingId(resumeId)
    setError(null)
    try {
      // Remove analysis first (in case no FK cascade is configured)
      const { error: analysisError } = await supabase
        .from('analysis_results')
        .delete()
        .eq('resume_id', resumeId)

      if (analysisError) {
        throw new Error(analysisError.message)
      }

      const { error: resumeError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)

      if (resumeError) {
        throw new Error(resumeError.message)
      }

      setResumes((prev) => prev.filter((resume) => resume.id !== resumeId))
      setAnalyses((prev) => prev.filter((analysis) => analysis.resume_id !== resumeId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resume.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">My Resumes</h1>
            <p className="text-sm text-white/60 mt-2">
              Access your uploaded resumes and AI feedback in one place.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {user && <span className="text-sm text-white/70">{user.email}</span>}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => router.push('/')}
              >
                Back to Analyzer
              </Button>
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={async () => {
                  await signOut()
                  router.replace('/login')
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-10 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
            <span className="ml-3 text-sm text-white/60">Loading your resumes…</span>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && resumes.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <FileText className="mx-auto h-10 w-10 text-cyan-300/70" />
            <h2 className="mt-4 text-xl font-semibold">No resumes yet</h2>
            <p className="mt-2 text-sm text-white/60">
              Upload a resume to see analysis history here.
            </p>
            <Button
              className="mt-6 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              onClick={() => router.push('/')}
            >
              Upload Resume
            </Button>
          </div>
        )}

        {!loading && !error && resumes.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {resumes.map((resume) => {
              const analysis = analysisByResume.get(resume.id)
              return (
                <div
                  key={resume.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-white/60">File</p>
                      <h3 className="text-lg font-semibold text-white mt-1">
                        {resume.file_name}
                      </h3>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                      {new Date(resume.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="text-xs text-white/50">Overall</p>
                      <p className="text-2xl font-semibold text-cyan-300">
                        {analysis ? analysis.overall_score : '—'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <p className="text-xs text-white/50">ATS</p>
                      <p className="text-2xl font-semibold text-emerald-300">
                        {analysis ? analysis.ats_score : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 text-sm text-white/60">
                    {analysis?.feedback && typeof analysis.feedback === 'object'
                      ? 'Feedback saved with your analysis.'
                      : 'No analysis feedback saved.'}
                  </div>

                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                      onClick={() => router.push(`/resumes/${resume.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
