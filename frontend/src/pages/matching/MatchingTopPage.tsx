import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { StaffingBar } from '@/components/domain/StaffingBar';
import { WorkerChip } from '@/components/domain/WorkerChip';
import { matchingContractsApi } from '@/lib/api/matching-contracts';
import { workersApi } from '@/lib/api/workers';
import { formatDateWithDay } from '@/lib/utils';
import type { DashboardResponse } from '@/types/api';

interface AvailableWorker {
  id: string;
  lastName: string;
  firstName: string;
  avatarUrl?: string | null;
  avgRating?: number;
  workTypeName?: string;
}

const actionCards = [
  {
    label: '募集する',
    description: '人手を集めたい案件を登録',
    to: '/matching/demand/create',
    icon: 'M12 4v16m8-8H4',
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  {
    label: '仕事を探す',
    description: '公開中の案件を検索',
    to: '/matching/demand/search',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: '人材を公開',
    description: '空き人員を公開して依頼を受ける',
    to: '/matching/supply/create',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    label: '応募管理',
    description: '応募状況の確認・管理',
    to: '/matching/demand/search?filter=my',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
] as const;

export function MatchingTopPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [availableWorkers, setAvailableWorkers] = useState<AvailableWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [dashRes, workersRes] = await Promise.all([
          matchingContractsApi.getDashboard(),
          workersApi.findAvailable({ limit: 20 }),
        ]);
        setDashboard(dashRes);
        setAvailableWorkers(workersRes.data ?? []);
      } catch {
        setError('データの取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <>
        <AppHeader title="マッチング" />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader title="マッチング" />
        <PageContainer>
          <EmptyState message={error} />
        </PageContainer>
      </>
    );
  }

  const shortages = (dashboard?.staffingDetails ?? []).filter(
    (d: any) => (d.shortage ?? 0) > 0,
  );

  return (
    <>
      <AppHeader title="マッチング" />
      <PageContainer>
        {/* ── Action Cards 2x2 ── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {actionCards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className={`rounded-xl border p-4 text-left space-y-2 transition active:scale-[0.98] ${card.color}`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
              <p className="text-sm font-bold">{card.label}</p>
              <p className="text-xs opacity-70">{card.description}</p>
            </button>
          ))}
        </div>

        {/* ── Weekly staffing ── */}
        {dashboard && dashboard.dailySummary.length > 0 && (
          <Card className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">今週の人員状況</h2>
            <div className="space-y-1">
              {dashboard.dailySummary.map((day) => (
                <StaffingBar
                  key={day.date}
                  label={formatDateWithDay(day.date)}
                  required={day.required}
                  confirmed={day.confirmed}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex gap-4 text-xs text-gray-500">
                <span>公開案件: <span className="font-semibold text-gray-900">{dashboard.openDemands}</span></span>
                <span>稼働中契約: <span className="font-semibold text-gray-900">{dashboard.activeContracts}</span></span>
              </div>
            </div>
          </Card>
        )}

        {/* ── Shortages ── */}
        {shortages.length > 0 && (
          <Card className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-3">不足案件</h2>
            <div className="space-y-3">
              {shortages.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-gray-900">
                      {item.siteName ?? item.projectName ?? `案件 #${idx + 1}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.workTypeName && <span className="mr-2">{item.workTypeName}</span>}
                      {item.targetDate && <span>{formatDateWithDay(item.targetDate)}</span>}
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      不足: {item.shortage}名 (必要{item.required}名 / 確定{item.confirmed}名)
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-auto shrink-0"
                    onClick={() => navigate('/matching/demand/create')}
                  >
                    募集を作成する
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Available Workers ── */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-gray-900 mb-3">待機中の人材</h2>
          {availableWorkers.length === 0 ? (
            <EmptyState message="現在待機中の人材はいません" />
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
              {availableWorkers.map((w) => (
                <WorkerChip
                  key={w.id}
                  name={`${w.lastName} ${w.firstName}`}
                  rating={w.avgRating}
                  workType={w.workTypeName}
                  avatarUrl={w.avatarUrl}
                  onClick={() => navigate(`/matching/supply?worker=${w.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
