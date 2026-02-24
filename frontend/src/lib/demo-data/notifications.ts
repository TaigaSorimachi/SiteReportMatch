import { uuid } from './helpers';
import type { NotificationLog } from '@/types/api';

export const notifications: NotificationLog[] = [
  { id: uuid(1100), userId: uuid(10), notificationType: 'report_submitted', title: '日報が提出されました', body: '佐藤花子さんが本日の日報を提出しました。確認してください。', isRead: false, createdAt: '2026-02-24T17:30:00.000Z' },
  { id: uuid(1101), userId: uuid(10), notificationType: 'demand_application', title: '募集に応募がありました', body: '「渋谷駅前再開発 鉄筋工事」に吉田隆司さんから応募がありました。', isRead: false, createdAt: '2026-02-23T10:00:00.000Z' },
  { id: uuid(1102), userId: uuid(10), notificationType: 'payment_received', title: '入金がありました', body: '請求書 INV-2026-001（東京電設工業）の入金 ¥2,750,000 が確認されました。', isRead: true, createdAt: '2026-02-25T09:00:00.000Z' },
  { id: uuid(1103), userId: uuid(14), notificationType: 'application_accepted', title: '応募が承認されました', body: '「渋谷駅前再開発 鉄筋工事」への応募が承認されました。3/1から勤務開始です。', isRead: true, createdAt: '2026-02-17T11:00:00.000Z' },
  { id: uuid(1104), userId: uuid(11), notificationType: 'report_approved', title: '日報が承認されました', body: '2/20の日報（渋谷駅前再開発ビル新築工事）が承認されました。', isRead: true, createdAt: '2026-02-21T08:00:00.000Z' },
  { id: uuid(1105), userId: uuid(13), notificationType: 'report_approved', title: '日報が承認されました', body: '2/20の日報（渋谷駅前再開発ビル新築工事）が承認されました。', isRead: true, createdAt: '2026-02-21T08:00:00.000Z' },
];
