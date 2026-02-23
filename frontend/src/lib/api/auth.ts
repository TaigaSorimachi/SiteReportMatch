import { apiClient } from './client';
import type { AuthResponse, UserSummary } from '@/types/api';

export const authApi = {
  lineLogin: (liffAccessToken: string) =>
    apiClient.post<AuthResponse>('/auth/line/login', { liffAccessToken }).then((r) => r.data),
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }).then((r) => r.data),
  getMe: () => apiClient.get<UserSummary>('/auth/me').then((r) => r.data),
  devLogin: (identifier: string, role?: string) =>
    apiClient.post<AuthResponse>('/auth/dev/login', { identifier, role }).then((r) => r.data),
};
