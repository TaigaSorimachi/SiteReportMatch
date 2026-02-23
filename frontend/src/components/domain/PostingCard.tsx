import { Badge } from '@/components/ui/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';

interface Props {
  contractType: string;
  workTypeName?: string;
  siteName?: string;
  title?: string;
  prefecture: string;
  city?: string;
  dateStart: string;
  dateEnd: string;
  count?: number;
  dailyRateMin?: number;
  dailyRateMax?: number;
  fixedPrice?: number;
  status: string;
  tags?: string[];
  onClick?: () => void;
}

export function PostingCard({
  contractType, workTypeName, siteName, title, prefecture, city,
  dateStart, dateEnd, count, dailyRateMin, dailyRateMax, fixedPrice,
  status, tags, onClick,
}: Props) {
  return (
    <div className="border border-gray-200 rounded-xl p-3 space-y-1.5 active:bg-gray-50" onClick={onClick}>
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2 py-0.5 rounded font-medium ${contractType === 'daily_rate' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {contractType === 'daily_rate' ? '単価' : '請負'}
        </span>
        {workTypeName && <span className="text-gray-600">{workTypeName}</span>}
        <Badge status={status} className="ml-auto" />
      </div>
      <p className="font-medium text-sm text-gray-900">{siteName || title}</p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>📍 {prefecture}{city || ''}</span>
        <span>📅 {formatDate(dateStart, 'M/d')}〜{formatDate(dateEnd, 'M/d')}</span>
        {count && <span>👷 {count}名</span>}
      </div>
      <div className="text-sm font-medium text-gray-900">
        {contractType === 'daily_rate'
          ? `💴 ${formatCurrency(dailyRateMin || 0)}${dailyRateMax ? `〜${formatCurrency(dailyRateMax)}` : ''}/日`
          : `💴 ${formatCurrency(fixedPrice || 0)}`}
      </div>
      {tags && tags.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {tags.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
