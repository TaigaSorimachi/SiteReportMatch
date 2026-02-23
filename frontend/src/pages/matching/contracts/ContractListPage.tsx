import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchingContractsApi } from '@/lib/api/matching-contracts';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { MatchContract } from '@/types/api';

const STATUS_OPTIONS = [
  { value: 'active', label: '稼働中' },
  { value: 'completed', label: '完了' },
  { value: 'cancelled', label: 'キャンセル' },
];

export function ContractListPage() {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<MatchContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (filterStatus) params.status = filterStatus;
        const res = await matchingContractsApi.list(params);
        setContracts(res.data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '成約一覧の取得に失敗しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [filterStatus]);

  return (
    <>
      <AppHeader title="成約一覧" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Filter */}
          <Card className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-800">絞り込み</h2>
            <Select
              options={STATUS_OPTIONS}
              placeholder="すべてのステータス"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            />
          </Card>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && <LoadingSpinner />}

          {!loading && contracts.length === 0 && (
            <EmptyState message="成約がありません" />
          )}

          {/* Contract cards */}
          <div className="space-y-3">
            {contracts.map((contract) => (
              <Card
                key={contract.id}
                className="cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50"
                onClick={() => navigate(`/matching/contracts/${contract.id}`)}
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {contract.contractType === 'daily_rate' ? '単価契約' : '請負契約'}
                    </span>
                    <Badge status={contract.status} />
                  </div>

                  {/* Parties */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-12 flex-shrink-0">発注元</span>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contract.clientCompany?.companyName || '---'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-12 flex-shrink-0">作業者</span>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {contract.workerUser
                          ? `${contract.workerUser.lastName} ${contract.workerUser.firstName}`
                          : '---'}
                      </p>
                    </div>
                  </div>

                  {/* Date and rate */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {contract.workDateStart && contract.workDateEnd
                        ? `${formatDate(contract.workDateStart, 'M/d')}〜${formatDate(contract.workDateEnd, 'M/d')}`
                        : '期間未定'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {contract.agreedRate
                        ? `${formatCurrency(contract.agreedRate)}/日`
                        : '---'}
                    </span>
                  </div>

                  {/* Created date */}
                  <p className="text-xs text-gray-400">
                    成約日: {formatDate(contract.createdAt)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
