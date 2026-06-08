'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { ProgressStepper } from '@/components/progress-stepper';
import { useAuth } from '@/lib/auth-context';

import { PropertyDetailsStep } from './steps/property-details-step';
import { PropertyPhotosStep } from './steps/property-photos-step';
import { PropertyReviewStep } from './steps/property-review-step';

const STEPS = [
  { label: 'Property Details' },
  { label: 'Photos' },
  { label: 'Review' },
];

export default function HomeOwnerOnboardingPage() {
  const router = useRouter();
  const { onboarding, updateOnboarding } = useAuth();

  const [currentStep, setCurrentStep] = useState(() => {
    if (onboarding.propertyPhotosDone) return 2;
    if (onboarding.propertyDetailsDone) return 1;
    return 0;
  });

  const goNext = () => {
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    updateOnboarding({ currentStep: currentStep + 1 });
  };

  const goBack = () => {
    if (currentStep === 0) { router.push('/onboarding/role'); return; }
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const stepComponents = [
    <PropertyDetailsStep key="details" onNext={goNext} />,
    <PropertyPhotosStep key="photos" onNext={goNext} />,
    <PropertyReviewStep key="review" />,
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              aria-label="Go back"
              className="w-8 h-8 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#22C55E] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#111827] hidden sm:block">RentShield</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Home Owner Profile
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8 gap-8">
        <ProgressStepper steps={STEPS} currentStep={currentStep} />
        <div className="flex-1">
          {stepComponents[currentStep]}
        </div>
      </main>
    </div>
  );
}
