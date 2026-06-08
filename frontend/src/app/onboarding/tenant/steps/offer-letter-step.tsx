'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Briefcase, CheckCircle2 } from 'lucide-react';

import { tenantApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FileUploader } from '@/components/file-uploader';
import { Spinner } from '@/components/loading-state';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface Props { onNext: () => void; }

export function OfferLetterStep({ onNext }: Props) {
  const { onboarding, updateOnboarding } = useAuth();
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(onboarding.offerLetterDone);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('offer_letter', files[0].file);
      return tenantApi.submitOfferLetter(fd);
    },
    onSuccess: () => {
      setDone(true);
      updateOnboarding({ offerLetterDone: true });
    },
    onError: (err: Error) => setApiError(err.message),
  });

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center py-8 gap-3">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
        </div>
        <p className="font-semibold text-[#111827]">Offer Letter Submitted</p>
        <p className="text-sm text-slate-500">Your employment document has been uploaded.</p>
        <button
          id="offer-letter-continue-btn"
          onClick={onNext}
          className="mt-2 bg-[#2563EB] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-blue-700 transition-colors"
        >
          Continue to Banking
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Employment Verification</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload your offer letter to verify your employment status and salary.
          </p>
        </div>
      </div>

      <FileUploader
        accept="application/pdf"
        maxSizeMb={10}
        multiple={false}
        label="Upload Offer Letter"
        description="PDF only · Your letter is encrypted and stored securely"
        files={files}
        onChange={setFiles}
      />

      {/* Tier preview */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { tier: 'Tier 1', example: 'Google, Amazon', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
          { tier: 'Tier 2', example: 'Mid-size firms', color: 'text-amber-600 bg-amber-50 border-amber-200' },
          { tier: 'Tier 3', example: 'Startups', color: 'text-slate-600 bg-slate-50 border-slate-200' },
        ].map((t) => (
          <div key={t.tier} className={`rounded-xl border p-2 text-xs ${t.color}`}>
            <p className="font-semibold">{t.tier}</p>
            <p className="opacity-70 mt-0.5">{t.example}</p>
          </div>
        ))}
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{apiError}</div>
      )}

      <button
        id="offer-letter-submit-btn"
        onClick={() => { setApiError(''); mutation.mutate(); }}
        disabled={files.length === 0 || mutation.isPending}
        className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending ? 'Uploading…' : 'Submit Offer Letter'}
      </button>
    </div>
  );
}
