import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center py-10 gap-4 text-center', className)}>
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-[#EF4444]" />
      </div>
      <div>
        <p className="font-semibold text-[#111827]">{title}</p>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm font-medium text-[#2563EB] hover:text-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}

interface InlineErrorProps {
  message?: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  if (!message) return null;
  return (
    <p className={cn('text-xs text-[#EF4444] flex items-center gap-1 mt-1', className)}>
      <AlertCircle className="w-3 h-3 shrink-0" />
      {message}
    </p>
  );
}
