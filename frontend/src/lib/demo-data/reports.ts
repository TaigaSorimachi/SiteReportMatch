import { uuid, daysAgo, clockTime } from './helpers';
import type { DailyReport } from '@/types/api';

const weathers = ['晴れ', '曇り', '雨', '晴れ', '晴れ', '曇り', '晴れ'];

function generateReports(): DailyReport[] {
  const reports: DailyReport[] = [];
  const workerConfigs = [
    { workerId: uuid(11), projectId: uuid(20), lastName: '佐藤', firstName: '花子', startH: 8, endH: 17, content: '内装下地処理・ボード張り作業' },
    { workerId: uuid(13), projectId: uuid(20), lastName: '田中', firstName: '健一', startH: 7, endH: 17, content: '型枠組立作業' },
    { workerId: uuid(14), projectId: uuid(20), lastName: '高橋', firstName: '勇気', startH: 7, endH: 16, content: 'とび工事・足場組替え' },
    { workerId: uuid(15), projectId: uuid(20), lastName: '伊藤', firstName: '大輔', startH: 8, endH: 18, content: '電気配線工事' },
    { workerId: uuid(17), projectId: uuid(21), lastName: '小林', firstName: '正和', startH: 8, endH: 17, content: '外壁左官補修作業' },
    { workerId: uuid(18), projectId: uuid(21), lastName: '加藤', firstName: '美咲', startH: 8, endH: 17, content: '左官仕上げ作業' },
    { workerId: uuid(19), projectId: uuid(20), lastName: '吉田', firstName: '隆司', startH: 8, endH: 17, content: '管工事・空調ダクト接続' },
  ];

  const projectNames: Record<string, { name: string; code: string }> = {
    [uuid(20)]: { name: '渋谷駅前再開発ビル新築工事', code: 'PRJ-2026-001' },
    [uuid(21)]: { name: '品川マンション大規模修繕工事', code: 'PRJ-2026-002' },
  };

  let idCounter = 2000;

  for (let dayOffset = 1; dayOffset <= 20; dayOffset++) {
    const d = new Date();
    d.setDate(d.getDate() - dayOffset);
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const dateStr = daysAgo(dayOffset);
    const weather = weathers[dayOffset % weathers.length];

    for (const wc of workerConfigs) {
      const workMin = (wc.endH - wc.startH) * 60 - 60;
      let status = 'approved';
      if (dayOffset <= 2) status = 'submitted';
      else if (dayOffset === 5 && wc.workerId === uuid(11)) status = 'rejected';

      const pn = projectNames[wc.projectId];
      reports.push({
        id: uuid(idCounter++),
        projectId: wc.projectId,
        workerId: wc.workerId,
        reportDate: dateStr,
        inputMode: wc.projectId === uuid(21) ? 'batch' : 'realtime',
        status,
        clockIn: clockTime(dateStr, wc.startH),
        clockOut: clockTime(dateStr, wc.endH),
        breakMinutes: 60,
        workMinutes: workMin,
        manDays: 1.0,
        overtimeMinutes: workMin > 480 ? workMin - 480 : 0,
        workContent: wc.content,
        progressPct: Math.min(100, Math.floor((20 - dayOffset) / 20 * 100)),
        weather,
        project: { id: wc.projectId, projectName: pn.name, projectCode: pn.code, companyId: uuid(1), status: 'active', createdAt: '' },
        worker: { id: wc.workerId, companyId: uuid(1), lastName: wc.lastName, firstName: wc.firstName, role: 'worker', createdAt: '' },
        costItems: [],
        createdAt: clockTime(dateStr, wc.endH),
      });
    }
  }

  // Add cost items to first few reports
  if (reports[0]) {
    reports[0].costItems = [
      { id: uuid(3000), reportId: reports[0].id, costType: 'material', itemName: '石膏ボード 12.5mm', quantity: 50, unit: '枚', unitPrice: 450, amount: 22500 },
      { id: uuid(3001), reportId: reports[0].id, costType: 'material', itemName: 'ビス（ボード用）', quantity: 5, unit: '箱', unitPrice: 800, amount: 4000 },
    ];
  }
  if (reports[1]) {
    reports[1].costItems = [
      { id: uuid(3002), reportId: reports[1].id, costType: 'material', itemName: '型枠用合板', quantity: 30, unit: '枚', unitPrice: 1800, amount: 54000 },
      { id: uuid(3003), reportId: reports[1].id, costType: 'rental', itemName: 'クレーン使用料', quantity: 1, unit: '日', unitPrice: 85000, amount: 85000 },
    ];
  }

  return reports;
}

export const reports: DailyReport[] = generateReports();
