import { apiClient } from './client';
import type { DemandPosting, DemandApplication, DemandMessage, PaginatedResponse } from '@/types/api';

export const matchingDemandApi = {
  create: (dto: any) => apiClient.post<DemandPosting>('/matching/demand', dto).then((r) => r.data),
  list: (params?: any) =>
    apiClient.get<PaginatedResponse<DemandPosting>>('/matching/demand', { params }).then((r) => r.data),
  detail: (id: string) => apiClient.get<DemandPosting>(`/matching/demand/${id}`).then((r) => r.data),
  update: (id: string, dto: any) =>
    apiClient.patch<DemandPosting>(`/matching/demand/${id}`, dto).then((r) => r.data),
  publish: (id: string) => apiClient.patch(`/matching/demand/${id}/publish`).then((r) => r.data),
  suspend: (id: string) => apiClient.patch(`/matching/demand/${id}/suspend`).then((r) => r.data),
  close: (id: string) => apiClient.patch(`/matching/demand/${id}/close`).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/matching/demand/${id}`),
  apply: (id: string, dto: any) =>
    apiClient.post<DemandApplication>(`/matching/demand/${id}/applications`, dto).then((r) => r.data),
  getApplications: (id: string) =>
    apiClient.get<DemandApplication[]>(`/matching/demand/${id}/applications`).then((r) => r.data),
  acceptApplication: (id: string, aid: string) =>
    apiClient.patch(`/matching/demand/${id}/applications/${aid}/accept`).then((r) => r.data),
  rejectApplication: (id: string, aid: string, reason?: string) =>
    apiClient.patch(`/matching/demand/${id}/applications/${aid}/reject`, { reason }).then((r) => r.data),
  getMessages: (id: string) =>
    apiClient.get<DemandMessage[]>(`/matching/demand/${id}/messages`).then((r) => r.data),
  sendMessage: (id: string, dto: any) =>
    apiClient.post<DemandMessage>(`/matching/demand/${id}/messages`, dto).then((r) => r.data),
};
