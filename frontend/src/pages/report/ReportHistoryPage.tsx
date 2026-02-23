import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { reportsApi } from '@/lib/api/reports';
import { formatDate } from '@/lib/utils';
import type { DailyReport } from '@/types/api';

const PAGE_LIMIT = 10;

export function ReportHistoryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadReports = useCallback(async (targetPage: number, append = false) => {
    const setLoadState = append ? setIsLoadingMore : setIsLoading;
    setLoadState(true);
    try {
      const res = await reportsApi.list({ page: targetPage, limit: PAGE_LIMIT, sort: '-reportDate' });
      if (append) {
        setReports((prev) => [...prev, ...res.data]);
      } else {
        setReports(res.data);
      }
      setTotalPages(res.meta.totalPages);
      setPage(targetPage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '日報一覧の取得に失敗しました';
      alert(message);
    } finally {
      setLoadState(false);
    }
  }, []);

  useEffect(() => {
    loadReports(1);
  }, [loadReports]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      loadReports(page + 1, true);
    }
  };

  return (
    <>
      <AppHeader title="日報履歴" showBack />
      <PageContainer>
        {isLoading ? (
          <LoadingSpinner />
        ) : reports.length === 0 ? (
          <EmptyState message="日報がまだありません" />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Card
                key={report.id}
                className="cursor-pointer hover:border-green-400 hover:shadow-md transition-all active:bg-gray-50"
                onClick={() => navigate(`/report/history/${report.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(report.reportDate)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {report.project?.projectName ?? 'プロジェクト不明'}
                    </p>
                  </div>
                  <Badge status={report.status} />
                </div>
                {report.workContent && (
                  <p className="text-xs text-gray-600 line-clamp-2">{report.workContent}</p>
                )}
              </Card>
            ))}

            {page < totalPages && (
              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? '読み込み中...' : 'さらに表示'}
                </Button>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}
