import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export function formatDate(dateStr?: string | null, fmt = 'yyyy/MM/dd'): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), fmt, { locale: ja });
  } catch {
    return dateStr;
  }
}

export function formatCurrency(amount?: number | null): string {
  if (amount == null) return '-';
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

export function fullName(lastName?: string, firstName?: string): string {
  return [lastName, firstName].filter(Boolean).join(' ') || '-';
}

export function companyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    general_contractor: 'ゼネコン',
    own: '自社',
    prime: '元請',
    subcontractor: '下請',
    partner: '協力会社',
  };
  return map[type] ?? type;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    admin: '管理者',
    owner: 'オーナー',
    worker: '作業者',
  };
  return map[role] ?? role;
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    active: '稼働中',
    planning: '計画中',
    completed: '完了',
    suspended: '中断',
    cancelled: 'キャンセル',
    available: '稼働可',
    unavailable: '稼働不可',
    on_leave: '休暇中',
  };
  return map[status] ?? status;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
