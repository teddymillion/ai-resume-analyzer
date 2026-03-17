'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-red-600" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-3">
        Something went wrong
      </h2>

      <p className="text-lg text-slate-600 mb-8 max-w-md">
        {error}
      </p>

      <p className="text-sm text-slate-500 mb-8">
        Please check the file format and try again. Supported formats: PDF, DOCX
      </p>

      <Button
        onClick={onRetry}
        className="gap-2 bg-blue-600 hover:bg-blue-700"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}
