import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { workersApi } from '@/lib/api/workers';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { WorkerProfile } from '@/types/api';

const skillLevelOptions = [
  { value: 'beginner', label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced', label: '上級者' },
  { value: 'expert', label: 'エキスパート' },
  { value: 'master', label: 'マスター' },
];

export function ProfileEditPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    experienceYears: 0,
    skillLevel: '',
    specialties: '',
    careerSummary: '',
    preferredArea: '',
    maxCommuteKm: 0,
    hasVehicle: false,
    hasOwnTools: false,
    desiredDailyMin: 0,
    desiredDailyMax: 0,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const profile: WorkerProfile = await workersApi.getProfile(user.id);
        setForm({
          experienceYears: profile.experienceYears ?? 0,
          skillLevel: profile.skillLevel ?? '',
          specialties: profile.specialties ?? '',
          careerSummary: profile.careerSummary ?? '',
          preferredArea: profile.preferredArea ?? '',
          maxCommuteKm: profile.maxCommuteKm ?? 0,
          hasVehicle: profile.hasVehicle ?? false,
          hasOwnTools: profile.hasOwnTools ?? false,
          desiredDailyMin: profile.desiredDailyMin ?? 0,
          desiredDailyMax: profile.desiredDailyMax ?? 0,
        });
      } catch {
        // profile may not exist yet — use defaults
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await workersApi.updateProfile(user.id, form);
      alert('プロフィールを保存しました');
    } catch {
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <AppHeader title="プロフィール編集" showBack />
      <PageContainer>
        <div className="space-y-4">
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-600">基本情報</h2>

            <Input
              label="経験年数"
              type="number"
              min={0}
              value={form.experienceYears}
              onChange={(e) => handleChange('experienceYears', Number(e.target.value))}
            />

            <Select
              label="スキルレベル"
              options={skillLevelOptions}
              placeholder="選択してください"
              value={form.skillLevel}
              onChange={(e) => handleChange('skillLevel', e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">得意分野</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                rows={2}
                value={form.specialties}
                onChange={(e) => handleChange('specialties', e.target.value)}
                placeholder="例: 鉄骨組立、溶接、足場"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">経歴概要</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                rows={3}
                value={form.careerSummary}
                onChange={(e) => handleChange('careerSummary', e.target.value)}
                placeholder="これまでの経歴を簡単にご記入ください"
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-600">勤務条件</h2>

            <Input
              label="希望エリア"
              value={form.preferredArea}
              onChange={(e) => handleChange('preferredArea', e.target.value)}
              placeholder="例: 東京都、神奈川県"
            />

            <Input
              label="最大通勤距離 (km)"
              type="number"
              min={0}
              value={form.maxCommuteKm}
              onChange={(e) => handleChange('maxCommuteKm', Number(e.target.value))}
            />

            <Toggle
              label="自家用車あり"
              checked={form.hasVehicle}
              onChange={(checked) => handleChange('hasVehicle', checked)}
            />

            <Toggle
              label="自前工具あり"
              checked={form.hasOwnTools}
              onChange={(checked) => handleChange('hasOwnTools', checked)}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-600">希望日当</h2>

            <Input
              label="最低日当 (円)"
              type="number"
              min={0}
              step={1000}
              value={form.desiredDailyMin}
              onChange={(e) => handleChange('desiredDailyMin', Number(e.target.value))}
            />

            <Input
              label="最高日当 (円)"
              type="number"
              min={0}
              step={1000}
              value={form.desiredDailyMax}
              onChange={(e) => handleChange('desiredDailyMax', Number(e.target.value))}
            />
          </Card>

          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存する'}
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
