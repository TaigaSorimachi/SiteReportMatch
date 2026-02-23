import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchingSupplyApi } from '@/lib/api/matching-supply';
import { useMasters } from '@/hooks/useMasters';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { SupplyPosting } from '@/types/api';

const PREFECTURE_OPTIONS = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
].map((p) => ({ value: p, label: p }));

const SKILL_LEVEL_LABELS: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
  expert: 'エキスパート',
};

export function SupplyListPage() {
  const navigate = useNavigate();
  const { data: masters, isLoading: mastersLoading } = useMasters();

  const [postings, setPostings] = useState<SupplyPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterPrefecture, setFilterPrefecture] = useState('');
  const [filterWorkTypeId, setFilterWorkTypeId] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (filterPrefecture) params.prefecture = filterPrefecture;
        if (filterWorkTypeId) params.workTypeId = filterWorkTypeId;
        const res = await matchingSupplyApi.list(params);
        setPostings(res.data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '一覧の取得に失敗しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [filterPrefecture, filterWorkTypeId]);

  const workTypeOptions = (masters?.workTypes || []).map((wt) => ({
    value: wt.id,
    label: wt.workTypeName,
  }));

  return (
    <>
      <AppHeader title="人材一覧" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Filters */}
          <Card className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-800">絞り込み</h2>
            <div className="grid grid-cols-2 gap-3">
              <Select
                options={PREFECTURE_OPTIONS}
                placeholder="都道府県"
                value={filterPrefecture}
                onChange={(e) => setFilterPrefecture(e.target.value)}
              />
              {!mastersLoading && (
                <Select
                  options={workTypeOptions}
                  placeholder="工種"
                  value={filterWorkTypeId}
                  onChange={(e) => setFilterWorkTypeId(e.target.value)}
                />
              )}
            </div>
          </Card>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && <LoadingSpinner />}

          {!loading && postings.length === 0 && (
            <EmptyState message="該当する人材情報がありません" />
          )}

          {/* Posting cards */}
          <div className="space-y-3">
            {postings.map((posting) => (
              <Card
                key={posting.id}
                className="cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50"
                onClick={() => navigate(`/matching/supply/${posting.id}`)}
              >
                <div className="space-y-2">
                  {/* Header row */}
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded font-medium ${
                        posting.contractType === 'daily_rate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {posting.contractType === 'daily_rate' ? '単価' : '請負'}
                    </span>
                    {posting.workType && (
                      <span className="text-gray-600">{posting.workType.workTypeName}</span>
                    )}
                    <Badge status={posting.status} className="ml-auto" />
                  </div>

                  {/* Worker info */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {posting.user
                        ? `${posting.user.lastName?.charAt(0) || ''}${posting.user.firstName?.charAt(0) || ''}`
                        : '--'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {posting.title || (posting.user ? `${posting.user.lastName} ${posting.user.firstName}` : '---')}
                      </p>
                      {posting.user && posting.title && (
                        <p className="text-xs text-gray-500">
                          {posting.user.lastName} {posting.user.firstName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{posting.availablePrefecture}{posting.availableArea ? ` ${posting.availableArea}` : ''}</span>
                    <span>
                      {formatDate(posting.availableStart, 'M/d')}〜{formatDate(posting.availableEnd, 'M/d')}
                    </span>
                  </div>

                  {/* Rate and skill */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {posting.desiredDailyRate
                        ? `${formatCurrency(posting.desiredDailyRate)}/日`
                        : '単価未設定'}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      {posting.skillLevel && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded">
                          {SKILL_LEVEL_LABELS[posting.skillLevel] || posting.skillLevel}
                        </span>
                      )}
                      {posting.experienceYears != null && (
                        <span className="text-gray-500">経験{posting.experienceYears}年</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
