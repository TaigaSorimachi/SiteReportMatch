import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { projectsApi } from '@/lib/api/projects';
import type { Project } from '@/types/api';

const WEATHER_OPTIONS = [
  { value: '', label: '選択してください' },
  { value: 'sunny', label: '晴れ' },
  { value: 'cloudy', label: '曇り' },
  { value: 'rainy', label: '雨' },
  { value: 'snowy', label: '雪' },
  { value: 'stormy', label: '嵐' },
];

const SESSION_KEY = 'srm_batch_report_form';

interface FormData {
  projectId: string;
  reportDate: string;
  clockIn: string;
  clockOut: string;
  breakMinutes: string;
  workContent: string;
  progressPct: string;
  weather: string;
}

const defaultForm: FormData = {
  projectId: '',
  reportDate: new Date().toISOString().slice(0, 10),
  clockIn: '08:00',
  clockOut: '17:00',
  breakMinutes: '60',
  workContent: '',
  progressPct: '0',
  weather: '',
};

export function ReportBatchFormPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<FormData>(defaultForm);

  useEffect(() => {
    (async () => {
      try {
        const res = await projectsApi.list({ limit: 100 });
        setProjects(res.data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'プロジェクトの取得に失敗しました';
        alert(message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.projectId) {
      alert('プロジェクトを選択してください');
      return;
    }
    if (!form.reportDate) {
      alert('報告日を入力してください');
      return;
    }
    if (!form.clockIn || !form.clockOut) {
      alert('出勤時間と退勤時間を入力してください');
      return;
    }
    if (!form.workContent.trim()) {
      alert('作業内容を入力してください');
      return;
    }

    const pct = Number(form.progressPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      alert('進捗率は0〜100の範囲で入力してください');
      return;
    }

    const selectedProject = projects.find((p) => p.id === form.projectId);
    const storageData = {
      ...form,
      projectName: selectedProject?.projectName ?? '',
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(storageData));
    navigate('/report/batch/confirm');
  };

  if (isLoading) {
    return (
      <>
        <AppHeader title="まとめ入力" showBack />
        <LoadingSpinner />
      </>
    );
  }

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.projectName,
  }));

  return (
    <>
      <AppHeader title="まとめ入力" showBack />
      <PageContainer>
        <div className="space-y-4">
          <Select
            label="プロジェクト"
            required
            options={projectOptions}
            placeholder="プロジェクトを選択"
            value={form.projectId}
            onChange={(e) => updateField('projectId', e.target.value)}
          />

          <Input
            label="報告日"
            type="date"
            required
            value={form.reportDate}
            onChange={(e) => updateField('reportDate', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="出勤時間"
              type="time"
              required
              value={form.clockIn}
              onChange={(e) => updateField('clockIn', e.target.value)}
            />
            <Input
              label="退勤時間"
              type="time"
              required
              value={form.clockOut}
              onChange={(e) => updateField('clockOut', e.target.value)}
            />
          </div>

          <Input
            label="休憩時間 (分)"
            type="number"
            min={0}
            max={480}
            value={form.breakMinutes}
            onChange={(e) => updateField('breakMinutes', e.target.value)}
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              作業内容<span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200 min-h-[120px] resize-y"
              placeholder="本日の作業内容を入力"
              value={form.workContent}
              onChange={(e) => updateField('workContent', e.target.value)}
            />
          </div>

          <Input
            label="進捗率 (%)"
            type="number"
            min={0}
            max={100}
            value={form.progressPct}
            onChange={(e) => updateField('progressPct', e.target.value)}
          />

          <Select
            label="天気"
            options={WEATHER_OPTIONS.slice(1)}
            placeholder="選択してください"
            value={form.weather}
            onChange={(e) => updateField('weather', e.target.value)}
          />

          <div className="pt-2">
            <Button onClick={handleSubmit}>確認画面へ</Button>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
