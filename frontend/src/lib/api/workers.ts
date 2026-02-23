import { apiClient } from './client';
import type {
  WorkerProfile, WorkerSkill, WorkerLicense, WorkerEvaluation,
  WorkerAvailability, PaginatedResponse,
} from '@/types/api';

export const workersApi = {
  findAvailable: (params?: any) =>
    apiClient.get<PaginatedResponse<any>>('/workers/available', { params }).then((r) => r.data),
  getProfile: (id: string) =>
    apiClient.get<WorkerProfile>(`/workers/${id}/profile`).then((r) => r.data),
  updateProfile: (id: string, dto: any) =>
    apiClient.patch<WorkerProfile>(`/workers/${id}/profile`, dto).then((r) => r.data),
  getSkills: (id: string) =>
    apiClient.get<WorkerSkill[]>(`/workers/${id}/skills`).then((r) => r.data),
  updateSkills: (id: string, dto: any) =>
    apiClient.put(`/workers/${id}/skills`, dto).then((r) => r.data),
  getLicenses: (id: string) =>
    apiClient.get<WorkerLicense[]>(`/workers/${id}/licenses`).then((r) => r.data),
  addLicense: (id: string, dto: any) =>
    apiClient.post<WorkerLicense>(`/workers/${id}/licenses`, dto).then((r) => r.data),
  updateLicense: (id: string, lid: string, dto: any) =>
    apiClient.patch<WorkerLicense>(`/workers/${id}/licenses/${lid}`, dto).then((r) => r.data),
  removeLicense: (id: string, lid: string) =>
    apiClient.delete(`/workers/${id}/licenses/${lid}`),
  getEvaluations: (id: string) =>
    apiClient.get<WorkerEvaluation[]>(`/workers/${id}/evaluations`).then((r) => r.data),
  addEvaluation: (id: string, dto: any) =>
    apiClient.post<WorkerEvaluation>(`/workers/${id}/evaluations`, dto).then((r) => r.data),
  getCalendar: (id: string, params?: any) =>
    apiClient.get<WorkerAvailability[]>(`/workers/${id}/calendar`, { params }).then((r) => r.data),
  updateCalendar: (id: string, dto: any) =>
    apiClient.put(`/workers/${id}/calendar`, dto).then((r) => r.data),
};
