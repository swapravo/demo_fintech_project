'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadedFile {
  file: File;
  progress: number;
  status: FileUploadStatus;
  error?: string;
}

interface FileUploaderProps {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  label?: string;
  description?: string;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  className?: string;
}

export function FileUploader({
  accept = 'application/pdf',
  maxSizeMb = 10,
  multiple = false,
  label = 'Upload File',
  description,
  files,
  onChange,
  className,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const maxBytes = maxSizeMb * 1024 * 1024;
      const uploads: UploadedFile[] = arr.map((f) => ({
        file: f,
        progress: 0,
        status: f.size > maxBytes ? 'error' : 'idle',
        error: f.size > maxBytes ? `File exceeds ${maxSizeMb}MB limit` : undefined,
      }));
      onChange(multiple ? [...files, ...uploads] : uploads);
    },
    [files, maxSizeMb, multiple, onChange]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200',
          dragging
            ? 'border-[#2563EB] bg-blue-50'
            : 'border-slate-200 bg-[#F9FAFB] hover:border-[#2563EB] hover:bg-blue-50/30'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 bg-blue-100 text-[#2563EB] rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{label}</p>
            {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
            <p className="text-xs text-slate-400 mt-1">
              Drag & drop or click to browse · Max {maxSizeMb}MB
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uf, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                uf.status === 'success' && 'border-green-200 bg-green-50',
                uf.status === 'error' && 'border-red-200 bg-red-50',
                (uf.status === 'idle' || uf.status === 'uploading') && 'border-slate-200 bg-white'
              )}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{uf.file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(uf.file.size)}</p>
                {uf.status === 'uploading' && (
                  <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                      style={{ width: `${uf.progress}%` }}
                    />
                  </div>
                )}
                {uf.status === 'error' && (
                  <p className="text-xs text-red-500 mt-0.5">{uf.error}</p>
                )}
              </div>
              {uf.status === 'success' && <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />}
              {uf.status === 'error' && <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />}
              {uf.status !== 'uploading' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="w-6 h-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
