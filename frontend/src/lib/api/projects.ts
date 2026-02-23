import { apiClient } from './client';
import type {
  Project, ProjectPhase, ProjectStaffing, ProjectAssignment,
  ProjectDocument, PaginatedResponse,
} from '@/types/api';

export const projectsApi = {
  create: (dto: any) => apiClient.post<Project>('/projects', dto).then((r) => r.data),
  list: (params?: any) => apiClient.get<PaginatedResponse<Project>>('/projects', { params }).then((r) => r.data),
  detail: (id: string) => apiClient.get<Project>(`/projects/${id}`).then((r) => r.data),
  update: (id: string, dto: any) => apiClient.patch<Project>(`/projects/${id}`, dto).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/projects/${id}`),
  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/projects/${id}/status`, { status }).then((r) => r.data),
  getPhases: (id: string) => apiClient.get<ProjectPhase[]>(`/projects/${id}/phases`).then((r) => r.data),
  addPhase: (id: string, dto: any) =>
    apiClient.post<ProjectPhase>(`/projects/${id}/phases`, dto).then((r) => r.data),
  updatePhase: (id: string, pid: string, dto: any) =>
    apiClient.patch<ProjectPhase>(`/projects/${id}/phases/${pid}`, dto).then((r) => r.data),
  getStaffing: (id: string, params?: any) =>
    apiClient.get<ProjectStaffing[]>(`/projects/${id}/staffing`, { params }).then((r) => r.data),
  updateStaffing: (id: string, dto: any) =>
    apiClient.put(`/projects/${id}/staffing`, dto).then((r) => r.data),
  getStaffingSummary: (id: string) =>
    apiClient.get(`/projects/${id}/staffing/summary`).then((r) => r.data),
  getAssignments: (id: string, params?: any) =>
    apiClient.get<ProjectAssignment[]>(`/projects/${id}/assignments`, { params }).then((r) => r.data),
  addAssignment: (id: string, dto: any) =>
    apiClient.post<ProjectAssignment>(`/projects/${id}/assignments`, dto).then((r) => r.data),
  updateAssignment: (id: string, aid: string, dto: any) =>
    apiClient.patch<ProjectAssignment>(`/projects/${id}/assignments/${aid}`, dto).then((r) => r.data),
  removeAssignment: (id: string, aid: string) =>
    apiClient.delete(`/projects/${id}/assignments/${aid}`),
  uploadDocument: (id: string, dto: any) =>
    apiClient.post<ProjectDocument>(`/projects/${id}/documents`, dto).then((r) => r.data),
  getDocuments: (id: string) =>
    apiClient.get<ProjectDocument[]>(`/projects/${id}/documents`).then((r) => r.data),
};
