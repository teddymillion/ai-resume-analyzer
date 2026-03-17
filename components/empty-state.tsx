'use client';

import { Upload } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
        <Upload className="w-12 h-12 text-blue-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-3">
        Ready to optimize your resume?
      </h2>

      <p className="text-lg text-slate-600 mb-8 max-w-md">
        Upload your resume to get intelligent feedback on formatting, ATS compatibility, and smart suggestions.
      </p>

      <ul className="space-y-3 text-left max-w-md mb-8">
        <li className="flex items-center gap-3 text-slate-700">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            ✓
          </div>
          <span>Get your overall resume score</span>
        </li>
        <li className="flex items-center gap-3 text-slate-700">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            ✓
          </div>
          <span>Check ATS compatibility</span>
        </li>
        <li className="flex items-center gap-3 text-slate-700">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            ✓
          </div>
          <span>Match your resume to job descriptions</span>
        </li>
        <li className="flex items-center gap-3 text-slate-700">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            ✓
          </div>
          <span>Get AI-powered suggestions</span>
        </li>
      </ul>

      <p className="text-sm text-slate-500">
        Supported formats: PDF, DOCX
      </p>
    </div>
  );
}
