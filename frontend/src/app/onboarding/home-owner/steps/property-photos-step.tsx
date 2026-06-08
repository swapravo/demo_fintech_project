'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ImageIcon, CheckCircle2 } from 'lucide-react';

import { propertyApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ImageUploader, ImageFile } from '@/components/image-uploader';
import { Spinner } from '@/components/loading-state';
import { cn } from '@/lib/utils';

interface Props { onNext: () => void; }

export function PropertyPhotosStep({ onNext }: Props) {
  const { onboarding, updateOnboarding } = useAuth();
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(onboarding.propertyPhotosDone);

  // Existing property toggle
  const [isExistingRental, setIsExistingRental] = useState(false);
  const [hasAfterPhotos, setHasAfterPhotos] = useState(false);

  const [beforePhotos, setBeforePhotos] = useState<ImageFile[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<ImageFile[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      const propertyId = onboarding.propertyId;
      if (!propertyId) throw new Error('Property not found. Please go back and save property details.');

      const fd = new FormData();
      beforePhotos.forEach((img) => fd.append('before_photos[]', img.file));
      if (hasAfterPhotos) {
        afterPhotos.forEach((img) => fd.append('after_photos[]', img.file));
      }
      return propertyApi.uploadPhotos(propertyId, fd);
    },
    onSuccess: () => {
      setDone(true);
      updateOnboarding({ propertyPhotosDone: true });
    },
    onError: (err: Error) => setApiError(err.message),
  });

  const canSubmit =
    beforePhotos.length >= 5 && (!isExistingRental || !hasAfterPhotos || afterPhotos.length >= 5);

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center py-8 gap-3">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
        </div>
        <p className="font-semibold text-[#111827]">Photos Uploaded</p>
        <p className="text-sm text-slate-500">Your property photos have been saved.</p>
        <button
          id="photos-continue-btn"
          onClick={onNext}
          className="mt-2 bg-[#22C55E] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-emerald-600 transition-colors"
        >
          Review &amp; Evaluate
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Property Photos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload at least 5 photos. Better photos lead to more accurate risk assessments.
          </p>
        </div>
      </div>

      {/* Existing rental toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <p className="text-sm font-medium text-[#111827]">Is this an existing rental property?</p>
          <p className="text-xs text-slate-500 mt-0.5">Enable if there are already tenants / prior usage</p>
        </div>
        <button
          id="existing-rental-toggle"
          onClick={() => setIsExistingRental(!isExistingRental)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-200',
            isExistingRental ? 'bg-[#22C55E]' : 'bg-slate-300'
          )}
          aria-checked={isExistingRental}
          role="switch"
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
              isExistingRental && 'translate-x-5'
            )}
          />
        </button>
      </div>

      {/* Before photos (always shown) */}
      <ImageUploader
        images={beforePhotos}
        onChange={setBeforePhotos}
        minCount={5}
        label={isExistingRental ? 'Before Usage Photos' : 'Property Photos'}
      />

      {/* After photos (existing rental only) */}
      {isExistingRental && (
        <>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-sm font-medium text-[#111827]">Do you have post-rental photos?</p>
              <p className="text-xs text-slate-500 mt-0.5">Upload after-usage photos to enable damage assessment</p>
            </div>
            <button
              id="after-photos-toggle"
              onClick={() => setHasAfterPhotos(!hasAfterPhotos)}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200',
                hasAfterPhotos ? 'bg-[#22C55E]' : 'bg-slate-300'
              )}
              aria-checked={hasAfterPhotos}
              role="switch"
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                  hasAfterPhotos && 'translate-x-5'
                )}
              />
            </button>
          </div>

          {hasAfterPhotos && (
            <ImageUploader
              images={afterPhotos}
              onChange={setAfterPhotos}
              minCount={5}
              label="After Usage Photos"
            />
          )}
        </>
      )}

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{apiError}</div>
      )}

      <button
        id="photos-submit-btn"
        onClick={() => { setApiError(''); mutation.mutate(); }}
        disabled={!canSubmit || mutation.isPending}
        className="w-full bg-[#22C55E] hover:bg-emerald-600 disabled:opacity-40 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending
          ? 'Uploading…'
          : !canSubmit
          ? `Add ${Math.max(0, 5 - beforePhotos.length)} more photo(s)`
          : 'Upload Photos'}
      </button>
    </div>
  );
}
