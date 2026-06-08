'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ClipboardCheck, CheckCircle2, Clock } from 'lucide-react';

import { tenantApi, TenantEvaluationResult } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EvaluationStatusCard } from '@/components/evaluation-status-card';
import { LoadingState } from '@/components/loading-state';
import { cn } from '@/lib/utils';

const CHECK_ITEMS = [
  { key: 'identityDone', label: 'Identity Verification' },
  { key: 'educationDone', label: 'Education' },
  { key: 'offerLetterDone', label: 'Offer Letter' },
  { key: 'bankStatementDone', label: 'Bank Statement' },
];

export function ReviewStep() {
  const { onboarding, updateOnboarding } = useAuth();
  const [result, setResult] = useState<TenantEvaluationResult | null>(
    onboarding.tenantEvaluationResult as TenantEvaluationResult | null
  );
  const [apiError, setApiError] = useState('');

  const allDone =
    onboarding.identityDone &&
    onboarding.educationDone &&
    onboarding.offerLetterDone &&
    onboarding.bankStatementDone;

  const mutation = useMutation({
    mutationFn: () => tenantApi.evaluate(),
    onSuccess: (res) => {
      setResult(res.data);
      updateOnboarding({ tenantEvaluationResult: res.data as unknown as Record<string, unknown> });
    },
    onError: (err: Error) => setApiError(err.message),
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Review &amp; Submit</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Review your submissions and evaluate your tenant profile.
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        {CHECK_ITEMS.map((item) => {
          const isDone = onboarding[item.key as keyof typeof onboarding] as boolean;
          return (
            <div
              key={item.key}
              className={cn(
                'flex items-center gap-3 p-3.5 rounded-xl border transition-colors',
                isDone ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              )}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              )}
              <span className={cn('text-sm font-medium', isDone ? 'text-green-800' : 'text-amber-800')}>
                {item.label}
              </span>
              <span className={cn('ml-auto text-xs font-medium', isDone ? 'text-green-600' : 'text-amber-600')}>
                {isDone ? 'Complete' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Result */}
      {mutation.isPending && (
        <LoadingState
          message="Evaluating your profile…"
          submessage="Our AI is analyzing your documents. This may take up to 30 seconds."
        />
      )}

      {result && !mutation.isPending && (
        <EvaluationStatusCard
          type="tenant"
          score={result.credibility_score}
          tier={result.tier}
          summary={result.summary}
        />
      )}

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{apiError}</div>
      )}

      {!result && !mutation.isPending && (
        <>
          {!allDone && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
              ⚠️ Please complete all steps above before evaluating your profile.
            </div>
          )}
          <button
            id="tenant-evaluate-btn"
            onClick={() => { setApiError(''); mutation.mutate(); }}
            disabled={!allDone || mutation.isPending}
            className="w-full bg-[#111827] hover:bg-slate-800 disabled:opacity-40 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            ✨ Evaluate My Profile
          </button>
        </>
      )}
    </div>
  );
}
