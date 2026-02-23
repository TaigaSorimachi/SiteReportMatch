import { apiClient } from './client';
import type { SupplyPosting, SupplyInquiry, SupplyMessage, PaginatedResponse } from '@/types/api';

export const matchingSupplyApi = {
  create: (dto: any) => apiClient.post<SupplyPosting>('/matching/supply', dto).then((r) => r.data),
  list: (params?: any) =>
    apiClient.get<PaginatedResponse<SupplyPosting>>('/matching/supply', { params }).then((r) => r.data),
  detail: (id: string) => apiClient.get<SupplyPosting>(`/matching/supply/${id}`).then((r) => r.data),
  update: (id: string, dto: any) =>
    apiClient.patch<SupplyPosting>(`/matching/supply/${id}`, dto).then((r) => r.data),
  publish: (id: string) => apiClient.patch(`/matching/supply/${id}/publish`).then((r) => r.data),
  close: (id: string) => apiClient.patch(`/matching/supply/${id}/close`).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/matching/supply/${id}`),
  inquire: (id: string, dto: any) =>
    apiClient.post<SupplyInquiry>(`/matching/supply/${id}/inquiries`, dto).then((r) => r.data),
  getInquiries: (id: string) =>
    apiClient.get<SupplyInquiry[]>(`/matching/supply/${id}/inquiries`).then((r) => r.data),
  acceptInquiry: (id: string, iid: string) =>
    apiClient.patch(`/matching/supply/${id}/inquiries/${iid}/accept`).then((r) => r.data),
  rejectInquiry: (id: string, iid: string) =>
    apiClient.patch(`/matching/supply/${id}/inquiries/${iid}/reject`).then((r) => r.data),
  getMessages: (id: string) =>
    apiClient.get<SupplyMessage[]>(`/matching/supply/${id}/messages`).then((r) => r.data),
  sendMessage: (id: string, dto: any) =>
    apiClient.post<SupplyMessage>(`/matching/supply/${id}/messages`, dto).then((r) => r.data),
};
