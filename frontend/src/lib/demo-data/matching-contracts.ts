import { uuid, daysFromNow } from './helpers';
import type { MatchContract, DashboardResponse, KpiResponse } from '@/types/api';

export const matchContracts: MatchContract[] = [
  {
    id: uuid(900),
    demandPostingId: uuid(700),
    clientCompanyId: uuid(1),
    workerUserId: uuid(14),
    contractType: 'daily',
    status: 'active',
    workDateStart: '2026-03-01',
    workDateEnd: '2026-05-31',
    agreedRate: 20000,
    demandPosting: {
      id: uuid(700), companyId: uuid(1), siteName: '渋谷駅前再開発現場',
      sitePrefecture: '東京都', siteCity: '渋谷区', contractType: 'daily',
      workTypeId: uuid(107), workDateStart: '2026-03-01', workDateEnd: '2026-05-31',
      requiredCount: 3, confirmedCount: 1, status: 'published',
      workType: { id: uuid(107), workTypeName: '鉄筋工事' },
      createdAt: '2026-02-15T00:00:00.000Z',
    },
    clientCompany: { id: uuid(1), companyName: 'デモ建設株式会社', companyNameKana: '', companyType: 'general_contractor', isActive: true, createdAt: '' },
    workerUser: { id: uuid(14), companyId: uuid(1), lastName: '高橋', firstName: '勇気', role: 'worker', createdAt: '' },
    reviews: [],
    createdAt: '2026-02-17T00:00:00.000Z',
  },
];

function buildDailySummary() {
  const summary = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Monday
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const required = isWeekend ? 0 : 7 + (i % 3);
    const confirmed = isWeekend ? 0 : Math.min(required, 5 + (i % 2));
    summary.push({
      date: d.toISOString().split('T')[0],
      required,
      confirmed,
      shortage: Math.max(0, required - confirmed),
      surplus: Math.max(0, confirmed - required),
    });
  }
  return summary;
}

const dailySummary = buildDailySummary();
const weekStart = dailySummary[0].date;
const weekEnd = dailySummary[6].date;

export const dashboardResponse: DashboardResponse = {
  weekStart,
  weekEnd,
  dailySummary,
  openDemands: 2,
  activeContracts: 1,
  staffingDetails: [],
};

export const kpiResponse: KpiResponse = {
  contracts: { total: 5, active: 1, completed: 3, cancelled: 1, cancelRate: 20 },
  matching: { avgTimeToMatchHours: 48 },
  reviews: { avgRating: 4.5, totalReviews: 6 },
  demand: { total: 3, open: 2, filled: 1, fillRate: 33.3 },
};
