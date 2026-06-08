'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { ProgressStepper } from '@/components/progress-stepper';
import { useAuth } from '@/lib/auth-context';

// Step components
import { IdentityStep } from './steps/identity-step';
import { EducationStep } from './steps/education-step';
import { OfferLetterStep } from './steps/offer-letter-step';
import { BankStatementStep } from './steps/bank-statement-step';
import { ReviewStep } from './steps/review-step';

const STEPS = [
  { label: 'Identity' },
  { label: 'Education' },
  { label: 'Employment' },
  { label: 'Banking' },
  { label: 'Review' },
];

export default function TenantOnboardingPage() {
  const router = useRouter();
  const { onboarding, updateOnboarding } = useAuth();

  // Resume from progress
  const [currentStep, setCurrentStep] = useState(() => {
    if (onboarding.bankStatementDone) return 4;
    if (onboarding.offerLetterDone) return 3;
    if (onboarding.educationDone) return 2;
    if (onboarding.identityDone) return 1;
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
    <IdentityStep key="identity" onNext={goNext} />,
    <EducationStep key="education" onNext={goNext} />,
    <OfferLetterStep key="offer-letter" onNext={goNext} />,
    <BankStatementStep key="bank-statement" onNext={goNext} />,
    <ReviewStep key="review" />,
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
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
              <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[#111827] hidden sm:block">RentShield</span>
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Tenant Profile
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8 gap-8">
        {/* Progress */}
        <ProgressStepper steps={STEPS} currentStep={currentStep} />

        {/* Step content */}
        <div className="flex-1">
          {stepComponents[currentStep]}
        </div>
      </main>
    </div>
  );
}
