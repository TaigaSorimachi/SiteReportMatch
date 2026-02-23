import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { reportsApi } from '@/lib/api/reports';
import { formatDate } from '@/lib/utils';
import type { DailyReport } from '@/types/api';

const WEATHER_LABELS: Record<string, string> = {
  sunny: '晴れ',
  cloudy: '曇り',
  rainy: '雨',
  snowy: '雪',
  stormy: '嵐',
};

function DetailRow({ label, value }: { label: string; value: string | number | undefined | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right ml-4">
        {value !== undefined && value !== null && value !== '' ? String(value) : '-'}
      </span>
    </div>
  );
}

function formatTime(isoString: string | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch {
    return isoString;
  }
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await reportsApi.detail(id);
        setReport(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '日報の取得に失敗しました';
        alert(message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const canReview =
    user &&
    (user.role === 'admin' || user.role === 'owner') &&
    report?.status === 'submitted';

  const handleApprove = async () => {
    if (!report) return;
    setIsProcessing(true);
    try {
      const updated = await reportsApi.approve(report.id);
      setReport(updated as DailyReport);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '承認に失敗しました';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!report) return;
    const reason = window.prompt('差戻し理由を入力してください');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('差戻し理由を入力してください');
      return;
    }
    setIsProcessing(true);
    try {
      const updated = await reportsApi.reject(report.id, reason.trim());
      setReport(updated as DailyReport);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '差戻しに失敗しました';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <AppHeader title="日報詳細" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (!report) {
    return (
      <>
        <AppHeader title="日報詳細" showBack />
        <PageContainer>
          <p className="text-center text-gray-500 py-12">日報が見つかりませんでした</p>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <AppHeader title="日報詳細" showBack />
      <PageContainer>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              {formatDate(report.reportDate)}
            </h2>
            <Badge status={report.status} />
          </div>

          <Card>
            <DetailRow label="プロジェクト" value={report.project?.projectName} />
            <DetailRow label="報告日" value={formatDate(report.reportDate)} />
            <DetailRow label="入力方式" value={report.inputMode === 'batch' ? 'まとめ入力' : 'リアルタイム'} />
            <DetailRow label="出勤時間" value={formatTime(report.clockIn)} />
            <DetailRow label="退勤時間" value={formatTime(report.clockOut)} />
            <DetailRow label="休憩時間" value={report.breakMinutes != null ? `${report.breakMinutes} 分` : undefined} />
            <DetailRow label="実働時間" value={report.workMinutes != null ? `${report.workMinutes} 分` : undefined} />
            <DetailRow label="人工" value={report.manDays != null ? `${report.manDays} 人工` : undefined} />
            <DetailRow label="残業時間" value={report.overtimeMinutes != null ? `${report.overtimeMinutes} 分` : undefined} />
            <DetailRow label="進捗率" value={report.progressPct != null ? `${report.progressPct}%` : undefined} />
            <DetailRow label="天気" value={report.weather ? (WEATHER_LABELS[report.weather] ?? report.weather) : undefined} />
          </Card>

          {report.workContent && (
            <Card>
              <p className="text-sm text-gray-500 mb-1">作業内容</p>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{report.workContent}</p>
            </Card>
          )}

          {report.photos && report.photos.length > 0 && (
            <Card>
              <p className="text-sm text-gray-500 mb-2">写真</p>
              <div className="grid grid-cols-3 gap-2">
                {report.photos.map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.photoUrl}
                      alt={photo.caption || '現場写真'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {report.safetyRecords && report.safetyRecords.length > 0 && (
            <Card>
              <p className="text-sm text-gray-500 mb-2">安全記録</p>
              {report.safetyRecords.map((record) => (
                <div key={record.id} className="space-y-1 py-2 border-b border-gray-100 last:border-b-0">
                  {record.kyTheme && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">KYテーマ:</span> {record.kyTheme}
                    </p>
                  )}
                  {record.hazardDescription && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">危険内容:</span> {record.hazardDescription}
                    </p>
                  )}
                  {record.countermeasure && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">対策:</span> {record.countermeasure}
                    </p>
                  )}
                </div>
              ))}
            </Card>
          )}

          {report.costItems && report.costItems.length > 0 && (
            <Card>
              <p className="text-sm text-gray-500 mb-2">経費</p>
              {report.costItems.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm text-gray-700">{item.itemName}</span>
                  <span className="text-sm text-gray-900 font-medium">
                    {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(item.amount)}
                  </span>
                </div>
              ))}
            </Card>
          )}

          {canReview && (
            <div className="space-y-2 pt-2">
              <Button onClick={handleApprove} disabled={isProcessing}>
                {isProcessing ? '処理中...' : '承認'}
              </Button>
              <Button variant="danger" onClick={handleReject} disabled={isProcessing}>
                {isProcessing ? '処理中...' : '差戻し'}
              </Button>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
