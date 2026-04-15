import Link from 'next/link'
import { Sparkles, CheckCircle2 } from 'lucide-react'

const FEATURES = [
  'ATS compatibility scoring',
  'AI-powered bullet rewrites',
  'Skill gap detection',
  'Job description matching',
]

interface AuthLayoutProps {
  title?: string
  children: React.ReactNode
}

export default function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left panel */}
        <section className="relative hidden lg:flex flex-col justify-between overflow-hidden border-r border-white/[0.06] p-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_20%,rgba(56,189,248,0.1),transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_80%,rgba(99,102,241,0.07),transparent)] pointer-events-none" />

          <div className="relative z-10">
            <Link href="/landing" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/30">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-white">ResumeAI</span>
            </Link>
          </div>

          <div className="relative z-10 space-y-6">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-white">
                Land your next role<br />with AI-powered insights
              </h1>
              {title && (
                <p className="mt-3 text-sm text-white/50 max-w-sm">{title}</p>
              )}
            </div>

            <div className="space-y-2.5">
              {FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-white/25">
            © {new Date().getFullYear()} ResumeAI
          </p>
        </section>

        {/* Right panel */}
        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm animate-fade-in">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <Link href="/landing" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-500/30">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <span className="text-sm font-semibold text-white">ResumeAI</span>
              </Link>
            </div>

            {children}

            <p className="mt-6 text-center text-xs text-white/25">
              By continuing you agree to our{' '}
              <Link href="#" className="text-white/40 hover:text-white/60 underline underline-offset-2">Terms</Link>
              {' '}and{' '}
              <Link href="#" className="text-white/40 hover:text-white/60 underline underline-offset-2">Privacy Policy</Link>.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
