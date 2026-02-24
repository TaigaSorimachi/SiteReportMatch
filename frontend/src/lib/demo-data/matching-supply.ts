import { uuid } from './helpers';
import type { SupplyPosting, SupplyInquiry, SupplyMessage } from '@/types/api';

export const supplyPostings: SupplyPosting[] = [
  {
    id: uuid(800), userId: uuid(17), companyId: uuid(3),
    workTypeId: uuid(100),
    workType: { id: uuid(100), workTypeName: '左官工事' },
    contractType: 'daily', desiredDailyRate: 23000,
    availableStart: '2026-03-01', availableEnd: '2026-06-30',
    availablePrefecture: '東京都', availableArea: '東京都23区・埼玉県南部',
    status: 'published', skillLevel: 'expert', experienceYears: 20,
    title: 'ベテラン左官職人（経験20年）',
    description: '左官工事歴20年のベテランです。外壁補修・モルタル仕上げ・タイル下地が得意。大規模修繕の実績多数。自家用車で現場直行可能。',
    user: { id: uuid(17), companyId: uuid(3), lastName: '小林', firstName: '正和', role: 'worker', createdAt: '' },
    createdAt: '2026-02-10T00:00:00.000Z',
  },
  {
    id: uuid(801), userId: uuid(16), companyId: uuid(2),
    workTypeId: uuid(109),
    workType: { id: uuid(109), workTypeName: '電気工事' },
    contractType: 'daily', desiredDailyRate: 19000,
    availableStart: '2026-03-01', availableEnd: '2026-12-31',
    availablePrefecture: '東京都', availableArea: '東京都全域',
    status: 'published', skillLevel: 'intermediate', experienceYears: 3,
    title: '電気工事士（第二種）3年経験',
    description: '第二種電気工事士。照明器具取付・配線・コンセント増設等の経験あり。真面目に取り組みます。',
    user: { id: uuid(16), companyId: uuid(2), lastName: '渡辺', firstName: '翔太', role: 'worker', createdAt: '' },
    createdAt: '2026-02-18T00:00:00.000Z',
  },
];

export const supplyInquiries: SupplyInquiry[] = [
  {
    id: uuid(850), supplyPostingId: uuid(800), inquirerId: uuid(10), inquirerCompanyId: uuid(1),
    status: 'pending',
    message: '品川マンションの左官工事で3月から2名体制を検討しています。ぜひお話を聞かせてください。',
    inquirer: { id: uuid(10), companyId: uuid(1), lastName: '山田', firstName: '太郎', role: 'owner', createdAt: '' },
    createdAt: '2026-02-20T00:00:00.000Z',
  },
];

export const supplyMessages: SupplyMessage[] = [
  {
    id: uuid(860), supplyPostingId: uuid(800), senderId: uuid(10),
    content: '小林さん、品川マンション大規模修繕工事の左官工事をお願いしたいのですが、3月からのご都合はいかがでしょうか？',
    sender: { id: uuid(10), companyId: uuid(1), lastName: '山田', firstName: '太郎', role: 'owner', createdAt: '' },
    createdAt: '2026-02-20T09:00:00.000Z',
  },
  {
    id: uuid(861), supplyPostingId: uuid(800), senderId: uuid(17),
    content: '山田様、お問い合わせありがとうございます。3月以降であれば対応可能です。現場の詳細を教えていただけますか？',
    sender: { id: uuid(17), companyId: uuid(3), lastName: '小林', firstName: '正和', role: 'worker', createdAt: '' },
    createdAt: '2026-02-20T14:00:00.000Z',
  },
];
