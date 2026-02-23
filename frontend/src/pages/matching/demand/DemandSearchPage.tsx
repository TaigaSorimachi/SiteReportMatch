import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { PostingCard } from '@/components/domain/PostingCard';
import { matchingDemandApi } from '@/lib/api/matching-demand';
import { useMasters } from '@/hooks/useMasters';
import type { DemandPosting, PaginatedResponse } from '@/types/api';

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
];

const CONTRACT_TYPE_OPTIONS = [
  { value: 'daily_rate', label: '日当単価' },
  { value: 'fixed_price', label: '請負' },
];

const PAGE_SIZE = 10;

export function DemandSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: masters } = useMasters();

  const [prefecture, setPrefecture] = useState(searchParams.get('prefecture') ?? '');
  const [workTypeId, setWorkTypeId] = useState(searchParams.get('workTypeId') ?? '');
  const [contractType, setContractType] = useState(searchParams.get('contractType') ?? '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') ?? '');

  const [postings, setPostings] = useState<DemandPosting[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<DemandPosting>['meta'] | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const workTypeOptions = (masters?.workTypes ?? []).map((wt) => ({
    value: wt.id,
    label: wt.workTypeName,
  }));

  const prefectureOptions = PREFECTURES.map((p) => ({ value: p, label: p }));

  const buildParams = useCallback(
    (pageNum: number) => {
      const params: Record<string, string | number> = {
        page: pageNum,
        limit: PAGE_SIZE,
      };
      if (prefecture) params.prefecture = prefecture;
      if (workTypeId) params.workTypeId = workTypeId;
      if (contractType) params.contractType = contractType;
      if (dateFrom) params.dateFrom = dateFrom;
      const filter = searchParams.get('filter');
      if (filter) params.filter = filter;
      return params;
    },
    [prefecture, workTypeId, contractType, dateFrom, searchParams],
  );

  const fetchPostings = useCallback(
    async (pageNum: number, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      try {
        const res = await matchingDemandApi.list(buildParams(pageNum));
        if (append) {
          setPostings((prev) => [...prev, ...res.data]);
        } else {
          setPostings(res.data);
        }
        setMeta(res.meta);
        setPage(pageNum);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [buildParams],
  );

  useEffect(() => {
    fetchPostings(1);
  }, [fetchPostings]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (prefecture) params.set('prefecture', prefecture);
    if (workTypeId) params.set('workTypeId', workTypeId);
    if (contractType) params.set('contractType', contractType);
    if (dateFrom) params.set('dateFrom', dateFrom);
    const filter = searchParams.get('filter');
    if (filter) params.set('filter', filter);
    setSearchParams(params);
    fetchPostings(1);
  };

  const handleLoadMore = () => {
    if (meta && page < meta.totalPages) {
      fetchPostings(page + 1, true);
    }
  };

  const hasMore = meta ? page < meta.totalPages : false;

  return (
    <>
      <AppHeader title="仕事を探す" showBack />
      <PageContainer>
        {/* ── Filter bar ── */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-2">
            <Select
              placeholder="都道府県"
              options={prefectureOptions}
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
            />
            <Select
              placeholder="工種"
              options={workTypeOptions}
              value={workTypeId}
              onChange={(e) => setWorkTypeId(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              placeholder="契約形態"
              options={CONTRACT_TYPE_OPTIONS}
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
            />
            <Input
              type="date"
              placeholder="開始日以降"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <Button variant="primary" size="sm" onClick={handleSearch}>
            検索する
          </Button>
        </div>

        {/* ── Results ── */}
        {isLoading ? (
          <LoadingSpinner />
        ) : postings.length === 0 ? (
          <EmptyState message="条件に合う募集が見つかりませんでした" />
        ) : (
          <>
            {meta && (
              <p className="text-xs text-gray-500 mb-3">
                {meta.total}件中 {postings.length}件表示
              </p>
            )}
            <div className="space-y-3">
              {postings.map((posting) => (
                <PostingCard
                  key={posting.id}
                  contractType={posting.contractType}
                  workTypeName={posting.workType?.workTypeName}
                  siteName={posting.siteName}
                  prefecture={posting.sitePrefecture}
                  city={posting.siteCity}
                  dateStart={posting.workDateStart}
                  dateEnd={posting.workDateEnd}
                  count={posting.requiredCount}
                  dailyRateMin={posting.dailyRateMin}
                  dailyRateMax={posting.dailyRateMax}
                  fixedPrice={posting.fixedPrice}
                  status={posting.status}
                  tags={[
                    ...(posting.providesParking ? ['駐車場あり'] : []),
                    ...(posting.providesTools ? ['工具貸出'] : []),
                    ...(posting.providesMeals ? ['食事あり'] : []),
                    ...(posting.ccusRequired ? ['CCUS必須'] : []),
                  ]}
                  onClick={() => navigate(`/matching/demand/${posting.id}`)}
                />
              ))}
            </div>

            {/* ── Load more ── */}
            {hasMore && (
              <div className="mt-4">
                <Button
                  variant="secondary"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? '読み込み中...' : 'もっと見る'}
                </Button>
              </div>
            )}
          </>
        )}
      </PageContainer>
    </>
  );
}
