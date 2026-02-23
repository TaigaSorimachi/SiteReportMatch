import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { matchingContractsApi } from '@/lib/api/matching-contracts';
import { formatNumber } from '@/lib/utils';
import type { KpiResponse } from '@/types/api';

interface KpiCardProps {
  label: string;
  value: string;
  subLabel?: string;
  color?: string;
}

function KpiCard({ label, value, subLabel, color = 'text-gray-900' }: KpiCardProps) {
  return (
    <Card className="text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {subLabel && <p className="text-xs text-gray-400 mt-0.5">{subLabel}</p>}
    </Card>
  );
}

export function MatchingKpiPage() {
  const [kpi, setKpi] = useState<KpiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await matchingContractsApi.getKpi();
        setKpi(data);
      } catch {
        setError('KPIデータの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <>
        <AppHeader title="マッチングKPI" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error || !kpi) {
    return (
      <>
        <AppHeader title="マッチングKPI" showBack />
        <PageContainer>
          <div className="text-center py-12 text-red-500 text-sm">{error ?? 'データがありません'}</div>
        </PageContainer>
      </>
    );
  }

  const avgMatchTime =
    kpi.matching.avgTimeToMatchHours !== null
      ? `${kpi.matching.avgTimeToMatchHours.toFixed(1)}h`
      : '---';

  const avgRating =
    kpi.reviews.avgRating !== null ? kpi.reviews.avgRating.toFixed(1) : '---';

  return (
    <>
      <AppHeader title="マッチングKPI" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Contract KPIs */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">契約状況</h2>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="総契約数"
                value={formatNumber(kpi.contracts.total)}
                subLabel="件"
              />
              <KpiCard
                label="稼働中"
                value={formatNumber(kpi.contracts.active)}
                subLabel="件"
                color="text-green-600"
              />
              <KpiCard
                label="完了"
                value={formatNumber(kpi.contracts.completed)}
                subLabel="件"
                color="text-blue-600"
              />
              <KpiCard
                label="キャンセル"
                value={formatNumber(kpi.contracts.cancelled)}
                subLabel="件"
                color="text-red-600"
              />
            </div>
          </div>

          {/* Cancel Rate */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">キャンセル率</p>
                <p className={`text-3xl font-bold ${kpi.contracts.cancelRate > 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {kpi.contracts.cancelRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={kpi.contracts.cancelRate > 10 ? 'text-red-500' : 'text-green-500'}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${kpi.contracts.cancelRate}, 100`}
                  />
                </svg>
              </div>
            </div>
          </Card>

          {/* Matching Performance */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">マッチング実績</h2>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="平均マッチング時間"
                value={avgMatchTime}
                color="text-purple-600"
              />
              <KpiCard
                label="平均評価"
                value={avgRating}
                subLabel={`(${formatNumber(kpi.reviews.totalReviews)}件)`}
                color="text-yellow-600"
              />
            </div>
          </div>

          {/* Fill Rate */}
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-2">求人充足率</h2>
            <Card>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">充足率</span>
                  <span className="text-2xl font-bold text-green-600">
                    {kpi.demand.fillRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-green-500 transition-all"
                    style={{ width: `${Math.min(kpi.demand.fillRate, 100)}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">総求人数</p>
                    <p className="text-sm font-bold text-gray-900">{formatNumber(kpi.demand.total)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">公開中</p>
                    <p className="text-sm font-bold text-blue-600">{formatNumber(kpi.demand.open)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">充足済</p>
                    <p className="text-sm font-bold text-green-600">{formatNumber(kpi.demand.filled)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
