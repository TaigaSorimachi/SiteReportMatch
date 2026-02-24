import { uuid } from './helpers';
import type { DemandPosting, DemandApplication, DemandMessage } from '@/types/api';

export const demandPostings: DemandPosting[] = [
  {
    id: uuid(700), companyId: uuid(1), projectId: uuid(20),
    siteName: '渋谷駅前再開発現場', sitePrefecture: '東京都', siteCity: '渋谷区', siteAddress: '渋谷2-1-1',
    contractType: 'daily', workTypeId: uuid(107),
    workType: { id: uuid(107), workTypeName: '鉄筋工事' },
    workDateStart: '2026-03-01', workDateEnd: '2026-05-31',
    requiredCount: 3, confirmedCount: 1,
    dailyRateMin: 18000, dailyRateMax: 25000,
    status: 'published',
    description: '渋谷駅前再開発ビル新築工事の鉄筋工事要員を募集します。5階以上の柱・梁・スラブ配筋作業。RC経験者優遇。',
    company: { id: uuid(1), companyName: 'デモ建設株式会社', companyNameKana: '', companyType: 'general_contractor', isActive: true, createdAt: '' },
    createdAt: '2026-02-15T00:00:00.000Z',
  },
  {
    id: uuid(701), companyId: uuid(1), projectId: uuid(21),
    siteName: '品川グランドハイツ', sitePrefecture: '東京都', siteCity: '品川区', siteAddress: '北品川3-8-15',
    contractType: 'daily', workTypeId: uuid(101),
    workType: { id: uuid(101), workTypeName: '塗装工事' },
    workDateStart: '2026-04-01', workDateEnd: '2026-07-15',
    requiredCount: 2, confirmedCount: 0,
    dailyRateMin: 16000, dailyRateMax: 22000,
    status: 'published',
    description: '品川マンション大規模修繕工事の塗装工を募集。外壁吹付・ローラー塗装。高所作業あり。',
    company: { id: uuid(1), companyName: 'デモ建設株式会社', companyNameKana: '', companyType: 'general_contractor', isActive: true, createdAt: '' },
    createdAt: '2026-02-20T00:00:00.000Z',
  },
  {
    id: uuid(702), companyId: uuid(2),
    siteName: '新宿センタービル', sitePrefecture: '東京都', siteCity: '新宿区', siteAddress: '西新宿1-25-1',
    contractType: 'daily', workTypeId: uuid(109),
    workType: { id: uuid(109), workTypeName: '電気工事' },
    workDateStart: '2025-12-01', workDateEnd: '2026-02-28',
    requiredCount: 2, confirmedCount: 2,
    dailyRateMin: 20000, dailyRateMax: 28000,
    status: 'closed',
    description: '新宿オフィスビル電気設備改修工事。LED照明器具取付・分電盤結線。第二種電気工事士以上必須。',
    company: { id: uuid(2), companyName: '東京電設工業株式会社', companyNameKana: '', companyType: 'subcontractor', isActive: true, createdAt: '' },
    createdAt: '2025-11-15T00:00:00.000Z',
  },
];

export const demandApplications: DemandApplication[] = [
  {
    id: uuid(750), demandPostingId: uuid(700), applicantId: uuid(14),
    status: 'accepted', proposedRate: 20000, availableCount: 1,
    message: '鉄筋工事の経験は3年ですが、とび工事との兼務で躯体全般に対応可能です。安全帯使用・玉掛け資格あり。',
    applicant: { id: uuid(14), companyId: uuid(1), lastName: '高橋', firstName: '勇気', role: 'worker', createdAt: '' },
    createdAt: '2026-02-16T00:00:00.000Z',
  },
  {
    id: uuid(751), demandPostingId: uuid(700), applicantId: uuid(19),
    status: 'pending', proposedRate: 21000, availableCount: 1,
    message: '管工事が専門ですが、鉄筋組立の経験もあります。3月から参加可能です。',
    applicant: { id: uuid(19), companyId: uuid(1), lastName: '吉田', firstName: '隆司', role: 'worker', createdAt: '' },
    createdAt: '2026-02-18T00:00:00.000Z',
  },
  {
    id: uuid(752), demandPostingId: uuid(701), applicantId: uuid(11),
    status: 'pending', proposedRate: 18000, availableCount: 1,
    message: '塗装工事の経験があります。ローラー・吹付け対応可能。4月から参加希望です。',
    applicant: { id: uuid(11), companyId: uuid(1), lastName: '佐藤', firstName: '花子', role: 'worker', createdAt: '' },
    createdAt: '2026-02-22T00:00:00.000Z',
  },
];

export const demandMessages: DemandMessage[] = [
  {
    id: uuid(770), demandPostingId: uuid(700), senderId: uuid(14),
    content: 'ご検討いただきありがとうございます。3月1日から参加可能です。よろしくお願いします。',
    sender: { id: uuid(14), companyId: uuid(1), lastName: '高橋', firstName: '勇気', role: 'worker', createdAt: '' },
    createdAt: '2026-02-17T09:00:00.000Z',
  },
  {
    id: uuid(771), demandPostingId: uuid(700), senderId: uuid(10),
    content: '高橋さん、採用させていただきます。初日は8:00に現場事務所に集合でお願いします。安全靴・ヘルメット持参で。',
    sender: { id: uuid(10), companyId: uuid(1), lastName: '山田', firstName: '太郎', role: 'owner', createdAt: '' },
    createdAt: '2026-02-17T10:30:00.000Z',
  },
];
