import { uuid, daysFromNow } from './helpers';
import type { WorkerProfile, WorkerSkill, WorkerLicense, WorkerEvaluation, WorkerAvailability, User } from '@/types/api';

export const workerProfiles: WorkerProfile[] = [
  { id: uuid(290), userId: uuid(11), experienceYears: 5, skillLevel: 'intermediate', specialties: '内装仕上げ、塗装', preferredArea: '東京都23区', maxCommuteKm: 30, hasVehicle: false, avgRating: 4.2, totalProjects: 15 },
  { id: uuid(291), userId: uuid(13), experienceYears: 12, skillLevel: 'expert', specialties: '型枠工事、基礎工事、鉄筋工事', preferredArea: '東京都・神奈川県', maxCommuteKm: 50, hasVehicle: true, hasOwnTools: true, avgRating: 4.8, totalProjects: 45 },
  { id: uuid(292), userId: uuid(14), experienceYears: 8, skillLevel: 'advanced', specialties: 'とび工事、鉄筋工事', preferredArea: '東京都・埼玉県', maxCommuteKm: 40, hasVehicle: true, avgRating: 4.5, totalProjects: 28 },
  { id: uuid(293), userId: uuid(15), experienceYears: 15, skillLevel: 'expert', specialties: '電気工事全般、受変電設備', preferredArea: '東京都・千葉県', maxCommuteKm: 60, hasVehicle: true, hasOwnTools: true, avgRating: 4.9, totalProjects: 60 },
  { id: uuid(294), userId: uuid(16), experienceYears: 3, skillLevel: 'intermediate', specialties: '電気配線、照明設備', preferredArea: '東京都', maxCommuteKm: 25, hasVehicle: false, avgRating: 4.0, totalProjects: 8 },
  { id: uuid(295), userId: uuid(17), experienceYears: 20, skillLevel: 'expert', specialties: '左官工事、タイル工事、防水工事', preferredArea: '埼玉県・東京都', maxCommuteKm: 50, hasVehicle: true, hasOwnTools: true, avgRating: 4.9, totalProjects: 80 },
  { id: uuid(296), userId: uuid(18), experienceYears: 4, skillLevel: 'intermediate', specialties: '左官仕上げ、内装', preferredArea: '埼玉県', maxCommuteKm: 30, hasVehicle: false, avgRating: 4.3, totalProjects: 10 },
  { id: uuid(297), userId: uuid(19), experienceYears: 10, skillLevel: 'advanced', specialties: '管工事、空調設備', preferredArea: '東京都', maxCommuteKm: 40, hasVehicle: true, hasOwnTools: true, avgRating: 4.6, totalProjects: 35 },
];

export const workerSkills: Record<string, WorkerSkill[]> = {
  [uuid(11)]: [
    { id: uuid(310), workTypeId: uuid(104), workType: { id: uuid(104), workTypeName: '内装仕上げ' } },
    { id: uuid(311), workTypeId: uuid(101), workType: { id: uuid(101), workTypeName: '塗装工事' } },
  ],
  [uuid(13)]: [
    { id: uuid(312), workTypeId: uuid(106), workType: { id: uuid(106), workTypeName: '型枠工事' } },
    { id: uuid(313), workTypeId: uuid(105), workType: { id: uuid(105), workTypeName: '基礎工事' } },
    { id: uuid(314), workTypeId: uuid(107), workType: { id: uuid(107), workTypeName: '鉄筋工事' } },
  ],
  [uuid(15)]: [
    { id: uuid(315), workTypeId: uuid(109), workType: { id: uuid(109), workTypeName: '電気工事' } },
  ],
  [uuid(17)]: [
    { id: uuid(316), workTypeId: uuid(100), workType: { id: uuid(100), workTypeName: '左官工事' } },
    { id: uuid(317), workTypeId: uuid(102), workType: { id: uuid(102), workTypeName: 'タイル工事' } },
    { id: uuid(318), workTypeId: uuid(103), workType: { id: uuid(103), workTypeName: '防水工事' } },
  ],
  [uuid(19)]: [
    { id: uuid(319), workTypeId: uuid(110), workType: { id: uuid(110), workTypeName: '管工事' } },
    { id: uuid(320), workTypeId: uuid(111), workType: { id: uuid(111), workTypeName: '空調設備' } },
  ],
};

export const workerLicenses: Record<string, WorkerLicense[]> = {
  [uuid(13)]: [
    { id: uuid(330), licenseId: uuid(300), license: { id: uuid(300), licenseName: '一級建築施工管理技士', category: '施工管理' }, licenseNumber: '1施-2020-12345', issuedDate: '2020-06-15', isVerified: true },
    { id: uuid(331), licenseId: uuid(303), license: { id: uuid(303), licenseName: '玉掛け技能講習', category: '技能講習' }, issuedDate: '2015-04-10', isVerified: true },
  ],
  [uuid(15)]: [
    { id: uuid(332), licenseId: uuid(305), license: { id: uuid(305), licenseName: '第一種電気工事士', category: '電気' }, licenseNumber: '1電-2019-67890', issuedDate: '2019-11-01', expiryDate: '2029-11-01', isVerified: true },
    { id: uuid(333), licenseId: uuid(300), license: { id: uuid(300), licenseName: '一級建築施工管理技士', category: '施工管理' }, licenseNumber: '1施-2018-11111', issuedDate: '2018-03-20', isVerified: true },
  ],
  [uuid(17)]: [
    { id: uuid(334), licenseId: uuid(301), license: { id: uuid(301), licenseName: '二級建築施工管理技士', category: '施工管理' }, licenseNumber: '2施-2010-22222', issuedDate: '2010-08-15', isVerified: true },
    { id: uuid(335), licenseId: uuid(309), license: { id: uuid(309), licenseName: '酸素欠乏危険作業主任者', category: '安全' }, issuedDate: '2012-02-28', isVerified: true },
  ],
};

export const workerEvaluations: WorkerEvaluation[] = [
  { id: uuid(340), evaluatorId: uuid(10), workerId: uuid(13), projectId: uuid(20), ratingSkill: 5, ratingSpeed: 5, ratingAttitude: 5, ratingSafety: 5, ratingCommunication: 4, comment: '非常に優秀。型枠工事のリーダーとして現場を引っ張ってくれている。', createdAt: '2026-02-15T00:00:00.000Z' },
  { id: uuid(341), evaluatorId: uuid(10), workerId: uuid(14), projectId: uuid(20), ratingSkill: 4, ratingSpeed: 4, ratingAttitude: 5, ratingSafety: 5, ratingCommunication: 4, comment: 'とび工事の技術力が高く、安全管理も徹底している。', createdAt: '2026-02-15T00:00:00.000Z' },
  { id: uuid(342), evaluatorId: uuid(10), workerId: uuid(11), projectId: uuid(20), ratingSkill: 4, ratingSpeed: 3, ratingAttitude: 5, ratingSafety: 4, ratingCommunication: 5, comment: '丁寧な仕上がりで品質が高い。確実な仕事をしてくれる。', createdAt: '2026-02-15T00:00:00.000Z' },
  { id: uuid(343), evaluatorId: uuid(10), workerId: uuid(15), projectId: uuid(20), ratingSkill: 5, ratingSpeed: 5, ratingAttitude: 4, ratingSafety: 5, ratingCommunication: 4, comment: '電気工事の専門性が非常に高い。資格も豊富で安心。', createdAt: '2026-02-20T00:00:00.000Z' },
  { id: uuid(344), evaluatorId: uuid(10), workerId: uuid(17), projectId: uuid(21), ratingSkill: 5, ratingSpeed: 4, ratingAttitude: 5, ratingSafety: 5, ratingCommunication: 5, comment: '20年の経験は伊達ではない。左官の仕上がりは美しい。', createdAt: '2026-02-20T00:00:00.000Z' },
];

export const availableWorkers: (User & { profile?: WorkerProfile })[] = [
  { id: uuid(11), companyId: uuid(1), lastName: '佐藤', firstName: '花子', role: 'worker', defaultDailyRate: 18000, createdAt: '', profile: workerProfiles[0] },
  { id: uuid(13), companyId: uuid(1), lastName: '田中', firstName: '健一', role: 'worker', defaultDailyRate: 22000, createdAt: '', profile: workerProfiles[1] },
  { id: uuid(14), companyId: uuid(1), lastName: '高橋', firstName: '勇気', role: 'worker', defaultDailyRate: 20000, createdAt: '', profile: workerProfiles[2] },
  { id: uuid(15), companyId: uuid(2), lastName: '伊藤', firstName: '大輔', role: 'worker', defaultDailyRate: 25000, createdAt: '', profile: workerProfiles[3] },
  { id: uuid(17), companyId: uuid(3), lastName: '小林', firstName: '正和', role: 'worker', defaultDailyRate: 23000, createdAt: '', profile: workerProfiles[5] },
  { id: uuid(19), companyId: uuid(1), lastName: '吉田', firstName: '隆司', role: 'worker', defaultDailyRate: 21000, createdAt: '', profile: workerProfiles[7] },
];

export function getWorkerAvailability(userId: string): WorkerAvailability[] {
  const avail: WorkerAvailability[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    avail.push({
      id: `avail-${userId}-${i}`,
      userId,
      targetDate: d.toISOString().split('T')[0],
      status: dayOfWeek === 0 || dayOfWeek === 6 ? 'unavailable' : 'available',
    });
  }
  return avail;
}
