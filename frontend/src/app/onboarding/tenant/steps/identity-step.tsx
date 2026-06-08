'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

import { identitySchema, IdentityFormData } from '@/lib/schemas';
import { verifyApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { InlineError } from '@/components/error-state';
import { Spinner } from '@/components/loading-state';
import { cn } from '@/lib/utils';

interface Props { onNext: () => void; }

export function IdentityStep({ onNext }: Props) {
  const { onboarding, updateOnboarding } = useAuth();
  const [apiError, setApiError] = useState('');
  const [verified, setVerified] = useState(onboarding.identityDone);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IdentityFormData>({ resolver: zodResolver(identitySchema) });

  const mutation = useMutation({
    mutationFn: ({ pan_number, aadhaar_number }: IdentityFormData) =>
      verifyApi.identity(pan_number, aadhaar_number),
    onSuccess: () => {
      setVerified(true);
      updateOnboarding({ identityDone: true });
    },
    onError: (err: Error) => setApiError(err.message),
  });

  const onSubmit = (data: IdentityFormData) => {
    setApiError('');
    mutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 text-[#2563EB] rounded-xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Identity Verification</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            We verify your identity to ensure trust and safety on the platform.
          </p>
        </div>
      </div>

      {verified ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
          </div>
          <p className="font-semibold text-[#111827]">Identity Verified</p>
          <p className="text-sm text-slate-500">Your identity documents have been verified.</p>
          <button
            id="identity-continue-btn"
            onClick={onNext}
            className="mt-2 bg-[#2563EB] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-blue-700 transition-colors"
          >
            Continue to Education
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* PAN */}
          <div>
            <label htmlFor="pan-number" className="block text-sm font-medium text-slate-700 mb-1.5">
              PAN Number
            </label>
            <input
              id="pan-number"
              type="text"
              placeholder="ABCDE1234F"
              {...register('pan_number')}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] uppercase placeholder:normal-case placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all',
                errors.pan_number ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
              )}
            />
            <InlineError message={errors.pan_number?.message} />
          </div>

          {/* Aadhaar */}
          <div>
            <label htmlFor="aadhaar-number" className="block text-sm font-medium text-slate-700 mb-1.5">
              Aadhaar Number
            </label>
            <input
              id="aadhaar-number"
              type="text"
              inputMode="numeric"
              placeholder="12-digit Aadhaar number"
              maxLength={12}
              {...register('aadhaar_number')}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all',
                errors.aadhaar_number ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
              )}
            />
            <InlineError message={errors.aadhaar_number?.message} />
          </div>

          {/* Info callout */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-700 leading-relaxed">
            🔒 Your identity details are encrypted and securely stored. We never share them with third parties.
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <button
            id="identity-verify-btn"
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            {mutation.isPending && <Spinner size="sm" />}
            {mutation.isPending ? 'Verifying…' : 'Verify Identity'}
          </button>
        </form>
      )}
    </div>
  );
}
