import { apiClient } from './client';
import type { Invoice, Payroll, CostLedgerEntry, CostSummary, PaginatedResponse } from '@/types/api';

export const accountingApi = {
  createInvoice: (dto: any) => apiClient.post<Invoice>('/invoices', dto).then((r) => r.data),
  listInvoices: (params?: any) =>
    apiClient.get<PaginatedResponse<Invoice>>('/invoices', { params }).then((r) => r.data),
  getInvoice: (id: string) => apiClient.get<Invoice>(`/invoices/${id}`).then((r) => r.data),
  updateInvoice: (id: string, dto: any) =>
    apiClient.patch<Invoice>(`/invoices/${id}`, dto).then((r) => r.data),
  issueInvoice: (id: string) => apiClient.patch(`/invoices/${id}/issue`).then((r) => r.data),
  addPayment: (id: string, dto: any) =>
    apiClient.post(`/invoices/${id}/payments`, dto).then((r) => r.data),
  createPayroll: (dto: any) => apiClient.post<Payroll>('/payroll', dto).then((r) => r.data),
  listPayroll: (params?: any) =>
    apiClient.get<PaginatedResponse<Payroll>>('/payroll', { params }).then((r) => r.data),
  confirmPayroll: (id: string) => apiClient.patch(`/payroll/${id}/confirm`).then((r) => r.data),
  payPayroll: (id: string) => apiClient.patch(`/payroll/${id}/pay`).then((r) => r.data),
  listCostLedger: (params?: any) =>
    apiClient.get<PaginatedResponse<CostLedgerEntry>>('/cost-ledger', { params }).then((r) => r.data),
  getCostSummary: (projectId: string) =>
    apiClient.get<CostSummary>(`/cost-ledger/summary/${projectId}`).then((r) => r.data),
};
