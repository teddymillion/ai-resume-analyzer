'use client';

import { useState } from 'react';
import { parseResume, ParsedResume } from '@/lib/resume-parser';
import { analyzeResume, matchJobDescription, AnalysisResult, KeywordMatchResult } from '@/lib/analysis-engine';
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
      // Simulate file reading and parsing
      const text = await readFileAsText(file);

      // Parse resume
      const parsed = parseResume(text);

      // Analyze resume
      const analysis = analyzeResume(parsed);

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
        error: 'Failed to process file. Please try again.',
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-[1440px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            AI Resume Analyzer
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Get intelligent feedback on your resume with ATS optimization, job matching, and smart suggestions.
          </p>
        </div>

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

        {/* Upload Area - Always visible when not in success state */}
        {state.stage !== 'success' && state.stage !== 'loading' && (
          <ResumeUpload onFileSelect={handleFileUpload} loading={state.loading} />
        )}
      </div>
    </main>
  );
}

/**
 * Read file as text (simulating PDF/DOCX parsing)
 */
async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        resolve('');
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
