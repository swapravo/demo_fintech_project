'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { GraduationCap, CheckCircle2 } from 'lucide-react';

import { educationSchema, EducationFormData } from '@/lib/schemas';
import { tenantApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { FileUploader } from '@/components/file-uploader';
import { InlineError } from '@/components/error-state';
import { Spinner } from '@/components/loading-state';
import { cn } from '@/lib/utils';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface Props { onNext: () => void; }

export function EducationStep({ onNext }: Props) {
  const { onboarding, updateOnboarding } = useAuth();
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(onboarding.educationDone);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EducationFormData>({ resolver: zodResolver(educationSchema) });

  const mutation = useMutation({
    mutationFn: (data: EducationFormData) => {
      const fd = new FormData();
      fd.append('city', data.city);
      fd.append('college', data.college);
      documents.forEach((d) => fd.append('documents[]', d.file));
      return tenantApi.submitEducation(fd);
    },
    onSuccess: () => {
      setDone(true);
      updateOnboarding({ educationDone: true });
    },
    onError: (err: Error) => setApiError(err.message),
  });

  const onSubmit = (data: EducationFormData) => {
    setApiError('');
    mutation.mutate(data);
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center py-8 gap-3">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
        </div>
        <p className="font-semibold text-[#111827]">Education Submitted</p>
        <p className="text-sm text-slate-500">Your education details have been recorded.</p>
        <button
          id="education-continue-btn"
          onClick={onNext}
          className="mt-2 bg-[#2563EB] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-blue-700 transition-colors"
        >
          Continue to Employment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Education</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Tell us about your educational background to boost your credibility score.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* City */}
          <div>
            <label htmlFor="edu-city" className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
            <input
              id="edu-city"
              type="text"
              placeholder="Bangalore"
              {...register('city')}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all',
                errors.city ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
              )}
            />
            <InlineError message={errors.city?.message} />
          </div>

          {/* College */}
          <div>
            <label htmlFor="edu-college" className="block text-sm font-medium text-slate-700 mb-1.5">College Name</label>
            <input
              id="edu-college"
              type="text"
              placeholder="IIT Bombay"
              {...register('college')}
              className={cn(
                'w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all',
                errors.college ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
              )}
            />
            <InlineError message={errors.college?.message} />
          </div>
        </div>

        {/* Document upload (optional) */}
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">
            Documents <span className="text-slate-400 font-normal">(optional)</span>
          </p>
          <FileUploader
            accept="application/pdf,image/*"
            maxSizeMb={10}
            multiple
            label="Upload College ID or Degree Certificate"
            description="PDF, JPG, PNG accepted"
            files={documents}
            onChange={setDocuments}
          />
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{apiError}</div>
        )}

        <button
          id="education-submit-btn"
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? 'Submitting…' : 'Submit Education'}
        </button>
      </form>
    </div>
  );
}
