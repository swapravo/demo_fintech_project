'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Landmark, CheckCircle2 } from 'lucide-react';

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

export function BankStatementStep({ onNext }: Props) {
  const { onboarding, updateOnboarding } = useAuth();
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(onboarding.bankStatementDone);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('bank_statement', files[0].file);
      return tenantApi.submitBankStatement(fd);
    },
    onSuccess: () => {
      setDone(true);
      updateOnboarding({ bankStatementDone: true });
    },
    onError: (err: Error) => setApiError(err.message),
  });

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center py-8 gap-3">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
        </div>
        <p className="font-semibold text-[#111827]">Bank Statement Submitted</p>
        <p className="text-sm text-slate-500">Your banking document has been uploaded.</p>
        <button
          id="bank-statement-continue-btn"
          onClick={onNext}
          className="mt-2 bg-[#2563EB] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-blue-700 transition-colors"
        >
          Review &amp; Evaluate
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Bank Statement</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload your bank statement (last 3–6 months) to demonstrate financial stability.
          </p>
        </div>
      </div>

      <FileUploader
        accept="application/pdf"
        maxSizeMb={10}
        multiple={false}
        label="Upload Bank Statement"
        description="PDF only · Encrypted and stored securely"
        files={files}
        onChange={setFiles}
      />

      {/* Evaluation criteria */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">What we evaluate</p>
        {[
          'Account age and transaction history',
          'Monthly transaction frequency',
          'Average balance and total transaction volume',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
            {item}
          </div>
        ))}
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{apiError}</div>
      )}

      <button
        id="bank-statement-submit-btn"
        onClick={() => { setApiError(''); mutation.mutate(); }}
        disabled={files.length === 0 || mutation.isPending}
        className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending ? 'Uploading…' : 'Submit Bank Statement'}
      </button>
    </div>
  );
}
