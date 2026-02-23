import { apiClient } from './client';
import type { AuthResponse, UserSummary } from '@/types/api';

export const authApi = {
  adminLogin: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/admin/login', { email, password }).then((r) => r.data),
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),
  getMe: () => apiClient.get<UserSummary>('/auth/me').then((r) => r.data),
};
