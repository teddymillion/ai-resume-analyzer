'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export default function ResumeUpload({ onFileSelect, loading = false }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50'
        }`}
      >
        <input
          type="file"
          id="resume-input"
          accept=".pdf,.docx"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={loading}
        />

        <label
          htmlFor="resume-input"
          className="flex flex-col items-center gap-4 cursor-pointer"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>

          <div>
            <p className="text-lg font-semibold text-slate-900 mb-1">
              {selectedFile ? selectedFile.name : 'Drop your resume here'}
            </p>
            <p className="text-sm text-slate-600">
              or click to browse from your computer
            </p>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            PDF or DOCX • Max 10MB
          </p>
        </label>

        {selectedFile && !loading && (
          <Button
            onClick={() => {
              const input = document.getElementById('resume-input') as HTMLInputElement;
              if (input) {
                input.click();
              }
            }}
            variant="outline"
            className="mt-6"
          >
            Choose Different File
          </Button>
        )}
      </div>
    </div>
  );
}
