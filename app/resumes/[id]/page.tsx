'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

export default function ResumeDetailPage() {
  return (
    <AuthGuard>
      <ResumeDetailContent />
    </AuthGuard>
  )
}

function ResumeDetailContent() {
  const router = useRouter()
  const params = useParams()
  const resumeId = Array.isArray(params?.id) ? params?.id[0] : params?.id
  const { user, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resume, setResume] = useState<ResumeRow | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      if (!user || !resumeId) return
      setLoading(true)
      setError(null)

      const { data: resumeRow, error: resumeError } = await supabase
        .from('resumes')
        .select('id, user_id, file_name, parsed_text, file_path, created_at')
        .eq('id', resumeId)
        .eq('user_id', user.id)
        .single()

      if (!active) return

      if (resumeError) {
        setError(resumeError.message)
        setLoading(false)
        return
      }

      setResume(resumeRow)

      if (resumeRow?.file_path) {
        const { data: signed, error: signedError } = await supabase.storage
          .from('resumes')
          .createSignedUrl(resumeRow.file_path, 60 * 10)
        if (!signedError) {
          setDownloadUrl(signed?.signedUrl ?? null)
        }
      }

      const { data: analysisRow, error: analysisError } = await supabase
        .from('analysis_results')
        .select('id, resume_id, overall_score, ats_score, feedback, created_at')
        .eq('resume_id', resumeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!active) return

      if (analysisError) {
        setError(analysisError.message)
        setLoading(false)
        return
      }

      setAnalysis(analysisRow ?? null)
      setLoading(false)
    }

    loadData()

    return () => {
      active = false
    }
  }, [user, resumeId])

  const feedbackEntries = useMemo(() => {
    if (!analysis?.feedback || typeof analysis.feedback !== 'object') return []
    return Object.entries(analysis.feedback).map(([key, value]) => ({
      key,
      value,
    }))
  }, [analysis])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Resume Details</h1>
            <p className="text-sm text-white/60 mt-2">
              Deep dive into your resume analysis.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {user && <span className="text-sm text-white/70">{user.email}</span>}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                onClick={() => router.push('/resumes')}
              >
                Back to Resumes
              </Button>
              <Button
                variant="outline"
                className="border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                onClick={async () => {
                  if (!resumeId) return
                  if (!confirm('Delete this resume and its analysis? This cannot be undone.')) {
                    return
                  }
                  setDeleting(true)
                  setError(null)
                  try {
                    const { error: analysisError } = await supabase
                      .from('analysis_results')
                      .delete()
                      .eq('resume_id', resumeId)
                    if (analysisError) throw new Error(analysisError.message)

                    const { error: resumeError } = await supabase
                      .from('resumes')
                      .delete()
                      .eq('id', resumeId)
                    if (resumeError) throw new Error(resumeError.message)

                    router.replace('/resumes')
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to delete resume.')
                  } finally {
                    setDeleting(false)
                  }
                }}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
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
            <span className="ml-3 text-sm text-white/60">Loading resume…</span>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && resume && (
          <div className="mt-10 space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/60">File</p>
                  <h2 className="text-xl font-semibold text-white mt-1">
                    {resume.file_name}
                  </h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                  {new Date(resume.created_at).toLocaleString()}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-white/60">
                <FileText className="h-4 w-4" />
                Parsed text length: {resume.parsed_text?.length ?? 0} characters
              </div>
              {downloadUrl && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                    onClick={() => window.open(downloadUrl, '_blank')}
                  >
                    Download Original File
                  </Button>
                </div>
              )}
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl">
                <p className="text-sm text-white/60">Overall Score</p>
                <p className="mt-2 text-4xl font-semibold text-cyan-300">
                  {analysis ? analysis.overall_score : '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-xl">
                <p className="text-sm text-white/60">ATS Score</p>
                <p className="mt-2 text-4xl font-semibold text-emerald-300">
                  {analysis ? analysis.ats_score : '—'}
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <h3 className="text-lg font-semibold">AI Feedback</h3>
              {feedbackEntries.length === 0 ? (
                <p className="mt-3 text-sm text-white/60">
                  No feedback details saved for this resume.
                </p>
              ) : (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {feedbackEntries.map((entry) => (
                    <div
                      key={entry.key}
                      className="rounded-xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {entry.key}
                      </p>
                      {Array.isArray(entry.value) ? (
                        <ul className="mt-3 space-y-2 text-sm text-white/80">
                          {entry.value.map((item, idx) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-cyan-300">•</span>
                              <span>{String(item)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3 text-sm text-white/80">{String(entry.value)}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <h3 className="text-lg font-semibold">Parsed Resume Text</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm text-white/70">
                {resume.parsed_text || 'No parsed text available.'}
              </p>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
