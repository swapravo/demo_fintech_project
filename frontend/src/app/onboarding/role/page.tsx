'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Home, User, ArrowRight, ShieldCheck } from 'lucide-react';

import { userApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/loading-state';
import { cn } from '@/lib/utils';

type Role = 'tenant' | 'home_owner';

const roles = [
  {
    id: 'tenant' as Role,
    label: 'Tenant',
    icon: User,
    description: "I'm looking to rent a property and want to build credibility with landlords.",
    benefits: ['Skip large deposits', 'Get a credibility score', 'Move in faster'],
    accent: '#2563EB',
    bg: 'bg-blue-50',
    border: 'border-blue-200 ring-blue-500/20',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'home_owner' as Role,
    label: 'Home Owner',
    icon: Home,
    description: 'I own a property and want to evaluate tenants and protect my investment.',
    benefits: ['AI tenant screening', 'Property risk tier', 'Damage protection'],
    accent: '#22C55E',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200 ring-emerald-500/20',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const { setRole, isAuthenticated } = useAuth();
  const [selected, setSelected] = useState<Role | null>(null);
  const [apiError, setApiError] = useState('');

  const mutation = useMutation({
    mutationFn: (role: Role) => userApi.setRole(role),
    onSuccess: (_, role) => {
      setRole(role);
      if (role === 'tenant') router.push('/onboarding/tenant');
      else router.push('/onboarding/home-owner');
    },
    onError: (err: Error) => setApiError(err.message),
  });

  const handleContinue = () => {
    if (!selected) return;
    // If not authenticated (dev mode), skip API
    if (!isAuthenticated) {
      setRole(selected);
      if (selected === 'tenant') router.push('/onboarding/tenant');
      else router.push('/onboarding/home-owner');
      return;
    }
    mutation.mutate(selected);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2563EB] rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#111827]">RentShield</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">Who are you?</h1>
            <p className="text-slate-500">
              Choose your role so we can tailor the experience for you.
            </p>
          </div>

          {/* Role cards */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selected === role.id;
              return (
                <button
                  key={role.id}
                  id={`role-${role.id}`}
                  onClick={() => setSelected(role.id)}
                  className={cn(
                    'text-left p-6 rounded-2xl border-2 bg-white shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer group',
                    isSelected
                      ? `${role.border} ring-2 shadow-lg ${role.bg}`
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                      isSelected ? role.iconBg : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-[#111827] mb-2">{role.label}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">{role.description}</p>
                  <ul className="space-y-1.5">
                    {role.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${role.accent}20` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: role.accent }} />
                        </div>
                        {b}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* API error */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">
              {apiError}
            </div>
          )}

          {/* Continue */}
          <button
            id="role-continue-btn"
            onClick={handleContinue}
            disabled={!selected || mutation.isPending}
            className="w-full bg-[#111827] hover:bg-slate-800 disabled:opacity-40 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
          >
            {mutation.isPending ? (
              <>
                <Spinner size="sm" />
                Saving…
              </>
            ) : (
              <>
                Continue as {selected ? roles.find((r) => r.id === selected)?.label : '…'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
