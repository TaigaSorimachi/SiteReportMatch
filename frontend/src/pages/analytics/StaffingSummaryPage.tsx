import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { matchingContractsApi } from '@/lib/api/matching-contracts';
import { formatDateWithDay } from '@/lib/utils';
import type { DashboardResponse } from '@/types/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function StaffingSummaryPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await matchingContractsApi.getDashboard();
        setDashboard(data);
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
        <AppHeader title="稼働サマリー" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error || !dashboard) {
    return (
      <>
        <AppHeader title="稼働サマリー" showBack />
        <PageContainer>
          <div className="text-center py-12 text-red-500 text-sm">{error ?? 'データがありません'}</div>
        </PageContainer>
      </>
    );
  }

  const chartData = dashboard.dailySummary.map((d) => ({
    date: formatDateWithDay(d.date),
    確定: d.confirmed,
    不足: d.shortage,
  }));

  const totalRequired = dashboard.dailySummary.reduce((sum, d) => sum + d.required, 0);
  const totalConfirmed = dashboard.dailySummary.reduce((sum, d) => sum + d.confirmed, 0);
  const totalShortage = dashboard.dailySummary.reduce((sum, d) => sum + d.shortage, 0);

  return (
    <>
      <AppHeader title="稼働サマリー" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center">
              <p className="text-xs text-gray-500">必要人数</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequired}</p>
              <p className="text-xs text-gray-400">人日</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-500">確定人数</p>
              <p className="text-2xl font-bold text-green-600">{totalConfirmed}</p>
              <p className="text-xs text-gray-400">人日</p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-gray-500">不足数</p>
              <p className="text-2xl font-bold text-red-600">{totalShortage}</p>
              <p className="text-xs text-gray-400">人日</p>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card>
            <h2 className="text-sm font-bold text-gray-800 mb-3">
              週次稼働状況（{formatDateWithDay(dashboard.weekStart)} 〜 {formatDateWithDay(dashboard.weekEnd)}）
            </h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="確定" stackId="staffing" fill="#22c55e" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="不足" stackId="staffing" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Additional info */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">公開中の求人</p>
                <p className="text-lg font-bold text-gray-900">{dashboard.openDemands}件</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">稼働中の契約</p>
                <p className="text-lg font-bold text-gray-900">{dashboard.activeContracts}件</p>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
