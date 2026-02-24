import { uuid } from './helpers';
import type { AuthResponse, UserSummary } from '@/types/api';

export const mockAdminUser: UserSummary = {
  id: uuid(9),
  lastName: '管理者',
  firstName: '運営',
  role: 'admin',
  companyId: null,
  avatarUrl: null,
};

export const mockAdminAuthResponse: AuthResponse = {
  accessToken: 'demo-admin-token',
  refreshToken: 'demo-admin-refresh-token',
  user: mockAdminUser,
};
