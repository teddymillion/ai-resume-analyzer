import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface AuthLayoutProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_20%_60%,rgba(34,197,94,0.18),transparent_45%),radial-gradient(circle_at_90%_30%,rgba(14,116,144,0.5),transparent_45%)]" />
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%)]" />
          <div className="relative z-10 flex flex-col gap-10 p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
              <Sparkles className="h-3 w-3" />
              AI Resume Analyzer
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight">
                AI Resume Analyzer
              </h1>
              <p className="text-lg text-white/70 max-w-md">
                Get intelligent insights and improve your resume with AI.
              </p>
              {title && (
                <p className="text-sm text-white/60 max-w-md">
                  {title}
                </p>
              )}
              {subtitle && (
                <p className="text-sm text-white/60 max-w-md">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-white/50 mb-4">
                Trusted Workflow
              </p>
              <ul className="space-y-3 text-sm text-white/80">
                <li>Instant ATS scoring with smart insights</li>
                <li>AI bullet rewrites in one click</li>
                <li>Skill gap detection for faster hiring</li>
              </ul>
            </div>
          </div>
          <div className="relative z-10 p-10 text-xs text-white/50">
            © {new Date().getFullYear()} AI Resume Analyzer
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-fade-in">
            {children}
            <p className="mt-8 text-center text-xs text-white/40">
              Your data is secure and private.
            </p>
            <p className="mt-2 text-center text-xs text-white/40">
              By continuing you agree to our{' '}
              <Link href="#" className="text-cyan-300 hover:text-cyan-200">
                Terms
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-cyan-300 hover:text-cyan-200">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
