import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { companies } from './companies';
import { users } from './users';
import { projects } from './projects';
import { reports } from './reports';
import { mockAdminAuthResponse, mockAdminUser } from './auth';
import { paginate, findById } from './helpers';

type MockRoute = {
  method: string;
  pattern: RegExp;
  handler: (match: RegExpMatchArray, config: InternalAxiosRequestConfig) => unknown;
};

function parseParams(config: InternalAxiosRequestConfig) {
  const params = config.params || {};
  return {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    ...params,
  };
}

function parseBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  if (!config.data) return {};
  if (typeof config.data === 'string') {
    try { return JSON.parse(config.data); } catch { return {}; }
  }
  return config.data;
}

const routes: MockRoute[] = [
  // ── Auth ──
  { method: 'POST', pattern: /^\/auth\/admin\/login$/, handler: () => mockAdminAuthResponse },
  { method: 'POST', pattern: /^\/auth\/refresh$/, handler: () => mockAdminAuthResponse },
  { method: 'GET', pattern: /^\/auth\/me$/, handler: () => mockAdminUser },

  // ── Companies ──
  { method: 'GET', pattern: /^\/companies$/, handler: (_m, config) => {
    const p = parseParams(config);
    return paginate(companies, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/companies\/([^/]+)$/, handler: (m) => findById(companies, m[1]) },
  { method: 'POST', pattern: /^\/companies$/, handler: (_m, config) => ({
    id: 'demo-new-' + Date.now(),
    ...parseBody(config),
    isActive: true,
    createdAt: new Date().toISOString(),
  })},
  { method: 'PATCH', pattern: /^\/companies\/([^/]+)$/, handler: (m, config) => ({
    ...findById(companies, m[1]),
    ...parseBody(config),
  })},
  { method: 'DELETE', pattern: /^\/companies\/([^/]+)$/, handler: () => ({ success: true }) },

  // ── Users ──
  { method: 'GET', pattern: /^\/users$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = users;
    if (p.keyword) {
      const kw = String(p.keyword).toLowerCase();
      filtered = filtered.filter(u =>
        `${u.lastName}${u.firstName}`.toLowerCase().includes(kw) ||
        (u.email && u.email.toLowerCase().includes(kw))
      );
    }
    if (p.companyId) {
      filtered = filtered.filter(u => u.companyId === p.companyId);
    }
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/users\/([^/]+)$/, handler: (m) => findById(users, m[1]) },
  { method: 'POST', pattern: /^\/users$/, handler: (_m, config) => ({
    id: 'demo-new-' + Date.now(),
    ...parseBody(config),
    createdAt: new Date().toISOString(),
  })},
  { method: 'PATCH', pattern: /^\/users\/([^/]+)$/, handler: (m, config) => ({
    ...findById(users, m[1]),
    ...parseBody(config),
  })},
  { method: 'DELETE', pattern: /^\/users\/([^/]+)$/, handler: () => ({ success: true }) },

  // ── Projects ──
  { method: 'GET', pattern: /^\/projects$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = projects;
    if (p.status) {
      filtered = filtered.filter(pr => pr.status === p.status);
    }
    if (p.companyId) {
      filtered = filtered.filter(pr => pr.companyId === p.companyId);
    }
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/projects\/([^/]+)$/, handler: (m) => findById(projects, m[1]) },
  { method: 'POST', pattern: /^\/projects$/, handler: (_m, config) => ({
    id: 'demo-new-' + Date.now(),
    ...parseBody(config),
    status: 'planning',
    createdAt: new Date().toISOString(),
  })},
  { method: 'PATCH', pattern: /^\/projects\/([^/]+)$/, handler: (m, config) => ({
    ...findById(projects, m[1]),
    ...parseBody(config),
  })},
  { method: 'DELETE', pattern: /^\/projects\/([^/]+)$/, handler: () => ({ success: true }) },

  // ── Reports ──
  { method: 'GET', pattern: /^\/reports$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = reports;
    if (p.status) {
      filtered = filtered.filter(r => r.status === p.status);
    }
    if (p.projectId) {
      filtered = filtered.filter(r => r.projectId === p.projectId);
    }
    if (p.dateFrom) {
      filtered = filtered.filter(r => r.reportDate >= p.dateFrom);
    }
    if (p.dateTo) {
      filtered = filtered.filter(r => r.reportDate <= p.dateTo);
    }
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/reports\/([^/]+)$/, handler: (m) => findById(reports, m[1]) },
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)\/approve$/, handler: (m) => {
    const report = findById(reports, m[1]);
    return report ? { ...report, status: 'approved', approvedAt: new Date().toISOString() } : null;
  }},
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)\/reject$/, handler: (m, config) => {
    const report = findById(reports, m[1]);
    const body = parseBody(config);
    return report ? { ...report, status: 'rejected', rejectionReason: body.reason || '' } : null;
  }},
];

export function handleMockRequest(config: InternalAxiosRequestConfig): AxiosResponse | null {
  const method = (config.method || 'GET').toUpperCase();
  const url = config.url || '';

  for (const route of routes) {
    if (route.method !== method) continue;
    const match = url.match(route.pattern);
    if (match) {
      const data = route.handler(match, config);
      return {
        data,
        status: method === 'DELETE' ? 204 : 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse;
    }
  }

  // Fallback: return empty paginated response for unmatched GET
  console.warn(`[DemoMode] Unhandled route: ${method} ${url}`);
  return {
    data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  } as AxiosResponse;
}
