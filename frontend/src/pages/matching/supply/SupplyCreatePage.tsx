import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { matchingSupplyApi } from '@/lib/api/matching-supply';
import { useMasters } from '@/hooks/useMasters';

const CONTRACT_TYPE_OPTIONS = [
  { value: 'daily_rate', label: '単価' },
  { value: 'fixed_price', label: '請負' },
];

const SKILL_LEVEL_OPTIONS = [
  { value: 'beginner', label: '初級' },
  { value: 'intermediate', label: '中級' },
  { value: 'advanced', label: '上級' },
  { value: 'expert', label: 'エキスパート' },
];

const PREFECTURE_OPTIONS = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
].map((p) => ({ value: p, label: p }));

export function SupplyCreatePage() {
  const navigate = useNavigate();
  const { data: masters, isLoading: mastersLoading } = useMasters();

  const [form, setForm] = useState({
    workTypeId: '',
    contractType: '',
    desiredDailyRate: '',
    availableStart: '',
    availableEnd: '',
    availablePrefecture: '',
    availableArea: '',
    skillLevel: '',
    experienceYears: '',
    title: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.workTypeId || !form.contractType || !form.availableStart || !form.availableEnd || !form.availablePrefecture) {
      setError('必須項目を入力してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const dto = {
        workTypeId: form.workTypeId,
        contractType: form.contractType,
        desiredDailyRate: form.desiredDailyRate ? Number(form.desiredDailyRate) : undefined,
        availableStart: form.availableStart,
        availableEnd: form.availableEnd,
        availablePrefecture: form.availablePrefecture,
        availableArea: form.availableArea || undefined,
        skillLevel: form.skillLevel || undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        title: form.title || undefined,
        description: form.description || undefined,
      };

      const created = await matchingSupplyApi.create(dto);
      await matchingSupplyApi.publish(created.id);
      navigate('/matching/supply');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '投稿の作成に失敗しました';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (mastersLoading) {
    return (
      <>
        <AppHeader title="人材公開" showBack />
        <LoadingSpinner />
      </>
    );
  }

  const workTypeOptions = (masters?.workTypes || []).map((wt) => ({
    value: wt.id,
    label: wt.workTypeName,
  }));

  return (
    <>
      <AppHeader title="人材公開" showBack />
      <PageContainer>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">基本情報</h2>

            <Input
              label="タイトル"
              placeholder="例: 型枠工事 経験10年"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />

            <Select
              label="工種"
              required
              options={workTypeOptions}
              placeholder="選択してください"
              value={form.workTypeId}
              onChange={(e) => handleChange('workTypeId', e.target.value)}
            />

            <Select
              label="契約形態"
              required
              options={CONTRACT_TYPE_OPTIONS}
              placeholder="選択してください"
              value={form.contractType}
              onChange={(e) => handleChange('contractType', e.target.value)}
            />

            <Input
              label="希望日当（円）"
              type="number"
              placeholder="例: 18000"
              value={form.desiredDailyRate}
              onChange={(e) => handleChange('desiredDailyRate', e.target.value)}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">対応可能期間・エリア</h2>

            <Input
              label="対応可能開始日"
              type="date"
              required
              value={form.availableStart}
              onChange={(e) => handleChange('availableStart', e.target.value)}
            />

            <Input
              label="対応可能終了日"
              type="date"
              required
              value={form.availableEnd}
              onChange={(e) => handleChange('availableEnd', e.target.value)}
            />

            <Select
              label="対応可能都道府県"
              required
              options={PREFECTURE_OPTIONS}
              placeholder="選択してください"
              value={form.availablePrefecture}
              onChange={(e) => handleChange('availablePrefecture', e.target.value)}
            />

            <Input
              label="対応可能エリア詳細"
              placeholder="例: 都内23区、横浜市内"
              value={form.availableArea}
              onChange={(e) => handleChange('availableArea', e.target.value)}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">スキル・経験</h2>

            <Select
              label="スキルレベル"
              options={SKILL_LEVEL_OPTIONS}
              placeholder="選択してください"
              value={form.skillLevel}
              onChange={(e) => handleChange('skillLevel', e.target.value)}
            />

            <Input
              label="経験年数"
              type="number"
              placeholder="例: 10"
              value={form.experienceYears}
              onChange={(e) => handleChange('experienceYears', e.target.value)}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">詳細説明</h2>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">説明</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                rows={4}
                placeholder="スキルや実績について自由に記載してください"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </Card>

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '投稿中...' : '公開する'}
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
