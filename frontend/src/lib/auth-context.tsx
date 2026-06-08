'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type UserRole = 'tenant' | 'home_owner' | null;

export interface OnboardingState {
  // Tenant steps
  identityDone: boolean;
  educationDone: boolean;
  offerLetterDone: boolean;
  bankStatementDone: boolean;
  tenantEvaluationResult: Record<string, unknown> | null;
  // Home owner steps
  propertyId: string | null;
  propertyDetailsDone: boolean;
  propertyPhotosDone: boolean;
  propertyEvaluationResult: Record<string, unknown> | null;
  // Shared
  currentStep: number;
}

interface AuthContextValue {
  token: string | null;
  role: UserRole;
  onboarding: OnboardingState;
  setToken: (t: string) => void;
  setRole: (r: UserRole) => void;
  updateOnboarding: (patch: Partial<OnboardingState>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEFAULT_ONBOARDING: OnboardingState = {
  identityDone: false,
  educationDone: false,
  offerLetterDone: false,
  bankStatementDone: false,
  tenantEvaluationResult: null,
  propertyId: null,
  propertyDetailsDone: false,
  propertyPhotosDone: false,
  propertyEvaluationResult: null,
  currentStep: 0,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState>(DEFAULT_ONBOARDING);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    const r = localStorage.getItem('auth_role') as UserRole;
    const ob = localStorage.getItem('onboarding_state');
    if (t) setTokenState(t);
    if (r) setRoleState(r);
    if (ob) {
      try { setOnboarding(JSON.parse(ob)); } catch { /* ignore */ }
    }
    setHydrated(true);
  }, []);

  const setToken = useCallback((t: string) => {
    localStorage.setItem('auth_token', t);
    setTokenState(t);
  }, []);

  const setRole = useCallback((r: UserRole) => {
    if (r) localStorage.setItem('auth_role', r);
    else localStorage.removeItem('auth_role');
    setRoleState(r);
  }, []);

  const updateOnboarding = useCallback((patch: Partial<OnboardingState>) => {
    setOnboarding((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem('onboarding_state', JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_role');
    localStorage.removeItem('onboarding_state');
    setTokenState(null);
    setRoleState(null);
    setOnboarding(DEFAULT_ONBOARDING);
  }, []);

  if (!hydrated) return null;

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        onboarding,
        setToken,
        setRole,
        updateOnboarding,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
