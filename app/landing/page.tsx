'use client'

import Link from 'next/link'
import {
  Sparkles, ArrowRight, CheckCircle2, Zap, Target, Brain,
  FileText, TrendingUp, Shield, Star, ChevronRight, BarChart3,
  Layers, Award
} from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: BarChart3,
    title: 'ATS Score Analysis',
    desc: 'Know exactly how applicant tracking systems read your resume — before a recruiter ever sees it.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/20',
  },
  {
    icon: Brain,
    title: 'AI Bullet Rewrites',
    desc: 'Gemini rewrites weak bullet points into powerful, quantified achievements that get callbacks.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/20',
  },
  {
    icon: Target,
    title: 'Job Match %',
    desc: 'Paste any job description and instantly see how well your resume aligns — keyword by keyword.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
  },
  {
    icon: Layers,
    title: 'Skill Gap Detection',
    desc: 'Uncover the exact skills you\'re missing for your target role and know what to learn next.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
  },
  {
    icon: FileText,
    title: 'Formatting Quality',
    desc: 'Catch invisible formatting issues that silently disqualify your resume from consideration.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Instant Feedback',
    desc: 'Get a full analysis in under 10 seconds. No waiting, no forms, no career coaches needed.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
  },
]

const STEPS = [
  { num: '01', title: 'Upload your resume', desc: 'Drop your PDF or DOCX. We parse it instantly.' },
  { num: '02', title: 'AI analyzes everything', desc: 'Gemini scans for ATS issues, skills, formatting, and impact.' },
  { num: '03', title: 'Get your action plan', desc: 'Receive a prioritized list of fixes that move the needle.' },
]

const TESTIMONIALS = [
  {
    quote: 'I went from zero callbacks to 3 interviews in a week after fixing what ResumeAI flagged.',
    name: 'Marcus T.',
    role: 'Software Engineer',
    score: '94',
  },
  {
    quote: 'The ATS score feature alone is worth it. I had no idea my resume was being filtered out.',
    name: 'Priya S.',
    role: 'Product Manager',
    score: '88',
  },
  {
    quote: 'The AI rewrites turned my boring bullet points into something I\'m actually proud of.',
    name: 'Jordan K.',
    role: 'Data Analyst',
    score: '91',
  },
]

const STATS = [
  { value: '10s', label: 'Average analysis time' },
  { value: '3×', label: 'More interview callbacks' },
  { value: '50+', label: 'Data points analyzed' },
  { value: '98%', label: 'User satisfaction' },
]

// ─── Sub-components ────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/landing" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 ring-1 ring-cyan-500/30">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight">ResumeAI</span>
          <span className="hidden rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-cyan-400 ring-1 ring-cyan-500/20 sm:inline">
            Beta
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500 px-4 py-1.5 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition-colors"
          >
            Get started free
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

function HeroScore() {
  return (
    <div className="relative mx-auto mt-16 max-w-sm">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 blur-2xl" />
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/50">Analysis complete</span>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20">
            +24 pts
          </span>
        </div>

        {/* Score ring */}
        <div className="mb-5 flex justify-center">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="url(#scoreGrad)" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${0.87 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">87</div>
              <div className="text-[10px] text-white/40">/ 100</div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-2.5">
          {[
            { label: 'ATS Score', val: 91, color: 'bg-cyan-400' },
            { label: 'Job Match', val: 84, color: 'bg-violet-400' },
            { label: 'Formatting', val: 78, color: 'bg-emerald-400' },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-white/50">{label}</span>
                <span className="text-white/80">{val}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${val}%`, opacity: 0.85 }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Issues */}
        <div className="mt-4 rounded-xl bg-white/[0.03] p-3">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-white/30">Top fixes</p>
          {['Add quantified achievements', 'Include missing keywords', 'Fix section ordering'].map((fix) => (
            <div key={fix} className="flex items-center gap-2 py-1">
              <ChevronRight className="h-3 w-3 text-cyan-400 shrink-0" />
              <span className="text-xs text-white/60">{fix}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar />

      {/* ── Ambient BG ──────────────────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.13),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_90%,rgba(99,102,241,0.09),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_60%,rgba(16,185,129,0.06),transparent)]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <main className="relative z-10">

        {/* ── HERO ────────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pt-32 pb-24 sm:px-6 lg:pt-40">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left */}
            <div className="animate-fade-in-up text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Powered by Google Gemini AI
                <span className="ml-1 rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] text-cyan-400">New</span>
              </div>

              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Your resume is{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                    costing you
                  </span>
                </span>
                {' '}the job.
              </h1>

              <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/55 lg:mx-0">
                Most resumes never reach a human. ResumeAI shows you exactly why — and fixes it in seconds with the power of Gemini.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/signup"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-400 transition-all sm:w-auto"
                >
                  Analyze my resume — it&apos;s free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/70 hover:bg-white/8 hover:text-white transition-all sm:w-auto"
                >
                  Sign in
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
                {['No credit card', 'Results in 10 seconds', 'PDF & DOCX support'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-white/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mock score card */}
            <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <HeroScore />
            </div>
          </div>
        </section>

        {/* ── STATS ───────────────────────────────────────────────────────────── */}
        <section className="border-y border-white/[0.06] bg-white/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-3xl font-bold text-white sm:text-4xl">{value}</div>
                  <div className="mt-1 text-sm text-white/40">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROBLEM ─────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-3 py-1 text-xs text-rose-400">
              <Zap className="h-3 w-3" />
              The hard truth
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              75% of resumes are rejected before a human reads them
            </h2>
            <p className="mt-4 text-base text-white/50 leading-relaxed">
              ATS systems filter out qualified candidates every day. Formatting errors, missing keywords, and weak bullet points are invisible to you — but not to the algorithm.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Shield, title: 'ATS filters block you', desc: 'Your resume never reaches a recruiter if it fails the automated scan.', color: 'text-rose-400', bg: 'bg-rose-500/8' },
              { icon: FileText, title: 'Weak bullets get ignored', desc: 'Generic descriptions don\'t stand out. Quantified impact does.', color: 'text-amber-400', bg: 'bg-amber-500/8' },
              { icon: Target, title: 'Wrong keywords cost you', desc: 'Every job description has specific terms. Missing them = instant rejection.', color: 'text-violet-400', bg: 'bg-violet-500/8' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────────────── */}
        <section className="border-t border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="mx-auto mb-14 max-w-xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-400">
                <Sparkles className="h-3 w-3" />
                Everything you need
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                One upload. Complete picture.
              </h2>
              <p className="mt-3 text-white/50">
                ResumeAI gives you the same insights a $300/hr career coach would — instantly.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, desc, color, bg, ring }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} ring-1 ${ring}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="mb-2 font-semibold text-white">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs text-violet-400">
              <Award className="h-3 w-3" />
              Simple process
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From upload to offer in 3 steps
            </h2>
          </div>

          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connector line */}
            <div className="absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent sm:block" />

            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="relative text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl font-bold text-white/20">
                  {num}
                </div>
                <h3 className="mb-2 font-semibold text-white">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
        <section className="border-t border-white/[0.06] bg-white/[0.015]">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <div className="mx-auto mb-14 max-w-xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                Real results
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                People are getting hired
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {TESTIMONIALS.map(({ quote, name, role, score }) => (
                <div key={name} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-white/70">&ldquo;{quote}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{name}</div>
                      <div className="text-xs text-white/40">{role}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold text-cyan-400">{score}</div>
                      <div className="text-[10px] text-white/30">ATS score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center sm:p-16">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(56,189,248,0.12),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(99,102,241,0.1),transparent)]" />
            </div>

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-400">
                <Sparkles className="h-3 w-3" />
                Free to start
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Stop guessing.{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Start landing interviews.
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-white/50">
                Upload your resume right now and get a full AI-powered analysis in under 10 seconds. No credit card. No fluff.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-400 transition-all"
                >
                  Analyze my resume — free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
              <p className="mt-4 text-xs text-white/30">
                PDF & DOCX · Results in 10 seconds · Powered by Gemini
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/15 ring-1 ring-cyan-500/30">
                <Sparkles className="h-3 w-3 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-white/70">ResumeAI</span>
            </div>
            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} ResumeAI · Built with Gemini · All rights reserved
            </p>
            <div className="flex items-center gap-4 text-xs text-white/30">
              <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
              <Link href="/signup" className="hover:text-white/60 transition-colors">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
