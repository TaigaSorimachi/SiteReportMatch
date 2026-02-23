import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { reportsApi } from '@/lib/api/reports';

const STORAGE_KEY = 'srm_active_report';

const weatherOptions = [
  { value: 'sunny', label: '晴れ' },
  { value: 'cloudy', label: '曇り' },
  { value: 'rainy', label: '雨' },
  { value: 'snowy', label: '雪' },
  { value: 'windy', label: '強風' },
];

export function ReportRealtimeSupplementPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();

  const [workContent, setWorkContent] = useState('');
  const [progressPct, setProgressPct] = useState<number | ''>('');
  const [weather, setWeather] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId || submitting) return;

    if (!workContent.trim()) {
      setError('作業内容を入力してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await reportsApi.update(reportId, {
        workContent: workContent.trim(),
        progressPct: progressPct !== '' ? Number(progressPct) : undefined,
        weather: weather || undefined,
      });

      await reportsApi.submit(reportId);

      localStorage.removeItem(STORAGE_KEY);

      navigate('/report/history');
    } catch (err: any) {
      setError(err.message || '提出に失敗しました');
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="補足入力" showBack />
      <PageContainer>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Work content textarea */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              作業内容<span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition
                focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
              rows={5}
              placeholder="本日の作業内容を入力してください"
              value={workContent}
              onChange={(e) => setWorkContent(e.target.value)}
              required
            />
          </div>

          {/* Progress percentage */}
          <Input
            label="進捗率"
            type="number"
            min={0}
            max={100}
            step={1}
            placeholder="0 ~ 100"
            value={progressPct}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setProgressPct('');
              } else {
                const num = Math.min(100, Math.max(0, parseInt(val, 10)));
                setProgressPct(isNaN(num) ? '' : num);
              }
            }}
          />

          {/* Weather */}
          <Select
            label="天気"
            options={weatherOptions}
            placeholder="選択してください"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          />

          {/* Submit button */}
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? '提出中...' : '日報を提出する'}
          </Button>
        </form>
      </PageContainer>
    </>
  );
}
