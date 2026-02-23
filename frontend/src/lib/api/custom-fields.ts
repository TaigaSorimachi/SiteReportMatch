import { apiClient } from './client';
import type { CustomFieldDef, CustomFieldVal } from '@/types/api';

export const customFieldsApi = {
  getDefs: (companyId: string, targetType?: string) =>
    apiClient.get<CustomFieldDef[]>('/custom-fields/defs', {
      params: { companyId, ...(targetType ? { targetType } : {}) },
    }).then((r) => r.data),
  createDef: (companyId: string, dto: any) =>
    apiClient.post<CustomFieldDef>('/custom-fields/defs', dto, { params: { companyId } }).then((r) => r.data),
  updateDef: (id: string, dto: any) =>
    apiClient.patch<CustomFieldDef>(`/custom-fields/defs/${id}`, dto).then((r) => r.data),
  removeDef: (id: string) => apiClient.delete(`/custom-fields/defs/${id}`),
  updateSortOrder: (items: { id: string; sortOrder: number }[]) =>
    apiClient.put('/custom-fields/defs/sort', { items }).then((r) => r.data),
  getVals: (targetType: string, targetId: string) =>
    apiClient.get<CustomFieldVal[]>(`/custom-fields/vals/${targetType}/${targetId}`).then((r) => r.data),
  saveVals: (targetType: string, targetId: string, companyId: string, values: Record<string, any>) =>
    apiClient.put(`/custom-fields/vals/${targetType}/${targetId}`, { values }, { params: { companyId } }).then((r) => r.data),
};
