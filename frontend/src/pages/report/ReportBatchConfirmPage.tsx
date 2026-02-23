import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { reportsApi } from '@/lib/api/reports';

const SESSION_KEY = 'srm_batch_report_form';

const WEATHER_LABELS: Record<string, string> = {
  sunny: '晴れ',
  cloudy: '曇り',
  rainy: '雨',
  snowy: '雪',
  stormy: '嵐',
};

interface StoredFormData {
  projectId: string;
  projectName: string;
  reportDate: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: string;
  workContent: string;
  progressPct: string;
  weather: string;
}

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right ml-4">{value || '-'}</span>
    </div>
  );
}

export function ReportBatchConfirmPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StoredFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (!stored) {
      alert('フォームデータが見つかりません。入力画面に戻ります。');
      navigate('/report/batch', { replace: true });
      return;
    }
    try {
      setFormData(JSON.parse(stored));
    } catch {
      alert('フォームデータの読み込みに失敗しました');
      navigate('/report/batch', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    try {
      const dto = {
        projectId: formData.projectId,
        reportDate: formData.reportDate,
        inputMode: 'batch',
        clockIn: `${formData.reportDate}T${formData.clockIn}:00`,
        clockOut: `${formData.reportDate}T${formData.clockOut}:00`,
        breakMinutes: Number(formData.breakMinutes) || 0,
        workContent: formData.workContent,
        progressPct: Number(formData.progressPct) || 0,
        weather: formData.weather || undefined,
      };

      const report = await reportsApi.createBatch(dto);
      await reportsApi.submit(report.id);

      sessionStorage.removeItem(SESSION_KEY);
      setIsSuccess(true);

      setTimeout(() => {
        navigate('/report/history', { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '提出に失敗しました';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return (
      <>
        <AppHeader title="確認" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <AppHeader title="確認" showBack={false} showNotification={false} />
        <PageContainer>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-gray-800">日報を提出しました</p>
            <p className="text-sm text-gray-500">日報履歴ページへ移動します...</p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <AppHeader title="確認" showBack />
      <PageContainer>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">以下の内容で日報を提出します。内容をご確認ください。</p>

          <Card>
            <ConfirmRow label="プロジェクト" value={formData.projectName} />
            <ConfirmRow label="報告日" value={formData.reportDate} />
            <ConfirmRow label="出勤時間" value={formData.clockIn} />
            <ConfirmRow label="退勤時間" value={formData.clockOut} />
            <ConfirmRow label="休憩時間" value={`${formData.breakMinutes} 分`} />
            <ConfirmRow label="進捗率" value={`${formData.progressPct}%`} />
            <ConfirmRow label="天気" value={WEATHER_LABELS[formData.weather] ?? formData.weather} />
          </Card>

          <Card>
            <p className="text-sm text-gray-500 mb-1">作業内容</p>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{formData.workContent}</p>
          </Card>

          <div className="space-y-2 pt-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? '提出中...' : '提出'}
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
              修正する
            </Button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
