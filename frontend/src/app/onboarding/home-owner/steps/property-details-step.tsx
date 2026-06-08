'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Home, CheckCircle2 } from 'lucide-react';

import { propertyDetailsSchema, PropertyDetailsFormInput, PropertyDetailsFormOutput } from '@/lib/schemas';
import { propertyApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { InlineError } from '@/components/error-state';
import { Spinner } from '@/components/loading-state';
import { cn } from '@/lib/utils';

interface Props { onNext: () => void; }

export function PropertyDetailsStep({ onNext }: Props) {
  const { onboarding, updateOnboarding } = useAuth();
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(onboarding.propertyDetailsDone);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyDetailsFormInput, unknown, PropertyDetailsFormOutput>({
    resolver: zodResolver(propertyDetailsSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: PropertyDetailsFormOutput) =>
      propertyApi.create({
        name: data.name,
        address: data.address,
        city: data.city,
        monthly_rent: data.monthly_rent,
        security_deposit: data.security_deposit,
      }),
    onSuccess: (res) => {
      setDone(true);
      updateOnboarding({ propertyDetailsDone: true, propertyId: res.data.id });
    },
    onError: (err: Error) => setApiError(err.message),
  });

  const onSubmit = (data: PropertyDetailsFormOutput) => {
    setApiError('');
    mutation.mutate(data);
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center py-8 gap-3">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
        </div>
        <p className="font-semibold text-[#111827]">Property Details Saved</p>
        <p className="text-sm text-slate-500">Your property has been created successfully.</p>
        <button
          id="property-details-continue-btn"
          onClick={onNext}
          className="mt-2 bg-[#22C55E] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-emerald-600 transition-colors"
        >
          Add Property Photos
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <Home className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Property Details</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Tell us about your property to get a risk assessment and insurance recommendation.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Property Name */}
        <div>
          <label htmlFor="prop-name" className="block text-sm font-medium text-slate-700 mb-1.5">Property Name</label>
          <input
            id="prop-name"
            type="text"
            placeholder="e.g. Sunshine Apartments – 3BHK"
            {...register('name')}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all',
              errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
            )}
          />
          <InlineError message={errors.name?.message} />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="prop-address" className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
          <input
            id="prop-address"
            type="text"
            placeholder="Flat 402, Sunrise Tower, HSR Layout"
            {...register('address')}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all',
              errors.address ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
            )}
          />
          <InlineError message={errors.address?.message} />
        </div>

        {/* City */}
        <div>
          <label htmlFor="prop-city" className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
          <input
            id="prop-city"
            type="text"
            placeholder="Bangalore"
            {...register('city')}
            className={cn(
              'w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all',
              errors.city ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
            )}
          />
          <InlineError message={errors.city?.message} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Monthly Rent */}
          <div>
            <label htmlFor="prop-rent" className="block text-sm font-medium text-slate-700 mb-1.5">
              Monthly Rent (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input
                id="prop-rent"
                type="number"
                placeholder="40000"
                {...register('monthly_rent')}
                className={cn(
                  'w-full pl-7 pr-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all',
                  errors.monthly_rent ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                )}
              />
            </div>
            <InlineError message={errors.monthly_rent?.message} />
          </div>

          {/* Security Deposit */}
          <div>
            <label htmlFor="prop-deposit" className="block text-sm font-medium text-slate-700 mb-1.5">
              Security Deposit (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
              <input
                id="prop-deposit"
                type="number"
                placeholder="240000"
                {...register('security_deposit')}
                className={cn(
                  'w-full pl-7 pr-3.5 py-2.5 rounded-xl border text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all',
                  errors.security_deposit ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                )}
              />
            </div>
            <InlineError message={errors.security_deposit?.message} />
          </div>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{apiError}</div>
        )}

        <button
          id="property-details-submit-btn"
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-[#22C55E] hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2"
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? 'Saving…' : 'Save Property Details'}
        </button>
      </form>
    </div>
  );
}
