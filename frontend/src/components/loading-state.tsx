import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export function LoadingState({ message = 'Processing...', submessage, className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 gap-4', className)}>
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-[#2563EB] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-[#2563EB] opacity-20 animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-[#111827]">{message}</p>
        {submessage && <p className="text-sm text-slate-500 mt-0.5">{submessage}</p>}
      </div>
    </div>
  );
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return <Loader2 className={cn('animate-spin text-current', sizes[size], className)} />;
}
