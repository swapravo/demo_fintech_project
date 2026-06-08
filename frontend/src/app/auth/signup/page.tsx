'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { AuthLayout } from '@/components/auth-layout';
import { InlineError } from '@/components/error-state';
import { Spinner } from '@/components/loading-state';
import { signUpSchema, SignUpFormData } from '@/lib/schemas';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { setToken } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({ resolver: zodResolver(signUpSchema) });

  const mutation = useMutation({
    mutationFn: ({ name, email, password }: SignUpFormData) =>
      authApi.register(name, email, password),
    onSuccess: (res) => {
      setToken(res.data.access_token);
      router.push('/onboarding/role');
    },
    onError: (err: Error) => setApiError(err.message),
  });

  const onSubmit = (data: SignUpFormData) => {
    setApiError('');
    mutation.mutate(data);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join RentShield and transform your rental experience"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 mb-1.5">
            Full name
          </label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Priya Sharma"
            {...register('name')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
          />
          <InlineError message={errors.name?.message} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1.5">
            Email address
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register('email')}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
          />
          <InlineError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              {...register('password')}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <InlineError message={errors.password?.message} />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="signup-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat password"
              {...register('confirmPassword')}
              className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-[#111827] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label="Toggle confirm password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <InlineError message={errors.confirmPassword?.message} />
        </div>

        {/* API Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        {/* Submit */}
        <button
          id="signup-submit-btn"
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md mt-1"
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-[#2563EB] font-medium hover:text-blue-700 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
