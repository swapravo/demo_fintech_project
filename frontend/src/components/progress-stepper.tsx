import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  description?: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function ProgressStepper({ steps, currentStep, className }: ProgressStepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-0">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                {/* Circle */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 shrink-0',
                    done && 'bg-[#22C55E] text-white shadow-sm',
                    active && 'bg-[#2563EB] text-white shadow-md ring-4 ring-blue-100',
                    !done && !active && 'bg-slate-100 text-slate-400 border border-slate-200'
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : <span>{i + 1}</span>}
                </div>
                {/* Label */}
                <span
                  className={cn(
                    'text-[10px] font-medium text-center leading-tight hidden sm:block max-w-[64px] truncate',
                    active && 'text-[#2563EB]',
                    done && 'text-[#22C55E]',
                    !done && !active && 'text-slate-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-5 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className={cn(
                      'h-full transition-all duration-500',
                      done ? 'bg-[#22C55E] w-full' : 'bg-transparent w-0'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
