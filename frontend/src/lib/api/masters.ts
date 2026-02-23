import { apiClient } from './client';
import type { WorkType, StructureMaster, LicenseMaster, AccountMaster } from '@/types/api';

export const mastersApi = {
  getWorkTypes: () => apiClient.get<WorkType[]>('/masters/work-types').then((r) => r.data),
  getStructures: () => apiClient.get<StructureMaster[]>('/masters/structures').then((r) => r.data),
  getLicenses: () => apiClient.get<LicenseMaster[]>('/masters/licenses').then((r) => r.data),
  getAccounts: () => apiClient.get<AccountMaster[]>('/masters/accounts').then((r) => r.data),
};
