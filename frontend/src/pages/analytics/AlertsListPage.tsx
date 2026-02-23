import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { accountingApi } from '@/lib/api/accounting';
import { workersApi } from '@/lib/api/workers';
import { reportsApi } from '@/lib/api/reports';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Invoice, DailyReport } from '@/types/api';

interface AvailableWorker {
  id: string;
  lastName: string;
  firstName: string;
  availability?: string;
  [key: string]: unknown;
}

export function AlertsListPage() {
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [availableWorkers, setAvailableWorkers] = useState<AvailableWorker[]>([]);
  const [draftReports, setDraftReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const loadErrors: string[] = [];

    const loadAll = async () => {
      const results = await Promise.allSettled([
        accountingApi.listInvoices({ status: 'issued', sort: 'dueDate:asc' }),
        workersApi.findAvailable(),
        reportsApi.list({ status: 'draft' }),
      ]);

      if (results[0].status === 'fulfilled') {
        setOverdueInvoices(results[0].value.data);
      } else {
        loadErrors.push('請求書データの取得に失敗しました');
      }

      if (results[1].status === 'fulfilled') {
        setAvailableWorkers(results[1].value.data);
      } else {
        loadErrors.push('待機人材データの取得に失敗しました');
      }

      if (results[2].status === 'fulfilled') {
        setDraftReports(results[2].value.data);
      } else {
        loadErrors.push('日報データの取得に失敗しました');
      }

      setErrors(loadErrors);
      setIsLoading(false);
    };

    loadAll();
  }, []);

  if (isLoading) {
    return (
      <>
        <AppHeader title="アラート" showBack />
        <LoadingSpinner />
      </>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const overdueItems = overdueInvoices.filter((inv) => inv.dueDate < today);
  const totalAlerts = overdueItems.length + availableWorkers.length + draftReports.length;

  return (
    <>
      <AppHeader title="アラート" showBack />
      <PageContainer>
        <div className="space-y-4">
          {errors.length > 0 && (
            <div className="space-y-1">
              {errors.map((err, i) => (
                <div key={i} className="text-xs text-red-500 bg-red-50 rounded-lg p-2">
                  {err}
                </div>
              ))}
            </div>
          )}

          {totalAlerts === 0 && errors.length === 0 && (
            <Card className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto text-green-500 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">アラートはありません</p>
              <p className="text-xs text-gray-500 mt-1">全ての項目が正常です</p>
            </Card>
          )}

          {/* Overdue Invoices */}
          {overdueItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <h2 className="text-sm font-bold text-gray-800">
                  支払期限超過の請求書
                </h2>
                <span className="text-xs font-medium text-red-600 bg-red-100 rounded-full px-2 py-0.5">
                  {overdueItems.length}件
                </span>
              </div>
              <div className="space-y-2">
                {overdueItems.map((inv) => (
                  <Card key={inv.id} className="border-l-4 border-l-red-500">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{inv.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          支払期限: {formatDate(inv.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {formatCurrency(inv.totalAmount)}
                        </p>
                        <Badge status={inv.status} className="mt-1" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                        />
                      </svg>
                      <span>
                        {Math.ceil(
                          (new Date(today).getTime() - new Date(inv.dueDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                        日超過
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Available Workers */}
          {availableWorkers.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <h2 className="text-sm font-bold text-gray-800">
                  待機中の人材
                </h2>
                <span className="text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full px-2 py-0.5">
                  {availableWorkers.length}名
                </span>
              </div>
              <div className="space-y-2">
                {availableWorkers.map((worker) => (
                  <Card key={worker.id} className="border-l-4 border-l-yellow-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {worker.lastName} {worker.firstName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {worker.availability === 'available' ? '即日対応可' : '待機中'}
                          </p>
                        </div>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Draft Reports */}
          {draftReports.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <h2 className="text-sm font-bold text-gray-800">
                  未提出の日報
                </h2>
                <span className="text-xs font-medium text-orange-700 bg-orange-100 rounded-full px-2 py-0.5">
                  {draftReports.length}件
                </span>
              </div>
              <div className="space-y-2">
                {draftReports.map((report) => (
                  <Card key={report.id} className="border-l-4 border-l-orange-500">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {report.project?.projectName ?? '---'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(report.reportDate)}
                        </p>
                        {report.worker && (
                          <p className="text-xs text-gray-500">
                            {report.worker.lastName} {report.worker.firstName}
                          </p>
                        )}
                      </div>
                      <Badge status={report.status} />
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </PageContainer>
    </>
  );
}
