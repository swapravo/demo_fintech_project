import React from 'react';
import { CheckCircle2, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvaluationStatusCardProps {
  type: 'tenant' | 'property';
  score?: number;
  tier?: string;
  summary?: string;
  insuranceRecommendation?: string;
  suggestedPremium?: number;
  riskTier?: string;
  className?: string;
}

function getTierColor(tier: string) {
  const t = tier?.toLowerCase();
  if (t?.includes('1') || t?.includes('excellent') || t?.includes('low')) return 'emerald';
  if (t?.includes('2') || t?.includes('good') || t?.includes('medium')) return 'amber';
  return 'red';
}

export function EvaluationStatusCard({
  type,
  score,
  tier,
  summary,
  insuranceRecommendation,
  suggestedPremium,
  riskTier,
  className,
}: EvaluationStatusCardProps) {
  const displayTier = type === 'tenant' ? tier : riskTier;
  const color = displayTier ? getTierColor(displayTier) : 'blue';

  const bgColors: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200',
    amber: 'bg-amber-50 border-amber-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  const textColors: Record<string, string> = {
    emerald: 'text-emerald-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
  };

  return (
    <div className={cn('rounded-2xl border-2 p-6 space-y-5', bgColors[color], className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', `bg-${color}-100`)}>
          <CheckCircle2 className={cn('w-5 h-5', textColors[color])} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">
            {type === 'tenant' ? 'Tenant Evaluation' : 'Property Evaluation'}
          </p>
          <p className={cn('font-bold text-lg', textColors[color])}>Complete</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Score */}
        {score !== undefined && (
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-500 font-medium">Score</p>
            </div>
            <p className={cn('text-3xl font-bold', textColors[color])}>{score}</p>
            <p className="text-xs text-slate-400">/ 100</p>
          </div>
        )}

        {/* Tier */}
        {displayTier && (
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-500 font-medium">
                {type === 'tenant' ? 'Tier' : 'Risk Tier'}
              </p>
            </div>
            <p className={cn('text-xl font-bold', textColors[color])}>{displayTier}</p>
          </div>
        )}
      </div>

      {/* Summary / Insurance */}
      {summary && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Summary</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}
      {insuranceRecommendation && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">Insurance Recommendation</p>
          <p className="text-sm text-slate-700">{insuranceRecommendation}</p>
          {suggestedPremium && (
            <p className={cn('text-lg font-bold mt-2', textColors[color])}>
              ₹{suggestedPremium.toLocaleString('en-IN')}/month
            </p>
          )}
        </div>
      )}
    </div>
  );
}
