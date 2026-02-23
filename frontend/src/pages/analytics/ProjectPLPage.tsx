import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { projectsApi } from '@/lib/api/projects';
import { accountingApi } from '@/lib/api/accounting';
import { formatCurrency } from '@/lib/utils';
import type { Project, CostSummary } from '@/types/api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const CATEGORY_LABELS: Record<string, string> = {
  labor: '労務費',
  material: '材料費',
  equipment: '機械経費',
  subcontract: '外注費',
  transport: '運搬費',
  overhead: '諸経費',
  other: 'その他',
};

export function ProjectPLPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [costSummary, setCostSummary] = useState<CostSummary | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await projectsApi.list({ limit: 100 });
        setProjects(res.data);
      } catch {
        setError('プロジェクトの取得に失敗しました');
      } finally {
        setIsLoadingProjects(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setCostSummary(null);
      setSelectedProject(null);
      return;
    }

    const project = projects.find((p) => p.id === selectedProjectId) ?? null;
    setSelectedProject(project);

    (async () => {
      setIsLoadingCost(true);
      setError(null);
      try {
        const data = await accountingApi.getCostSummary(selectedProjectId);
        setCostSummary(data);
      } catch {
        setError('収支データの取得に失敗しました');
        setCostSummary(null);
      } finally {
        setIsLoadingCost(false);
      }
    })();
  }, [selectedProjectId, projects]);

  if (isLoadingProjects) {
    return (
      <>
        <AppHeader title="案件収支" showBack />
        <LoadingSpinner />
      </>
    );
  }

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.projectName,
  }));

  const pieData =
    costSummary?.byCategory.map((c) => ({
      name: CATEGORY_LABELS[c.category] ?? c.category,
      value: c.total,
    })) ?? [];

  const contractAmount = selectedProject?.contractAmount ?? 0;
  const totalCost = costSummary?.totalCost ?? 0;
  const profit = contractAmount - totalCost;
  const profitRate = contractAmount > 0 ? ((profit / contractAmount) * 100).toFixed(1) : '---';

  return (
    <>
      <AppHeader title="案件収支" showBack />
      <PageContainer>
        <div className="space-y-4">
          <Select
            label="プロジェクト選択"
            placeholder="プロジェクトを選択してください"
            options={projectOptions}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          />

          {error && (
            <div className="text-center py-4 text-red-500 text-sm">{error}</div>
          )}

          {isLoadingCost && <LoadingSpinner />}

          {!selectedProjectId && !isLoadingCost && (
            <EmptyState message="プロジェクトを選択すると収支情報が表示されます" />
          )}

          {selectedProjectId && costSummary && !isLoadingCost && (
            <>
              {/* Contract vs Cost Comparison */}
              <Card>
                <h2 className="text-sm font-bold text-gray-800 mb-3">収支概要</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">契約金額</span>
                    <span className="text-base font-bold text-gray-900">
                      {contractAmount > 0 ? formatCurrency(contractAmount) : '未設定'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">総原価</span>
                    <span className="text-base font-bold text-red-600">{formatCurrency(totalCost)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">粗利</span>
                    <span
                      className={`text-lg font-bold ${
                        profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {contractAmount > 0 ? formatCurrency(profit) : '---'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">粗利率</span>
                    <span
                      className={`text-sm font-medium ${
                        profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {profitRate}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {contractAmount > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>原価消化率</span>
                      <span>{((totalCost / contractAmount) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          totalCost / contractAmount > 1 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((totalCost / contractAmount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Pie Chart */}
              {pieData.length > 0 ? (
                <Card>
                  <h2 className="text-sm font-bold text-gray-800 mb-3">原価内訳</h2>
                  <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }: { name?: string; percent?: number }) =>
                            `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          labelLine={false}
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                          contentStyle={{ fontSize: 12, borderRadius: 8 }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              ) : (
                <EmptyState message="原価データがありません" />
              )}

              {/* Category breakdown table */}
              {costSummary.byCategory.length > 0 && (
                <Card>
                  <h2 className="text-sm font-bold text-gray-800 mb-3">カテゴリ別明細</h2>
                  <div className="space-y-2">
                    {costSummary.byCategory.map((c, i) => (
                      <div key={c.category} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-sm text-gray-700">
                            {CATEGORY_LABELS[c.category] ?? c.category}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(c.total)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">合計</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </PageContainer>
    </>
  );
}
