export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

export interface UserSummary {
  id: string;
  lastName: string;
  firstName: string;
  role: string;
  companyId: string | null;
  avatarUrl: string | null;
}

export interface Company {
  id: string;
  companyName: string;
  companyNameKana?: string;
  companyType: string;
  corporateNumber?: string;
  representative?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string | null;
  lineUserId?: string;
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;
  email?: string;
  phone?: string;
  role: string;
  availability?: string;
  employmentStatus?: string;
  avatarUrl?: string;
  isIndividual?: boolean;
  defaultDailyRate?: number;
  company?: { id: string; companyName: string; companyType: string } | null;
  createdAt: string;
}

export interface Project {
  id: string;
  companyId: string;
  projectCode?: string;
  projectName: string;
  description?: string;
  status: string;
  siteName?: string;
  sitePrefecture?: string;
  siteCity?: string;
  siteAddress?: string;
  siteLat?: number;
  siteLng?: number;
  geofenceRadiusM?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  contractAmount?: number;
  estimatedCost?: number;
  company?: { id: string; companyName: string; companyType: string } | null;
  createdAt: string;
}
