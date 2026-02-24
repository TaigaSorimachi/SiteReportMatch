import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { companies, companySettings } from './companies';
import { users } from './users';
import { projects, projectPhases, projectStaffing, projectAssignments } from './projects';
import { reports } from './reports';
import { demandPostings, demandApplications, demandMessages } from './matching-demand';
import { supplyPostings, supplyInquiries, supplyMessages } from './matching-supply';
import { matchContracts, dashboardResponse, kpiResponse } from './matching-contracts';
import { workerProfiles, workerSkills, workerLicenses, workerEvaluations, availableWorkers, getWorkerAvailability } from './workers';
import { invoices, payrolls, costLedgerEntries, getCostSummary } from './accounting';
import { notifications } from './notifications';
import { workTypes, licenseMasters } from './masters';
import { mockFrontendAuthResponse, mockFrontendUser } from './auth';
import { paginate, findById } from './helpers';

type MockRoute = {
  method: string;
  pattern: RegExp;
  handler: (match: RegExpMatchArray, config: InternalAxiosRequestConfig) => unknown;
};

function parseParams(config: InternalAxiosRequestConfig) {
  const params = config.params || {};
  return { page: Number(params.page) || 1, limit: Number(params.limit) || 20, ...params };
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
  { method: 'POST', pattern: /^\/auth\/line\/login$/, handler: () => mockFrontendAuthResponse },
  { method: 'POST', pattern: /^\/auth\/dev\/login$/, handler: () => mockFrontendAuthResponse },
  { method: 'POST', pattern: /^\/auth\/refresh$/, handler: () => mockFrontendAuthResponse },
  { method: 'GET', pattern: /^\/auth\/me$/, handler: () => mockFrontendUser },

  // ── Masters ──
  { method: 'GET', pattern: /^\/masters\/work-types$/, handler: () => workTypes },
  { method: 'GET', pattern: /^\/masters\/structures$/, handler: () => [
    { id: '00000000-0000-0000-0000-000000000200', structureName: 'RC造' },
    { id: '00000000-0000-0000-0000-000000000201', structureName: 'S造' },
    { id: '00000000-0000-0000-0000-000000000202', structureName: 'SRC造' },
    { id: '00000000-0000-0000-0000-000000000203', structureName: '木造' },
    { id: '00000000-0000-0000-0000-000000000204', structureName: 'その他' },
  ]},
  { method: 'GET', pattern: /^\/masters\/licenses$/, handler: () => licenseMasters },
  { method: 'GET', pattern: /^\/masters\/accounts$/, handler: () => [
    { id: '1', accountCode: '4100', accountName: '完成工事高', category: 'revenue' },
    { id: '2', accountCode: '5100', accountName: '材料費', category: 'cost' },
    { id: '3', accountCode: '5200', accountName: '労務費', category: 'cost' },
    { id: '4', accountCode: '5300', accountName: '外注費', category: 'cost' },
    { id: '5', accountCode: '5400', accountName: '経費', category: 'cost' },
  ]},

  // ── Companies ──
  { method: 'GET', pattern: /^\/companies$/, handler: (_m, config) => paginate(companies, parseParams(config).page, parseParams(config).limit) },
  { method: 'GET', pattern: /^\/companies\/([^/]+)$/, handler: (m) => findById(companies, m[1]) },
  { method: 'GET', pattern: /^\/companies\/([^/]+)\/settings$/, handler: () => companySettings },
  { method: 'PATCH', pattern: /^\/companies\/([^/]+)\/settings$/, handler: (_m, config) => ({ ...companySettings, ...parseBody(config) }) },

  // ── Users ──
  { method: 'GET', pattern: /^\/users$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = users;
    if (p.keyword) {
      const kw = String(p.keyword).toLowerCase();
      filtered = filtered.filter(u => `${u.lastName}${u.firstName}`.toLowerCase().includes(kw));
    }
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/users\/([^/]+)$/, handler: (m) => findById(users, m[1]) },
  { method: 'POST', pattern: /^\/users$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/users\/([^/]+)$/, handler: (m, config) => ({ ...findById(users, m[1]), ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/users\/([^/]+)\/availability$/, handler: (m, config) => ({ ...findById(users, m[1]), ...parseBody(config) }) },
  { method: 'DELETE', pattern: /^\/users\/([^/]+)$/, handler: () => ({ success: true }) },

  // ── Projects ──
  { method: 'GET', pattern: /^\/projects$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = projects;
    if (p.status) filtered = filtered.filter(pr => pr.status === p.status);
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/projects\/([^/]+)$/, handler: (m) => findById(projects, m[1]) },
  { method: 'POST', pattern: /^\/projects$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), status: 'planning', createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/projects\/([^/]+)$/, handler: (m, config) => ({ ...findById(projects, m[1]), ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/projects\/([^/]+)\/status$/, handler: (m, config) => ({ ...findById(projects, m[1]), ...parseBody(config) }) },
  { method: 'DELETE', pattern: /^\/projects\/([^/]+)$/, handler: () => ({ success: true }) },
  { method: 'GET', pattern: /^\/projects\/([^/]+)\/phases$/, handler: (m) => projectPhases.filter(ph => ph.projectId === m[1]) },
  { method: 'POST', pattern: /^\/projects\/([^/]+)\/phases$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), projectId: m[1], ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/projects\/([^/]+)\/phases\/([^/]+)$/, handler: (m, config) => {
    const ph = projectPhases.find(p => p.id === m[2]);
    return ph ? { ...ph, ...parseBody(config) } : null;
  }},
  { method: 'GET', pattern: /^\/projects\/([^/]+)\/staffing\/summary$/, handler: (m) => {
    const staffing = projectStaffing.filter(s => s.projectId === m[1]);
    return { projectId: m[1], totalRequired: staffing.reduce((s, x) => s + x.requiredCount, 0), totalConfirmed: staffing.reduce((s, x) => s + x.confirmedCount, 0), items: staffing };
  }},
  { method: 'GET', pattern: /^\/projects\/([^/]+)\/staffing$/, handler: (m) => projectStaffing.filter(s => s.projectId === m[1]) },
  { method: 'PUT', pattern: /^\/projects\/([^/]+)\/staffing$/, handler: (_m, config) => parseBody(config) },
  { method: 'GET', pattern: /^\/projects\/([^/]+)\/assignments$/, handler: (m) => projectAssignments.filter(a => a.projectId === m[1]) },
  { method: 'POST', pattern: /^\/projects\/([^/]+)\/assignments$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), projectId: m[1], ...parseBody(config), status: 'confirmed' }) },
  { method: 'PATCH', pattern: /^\/projects\/([^/]+)\/assignments\/([^/]+)$/, handler: (m, config) => {
    const a = projectAssignments.find(x => x.id === m[2]);
    return a ? { ...a, ...parseBody(config) } : null;
  }},
  { method: 'DELETE', pattern: /^\/projects\/([^/]+)\/assignments\/([^/]+)$/, handler: () => ({ success: true }) },
  { method: 'GET', pattern: /^\/projects\/([^/]+)\/documents$/, handler: () => [] },
  { method: 'POST', pattern: /^\/projects\/([^/]+)\/documents$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), projectId: m[1], ...parseBody(config), createdAt: new Date().toISOString() }) },

  // ── Reports ──
  { method: 'GET', pattern: /^\/reports$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = reports;
    if (p.status) filtered = filtered.filter(r => r.status === p.status);
    if (p.projectId) filtered = filtered.filter(r => r.projectId === p.projectId);
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/reports\/([^/]+)$/, handler: (m) => findById(reports, m[1]) },
  { method: 'POST', pattern: /^\/reports$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), status: 'draft', createdAt: new Date().toISOString() }) },
  { method: 'POST', pattern: /^\/reports\/clock-in$/, handler: (_m, config) => ({
    id: 'demo-' + Date.now(), ...parseBody(config), status: 'draft', inputMode: 'realtime',
    clockIn: new Date().toISOString(), createdAt: new Date().toISOString(),
  })},
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)\/clock-out$/, handler: (m) => {
    const r = findById(reports, m[1]);
    return { ...r, clockOut: new Date().toISOString(), status: 'draft' };
  }},
  { method: 'POST', pattern: /^\/reports\/([^/]+)\/break\/start$/, handler: (m) => ({ reportId: m[1], breakStart: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)\/break\/end$/, handler: (m) => ({ reportId: m[1], breakEnd: new Date().toISOString(), durationMinutes: 60 }) },
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)$/, handler: (m, config) => ({ ...findById(reports, m[1]), ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)\/submit$/, handler: (m) => ({ ...findById(reports, m[1]), status: 'submitted', submittedAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)\/approve$/, handler: (m) => ({ ...findById(reports, m[1]), status: 'approved', approvedAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/reports\/([^/]+)\/reject$/, handler: (m, config) => ({ ...findById(reports, m[1]), status: 'rejected', rejectionReason: parseBody(config).reason }) },
  { method: 'POST', pattern: /^\/reports\/([^/]+)\/costs$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), reportId: m[1], ...parseBody(config) }) },
  { method: 'POST', pattern: /^\/reports\/([^/]+)\/photos$/, handler: (m) => ({ id: 'demo-' + Date.now(), reportId: m[1], photoUrl: '/placeholder.jpg' }) },
  { method: 'POST', pattern: /^\/reports\/([^/]+)\/safety$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), reportId: m[1], ...parseBody(config) }) },

  // ── Workers ──
  { method: 'GET', pattern: /^\/workers\/available$/, handler: (_m, config) => paginate(availableWorkers, parseParams(config).page, parseParams(config).limit) },
  { method: 'GET', pattern: /^\/workers\/([^/]+)\/profile$/, handler: (m) => workerProfiles.find(p => p.userId === m[1]) || null },
  { method: 'PATCH', pattern: /^\/workers\/([^/]+)\/profile$/, handler: (m, config) => {
    const p = workerProfiles.find(x => x.userId === m[1]);
    return p ? { ...p, ...parseBody(config) } : null;
  }},
  { method: 'GET', pattern: /^\/workers\/([^/]+)\/skills$/, handler: (m) => workerSkills[m[1]] || [] },
  { method: 'PUT', pattern: /^\/workers\/([^/]+)\/skills$/, handler: (_m, config) => parseBody(config) },
  { method: 'GET', pattern: /^\/workers\/([^/]+)\/licenses$/, handler: (m) => workerLicenses[m[1]] || [] },
  { method: 'POST', pattern: /^\/workers\/([^/]+)\/licenses$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/workers\/([^/]+)\/licenses\/([^/]+)$/, handler: (_m, config) => ({ id: 'demo-updated', ...parseBody(config) }) },
  { method: 'DELETE', pattern: /^\/workers\/([^/]+)\/licenses\/([^/]+)$/, handler: () => ({ success: true }) },
  { method: 'GET', pattern: /^\/workers\/([^/]+)\/evaluations$/, handler: (m) => workerEvaluations.filter(e => e.workerId === m[1]) },
  { method: 'POST', pattern: /^\/workers\/([^/]+)\/evaluations$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), createdAt: new Date().toISOString() }) },
  { method: 'GET', pattern: /^\/workers\/([^/]+)\/calendar$/, handler: (m) => getWorkerAvailability(m[1]) },
  { method: 'PUT', pattern: /^\/workers\/([^/]+)\/calendar$/, handler: (_m, config) => parseBody(config) },

  // ── Matching Demand ──
  { method: 'GET', pattern: /^\/matching\/demand$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = demandPostings;
    if (p.prefecture) filtered = filtered.filter(d => d.sitePrefecture === p.prefecture);
    if (p.workTypeId) filtered = filtered.filter(d => d.workTypeId === p.workTypeId);
    if (p.status) filtered = filtered.filter(d => d.status === p.status);
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/matching\/demand\/([^/]+)$/, handler: (m) => findById(demandPostings, m[1]) },
  { method: 'POST', pattern: /^\/matching\/demand$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), status: 'draft', createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/matching\/demand\/([^/]+)$/, handler: (m, config) => ({ ...findById(demandPostings, m[1]), ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/matching\/demand\/([^/]+)\/publish$/, handler: (m) => ({ ...findById(demandPostings, m[1]), status: 'published' }) },
  { method: 'PATCH', pattern: /^\/matching\/demand\/([^/]+)\/suspend$/, handler: (m) => ({ ...findById(demandPostings, m[1]), status: 'suspended' }) },
  { method: 'PATCH', pattern: /^\/matching\/demand\/([^/]+)\/close$/, handler: (m) => ({ ...findById(demandPostings, m[1]), status: 'closed' }) },
  { method: 'DELETE', pattern: /^\/matching\/demand\/([^/]+)$/, handler: () => ({ success: true }) },
  { method: 'GET', pattern: /^\/matching\/demand\/([^/]+)\/applications$/, handler: (m) => demandApplications.filter(a => a.demandPostingId === m[1]) },
  { method: 'POST', pattern: /^\/matching\/demand\/([^/]+)\/applications$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), demandPostingId: m[1], ...parseBody(config), status: 'pending', createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/matching\/demand\/([^/]+)\/applications\/([^/]+)\/accept$/, handler: (m) => {
    const app = findById(demandApplications, m[2]);
    return app ? { ...app, status: 'accepted' } : null;
  }},
  { method: 'PATCH', pattern: /^\/matching\/demand\/([^/]+)\/applications\/([^/]+)\/reject$/, handler: (m) => {
    const app = findById(demandApplications, m[2]);
    return app ? { ...app, status: 'rejected' } : null;
  }},
  { method: 'GET', pattern: /^\/matching\/demand\/([^/]+)\/messages$/, handler: (m) => demandMessages.filter(msg => msg.demandPostingId === m[1]) },
  { method: 'POST', pattern: /^\/matching\/demand\/([^/]+)\/messages$/, handler: (m, config) => ({
    id: 'demo-' + Date.now(), demandPostingId: m[1], senderId: mockFrontendUser.id, ...parseBody(config),
    sender: { id: mockFrontendUser.id, companyId: mockFrontendUser.companyId, lastName: mockFrontendUser.lastName, firstName: mockFrontendUser.firstName, role: mockFrontendUser.role, createdAt: '' },
    createdAt: new Date().toISOString(),
  })},

  // ── Matching Supply ──
  { method: 'GET', pattern: /^\/matching\/supply$/, handler: (_m, config) => {
    const p = parseParams(config);
    let filtered = supplyPostings;
    if (p.status) filtered = filtered.filter(s => s.status === p.status);
    return paginate(filtered, p.page, p.limit);
  }},
  { method: 'GET', pattern: /^\/matching\/supply\/([^/]+)$/, handler: (m) => findById(supplyPostings, m[1]) },
  { method: 'POST', pattern: /^\/matching\/supply$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), status: 'draft', createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/matching\/supply\/([^/]+)$/, handler: (m, config) => ({ ...findById(supplyPostings, m[1]), ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/matching\/supply\/([^/]+)\/publish$/, handler: (m) => ({ ...findById(supplyPostings, m[1]), status: 'published' }) },
  { method: 'PATCH', pattern: /^\/matching\/supply\/([^/]+)\/close$/, handler: (m) => ({ ...findById(supplyPostings, m[1]), status: 'closed' }) },
  { method: 'DELETE', pattern: /^\/matching\/supply\/([^/]+)$/, handler: () => ({ success: true }) },
  { method: 'GET', pattern: /^\/matching\/supply\/([^/]+)\/inquiries$/, handler: (m) => supplyInquiries.filter(i => i.supplyPostingId === m[1]) },
  { method: 'POST', pattern: /^\/matching\/supply\/([^/]+)\/inquiries$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), supplyPostingId: m[1], ...parseBody(config), status: 'pending', createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/matching\/supply\/([^/]+)\/inquiries\/([^/]+)\/accept$/, handler: (m) => {
    const inq = findById(supplyInquiries, m[2]);
    return inq ? { ...inq, status: 'accepted' } : null;
  }},
  { method: 'PATCH', pattern: /^\/matching\/supply\/([^/]+)\/inquiries\/([^/]+)\/reject$/, handler: (m) => {
    const inq = findById(supplyInquiries, m[2]);
    return inq ? { ...inq, status: 'rejected' } : null;
  }},
  { method: 'GET', pattern: /^\/matching\/supply\/([^/]+)\/messages$/, handler: (m) => supplyMessages.filter(msg => msg.supplyPostingId === m[1]) },
  { method: 'POST', pattern: /^\/matching\/supply\/([^/]+)\/messages$/, handler: (m, config) => ({
    id: 'demo-' + Date.now(), supplyPostingId: m[1], senderId: mockFrontendUser.id, ...parseBody(config),
    sender: { id: mockFrontendUser.id, companyId: mockFrontendUser.companyId, lastName: mockFrontendUser.lastName, firstName: mockFrontendUser.firstName, role: mockFrontendUser.role, createdAt: '' },
    createdAt: new Date().toISOString(),
  })},

  // ── Matching Contracts ──
  { method: 'GET', pattern: /^\/matching\/contracts\/dashboard$/, handler: () => dashboardResponse },
  { method: 'GET', pattern: /^\/matching\/contracts\/kpi$/, handler: () => kpiResponse },
  { method: 'GET', pattern: /^\/matching\/contracts$/, handler: (_m, config) => paginate(matchContracts, parseParams(config).page, parseParams(config).limit) },
  { method: 'GET', pattern: /^\/matching\/contracts\/([^/]+)$/, handler: (m) => findById(matchContracts, m[1]) },
  { method: 'PATCH', pattern: /^\/matching\/contracts\/([^/]+)\/complete$/, handler: (m) => ({ ...findById(matchContracts, m[1]), status: 'completed', completedAt: new Date().toISOString() }) },
  { method: 'POST', pattern: /^\/matching\/contracts\/([^/]+)\/cancel$/, handler: (m, config) => ({ ...findById(matchContracts, m[1]), status: 'cancelled', cancelReason: parseBody(config).reason }) },
  { method: 'POST', pattern: /^\/matching\/contracts\/([^/]+)\/review$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), contractId: m[1], ...parseBody(config), createdAt: new Date().toISOString() }) },

  // ── Accounting ──
  { method: 'GET', pattern: /^\/invoices$/, handler: (_m, config) => paginate(invoices, parseParams(config).page, parseParams(config).limit) },
  { method: 'GET', pattern: /^\/invoices\/([^/]+)$/, handler: (m) => findById(invoices, m[1]) },
  { method: 'POST', pattern: /^\/invoices$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), status: 'draft', createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/invoices\/([^/]+)$/, handler: (m, config) => ({ ...findById(invoices, m[1]), ...parseBody(config) }) },
  { method: 'PATCH', pattern: /^\/invoices\/([^/]+)\/issue$/, handler: (m) => ({ ...findById(invoices, m[1]), status: 'issued', issuedAt: new Date().toISOString() }) },
  { method: 'POST', pattern: /^\/invoices\/([^/]+)\/payments$/, handler: (m, config) => ({ id: 'demo-' + Date.now(), invoiceId: m[1], ...parseBody(config) }) },
  { method: 'GET', pattern: /^\/payroll$/, handler: (_m, config) => paginate(payrolls, parseParams(config).page, parseParams(config).limit) },
  { method: 'POST', pattern: /^\/payroll$/, handler: (_m, config) => ({ id: 'demo-' + Date.now(), ...parseBody(config), status: 'draft', createdAt: new Date().toISOString() }) },
  { method: 'PATCH', pattern: /^\/payroll\/([^/]+)\/confirm$/, handler: () => ({ success: true }) },
  { method: 'PATCH', pattern: /^\/payroll\/([^/]+)\/pay$/, handler: () => ({ success: true }) },
  { method: 'GET', pattern: /^\/cost-ledger\/summary\/([^/]+)$/, handler: (m) => getCostSummary(m[1]) },
  { method: 'GET', pattern: /^\/cost-ledger$/, handler: (_m, config) => paginate(costLedgerEntries, parseParams(config).page, parseParams(config).limit) },

  // ── Notifications ──
  { method: 'GET', pattern: /^\/notifications\/unread-count$/, handler: () => ({ count: notifications.filter(n => !n.isRead).length }) },
  { method: 'GET', pattern: /^\/notifications$/, handler: (_m, config) => paginate(notifications, parseParams(config).page, parseParams(config).limit) },
  { method: 'PATCH', pattern: /^\/notifications\/([^/]+)\/read$/, handler: () => ({ success: true }) },

  // ── Geolocation ──
  { method: 'POST', pattern: /^\/geolocation\/record$/, handler: () => ({ success: true }) },
  { method: 'POST', pattern: /^\/geolocation\/geofence\/check$/, handler: () => ({
    isInsideGeofence: true, distanceMeters: 50, projectId: projects[0].id, projectName: projects[0].projectName, event: null,
  })},

  // ── Custom Fields ──
  { method: 'GET', pattern: /^\/custom-fields\/defs$/, handler: () => [] },
  { method: 'GET', pattern: /^\/custom-fields\/vals\/([^/]+)\/([^/]+)$/, handler: () => [] },
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

  console.warn(`[DemoMode] Unhandled route: ${method} ${url}`);
  return {
    data: { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  } as AxiosResponse;
}
