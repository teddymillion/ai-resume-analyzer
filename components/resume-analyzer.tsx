'use client';

import { useState } from 'react';
import { ParsedResume } from '@/lib/resume-parser';
import { matchJobDescription, AnalysisResult } from '@/lib/analysis-engine';
import { ResumeAnalyzerState } from '@/lib/types';
import ResumeUpload from './resume-upload';
import ResumePreview from './resume-preview';
import AnalysisPanel from './analysis-panel';
import SummaryBar from './summary-bar';
import EmptyState from './empty-state';
import ErrorState from './error-state';

export default function ResumeAnalyzer() {
  const [state, setState] = useState<ResumeAnalyzerState>({
    resumeFile: null,
    parsedResume: null,
    analysis: null,
    jobDescription: '',
    jobMatchResult: null,
    loading: false,
    error: null,
    stage: 'empty',
  });

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setState({
        ...state,
        error: 'Invalid file type. Please upload a PDF or DOCX file.',
        stage: 'error',
      });
      return;
    }

    setState({ ...state, loading: true, stage: 'loading', error: null });

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data.details && typeof data.details === 'string'
            ? `${data.error || 'Failed to analyze resume'} (${data.details})`
            : data.error || 'Failed to analyze resume';
        throw new Error(message);
      }

      const data = await response.json();
      const parsed = data.parsedResume as ParsedResume;
      const analysis = data.analysis as AnalysisResult;

      setState({
        ...state,
        resumeFile: file,
        parsedResume: parsed,
        analysis,
        loading: false,
        stage: 'success',
        error: null,
      });
    } catch (err) {
      setState({
        ...state,
        error:
          err instanceof Error ? err.message : 'Failed to process file. Please try again.',
        stage: 'error',
        loading: false,
      });
    }
  };

  // Handle job description change and matching
  const handleJobDescriptionChange = (jobDescription: string) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        jobDescription,
      };

      if (jobDescription.trim() && prevState.parsedResume) {
        const matchResult = matchJobDescription(prevState.parsedResume, jobDescription);
        newState.jobMatchResult = matchResult;
      } else {
        newState.jobMatchResult = null;
      }

      return newState;
    });
  };

  // Handle retry
  const handleRetry = () => {
    setState({
      resumeFile: null,
      parsedResume: null,
      analysis: null,
      jobDescription: '',
      jobMatchResult: null,
      loading: false,
      error: null,
      stage: 'empty',
    });
  };

  const neuralPattern =
    "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='none'/%3E%3Cg stroke='%2365d8ff' stroke-width='1.2' opacity='0.35'%3E%3Cline x1='80' y1='120' x2='240' y2='80'/%3E%3Cline x1='80' y1='120' x2='220' y2='180'/%3E%3Cline x1='240' y1='80' x2='420' y2='120'/%3E%3Cline x1='220' y1='180' x2='420' y2='120'/%3E%3Cline x1='420' y1='120' x2='600' y2='90'/%3E%3Cline x1='420' y1='120' x2='600' y2='180'/%3E%3Cline x1='600' y1='90' x2='780' y2='140'/%3E%3Cline x1='600' y1='180' x2='780' y2='140'/%3E%3Cline x1='220' y1='180' x2='260' y2='320'/%3E%3Cline x1='260' y1='320' x2='420' y2='260'/%3E%3Cline x1='420' y1='260' x2='620' y2='320'/%3E%3Cline x1='620' y1='320' x2='780' y2='240'/%3E%3C/g%3E%3Cg fill='%23b9f2ff' opacity='0.55'%3E%3Ccircle cx='80' cy='120' r='6'/%3E%3Ccircle cx='240' cy='80' r='7'/%3E%3Ccircle cx='220' cy='180' r='7'/%3E%3Ccircle cx='420' cy='120' r='8'/%3E%3Ccircle cx='600' cy='90' r='7'/%3E%3Ccircle cx='600' cy='180' r='7'/%3E%3Ccircle cx='780' cy='140' r='8'/%3E%3Ccircle cx='260' cy='320' r='6'/%3E%3Ccircle cx='420' cy='260' r='7'/%3E%3Ccircle cx='620' cy='320' r='7'/%3E%3Ccircle cx='780' cy='240' r='6'/%3E%3C/g%3E%3C/svg%3E\")";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.25),transparent_45%),radial-gradient(circle_at_20%_60%,rgba(34,197,94,0.18),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(14,116,144,0.4),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: neuralPattern,
            backgroundSize: '900px 600px',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/75 to-slate-950" />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-[1440px]">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">
            Gemini-powered Career Intel
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mt-2">
            AI Resume Analyzer
          </h1>
          <p className="text-lg text-white/70 mt-3 max-w-2xl">
            Get ATS-focused insights, skill gaps, and rewrite-ready suggestions in one smart scan.
          </p>
        </div>

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
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  ATS Readiness
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  Skill Gaps
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  Bullet Rewrites
                </div>
              </div>
              <div className="mt-6">
                <ResumeUpload onFileSelect={handleFileUpload} loading={state.loading} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-br from-cyan-400/20 via-blue-500/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-950/60 p-6">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>AI Resume Analyzer</span>
                  <span className="rounded-full border border-white/10 px-2 py-0.5">Live</span>
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/80">
                  <div className="h-2 w-3/4 rounded-full bg-white/10" />
                  <div className="h-2 w-2/3 rounded-full bg-white/10" />
                  <div className="h-2 w-5/6 rounded-full bg-white/10" />
                  <div className="h-2 w-1/2 rounded-full bg-white/10" />
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

        {/* Summary Bar - Show only when analysis is available */}
        {state.stage === 'success' && state.analysis && (
          <SummaryBar
            overallScore={state.analysis.overallScore}
            atsScore={state.analysis.atsScore}
            matchScore={state.jobMatchResult?.matchScore ?? null}
          />
        )}

        {/* Main Content */}
        {state.stage === 'empty' && <EmptyState />}

        {state.stage === 'error' && (
          <ErrorState error={state.error || 'An error occurred'} onRetry={handleRetry} />
        )}

        {state.stage === 'loading' && (
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="w-8 h-8 border-3 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-lg font-semibold text-slate-900">Analyzing your resume…</p>
              <p className="text-sm text-slate-600 mt-2">This may take a moment</p>
            </div>
          </div>
        )}

        {state.stage === 'success' && state.parsedResume && state.analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left Panel - Resume Preview */}
            <div className="lg:col-span-1">
              <ResumePreview resume={state.parsedResume} />
            </div>

            {/* Right Panel - Analysis */}
            <div className="lg:col-span-2">
              <AnalysisPanel
                analysis={state.analysis}
                jobMatchResult={state.jobMatchResult}
                onJobDescriptionChange={handleJobDescriptionChange}
                resumeSections={state.parsedResume.sections}
              />
            </div>
          </div>
        )}

        {/* Upload Area - Visible for non-empty, non-success states */}
        {state.stage !== 'success' && state.stage !== 'loading' && state.stage !== 'empty' && (
          <ResumeUpload onFileSelect={handleFileUpload} loading={state.loading} />
        )}
        </div>
      </div>
    </main>
  );
}

// Gemini handles PDF/DOCX parsing on the server.
