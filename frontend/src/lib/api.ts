import axios, { AxiosInstance, AxiosError } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Inject auth token on every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global error normalizer
apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ detail?: string | { msg: string }[] }>) => {
    const detail = error.response?.data?.detail;
    let message = 'An unexpected error occurred.';
    if (typeof detail === 'string') message = detail;
    else if (Array.isArray(detail)) message = detail.map((d) => d.msg).join(', ');
    else if (error.message) message = error.message;
    return Promise.reject(new Error(message));
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; token_type: string }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    apiClient.post<{ access_token: string; token_type: string }>('/auth/register', { name, email, password }),
};

// ─── User ──────────────────────────────────────────────────────────────────

export const userApi = {
  setRole: (role: 'tenant' | 'home_owner') =>
    apiClient.post('/users/role', { role }),
};

// ─── Verification ──────────────────────────────────────────────────────────

export const verifyApi = {
  identity: (pan_number: string, aadhaar_number: string) =>
    apiClient.post<{ status: string; message: string }>('/verify/identity', { pan_number, aadhaar_number }),
};

// ─── Tenant Evaluations ────────────────────────────────────────────────────

export const tenantApi = {
  submitEducation: (formData: FormData) =>
    apiClient.post('/evaluations/education', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitOfferLetter: (formData: FormData) =>
    apiClient.post('/evaluations/offer-letter', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitBankStatement: (formData: FormData) =>
    apiClient.post('/evaluations/bank-statement', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  evaluate: () =>
    apiClient.post<TenantEvaluationResult>('/evaluations/tenant'),
};

// ─── Home Owner / Property ─────────────────────────────────────────────────

export const propertyApi = {
  create: (data: PropertyPayload) =>
    apiClient.post<{ id: string; name: string }>('/properties', data),
  uploadPhotos: (propertyId: string, formData: FormData) =>
    apiClient.post(`/properties/${propertyId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  evaluate: (propertyId: string) =>
    apiClient.post<PropertyEvaluationResult>('/evaluations/property', { property_id: propertyId }),
};

// ─── Types ─────────────────────────────────────────────────────────────────

export interface PropertyPayload {
  name: string;
  address: string;
  city: string;
  monthly_rent: number;
  security_deposit: number;
}

export interface TenantEvaluationResult {
  credibility_score: number;
  tier: string;
  summary: string;
}

export interface PropertyEvaluationResult {
  risk_tier: string;
  insurance_recommendation: string;
  suggested_premium: number;
}
