import { uuid } from './helpers';
import type { AuthResponse, UserSummary } from '@/types/api';

export const mockFrontendUser: UserSummary = {
  id: uuid(10),
  lastName: '山田',
  firstName: '太郎',
  role: 'owner',
  companyId: uuid(1),
  avatarUrl: null,
};

export const mockFrontendAuthResponse: AuthResponse = {
  accessToken: 'demo-frontend-token',
  refreshToken: 'demo-frontend-refresh-token',
  user: mockFrontendUser,
};
