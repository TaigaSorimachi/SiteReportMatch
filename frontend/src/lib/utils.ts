import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export function formatDate(dateStr: string, fmt = 'yyyy/MM/dd'): string {
  return format(parseISO(dateStr), fmt, { locale: ja });
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy/MM/dd HH:mm', { locale: ja });
}

export function formatDateWithDay(dateStr: string): string {
  return format(parseISO(dateStr), 'M/d(E)', { locale: ja });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('ja-JP').format(n);
}

export function formatTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    open: 'bg-blue-100 text-blue-700',
    published: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    submitted: 'bg-purple-100 text-purple-700',
    approved: 'bg-green-100 text-green-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    suspended: 'bg-orange-100 text-orange-700',
    filled: 'bg-teal-100 text-teal-700',
    closed: 'bg-gray-100 text-gray-700',
    expired: 'bg-gray-100 text-gray-500',
    issued: 'bg-blue-100 text-blue-700',
    sent: 'bg-purple-100 text-purple-700',
    paid: 'bg-green-100 text-green-700',
    confirmed: 'bg-green-100 text-green-700',
  };
  return map[status] || 'bg-gray-100 text-gray-700';
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '下書き',
    open: '公開中',
    published: '公開中',
    active: '稼働中',
    in_progress: '作業中',
    submitted: '提出済',
    approved: '承認済',
    completed: '完了',
    rejected: '差戻し',
    cancelled: 'キャンセル',
    suspended: '一時停止',
    filled: '充足',
    closed: '終了',
    expired: '期限切れ',
    issued: '発行済',
    sent: '送付済',
    paid: '支払済',
    confirmed: '確定',
    pending: '保留中',
    accepted: '承認',
  };
  return map[status] || status;
}
