import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { StepperInput } from '@/components/ui/StepperInput';
import { Collapsible } from '@/components/ui/Collapsible';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { matchingDemandApi } from '@/lib/api/matching-demand';
import { useMasters } from '@/hooks/useMasters';
import type { WorkType } from '@/types/api';

const PREFECTURES = [
  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
  '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
  '新潟県','富山県','石川県','福井県','山梨県','長野県',
  '岐阜県','静岡県','愛知県','三重県',
  '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
  '鳥取県','島根県','岡山県','広島県','山口県',
  '徳島県','香川県','愛媛県','高知県',
  '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県',
];

const TRANSPORTATION_OPTIONS = [
  { value: 'car', label: '車' },
  { value: 'public', label: '公共交通機関' },
  { value: 'bicycle', label: '自転車・バイク' },
  { value: 'walk', label: '徒歩' },
  { value: 'other', label: 'その他' },
];

const SKILL_LEVELS = [
  { value: 'beginner', label: '初級（見習い）' },
  { value: 'intermediate', label: '中級（一人前）' },
  { value: 'advanced', label: '上級（職長クラス）' },
  { value: 'expert', label: 'エキスパート' },
];

const CONTRACT_TIER_OPTIONS = [
  { value: '1', label: '元請' },
  { value: '2', label: '一次下請' },
  { value: '3', label: '二次下請' },
  { value: '4', label: '三次下請以降' },
];

interface FormValues {
  contractType: 'daily_rate' | 'fixed_price';
  siteName: string;
  sitePrefecture: string;
  siteCity: string;
  siteAddress: string;
  workTypeParentId: string;
  workTypeId: string;
  workDateStart: string;
  workDateEnd: string;
  requiredCount: number;
  dailyRateMin: string;
  dailyRateMax: string;
  fixedPrice: string;
  description: string;
  // optional - property
  structureId: string;
  floorCount: string;
  primeContractor: string;
  contractTier: string;
  // optional - conditions
  workTimeStart: string;
  workTimeEnd: string;
  transportationType: string;
  ccusRequired: boolean;
  providesParking: boolean;
  providesTools: boolean;
  providesMeals: boolean;
  // optional - skill requirements
  requiredSkillLevel: string;
  requiredLicenses: string[];
}

function getChildWorkTypes(workTypes: WorkType[], parentId: string): WorkType[] {
  const parent = workTypes.find((wt) => wt.id === parentId);
  return parent?.children ?? [];
}

function getParentWorkTypes(workTypes: WorkType[]): WorkType[] {
  return workTypes.filter((wt) => !wt.parentId);
}

export function DemandCreatePage() {
  const navigate = useNavigate();
  const { data: masters, isLoading: mastersLoading } = useMasters();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      contractType: 'daily_rate',
      siteName: '',
      sitePrefecture: '',
      siteCity: '',
      siteAddress: '',
      workTypeParentId: '',
      workTypeId: '',
      workDateStart: '',
      workDateEnd: '',
      requiredCount: 1,
      dailyRateMin: '',
      dailyRateMax: '',
      fixedPrice: '',
      description: '',
      structureId: '',
      floorCount: '',
      primeContractor: '',
      contractTier: '',
      workTimeStart: '08:00',
      workTimeEnd: '17:00',
      transportationType: '',
      ccusRequired: false,
      providesParking: false,
      providesTools: false,
      providesMeals: false,
      requiredSkillLevel: '',
      requiredLicenses: [],
    },
  });

  const contractType = watch('contractType');
  const workTypeParentId = watch('workTypeParentId');

  const parentWorkTypes = useMemo(
    () => (masters ? getParentWorkTypes(masters.workTypes) : []),
    [masters],
  );

  const childWorkTypes = useMemo(
    () => (masters && workTypeParentId ? getChildWorkTypes(masters.workTypes, workTypeParentId) : []),
    [masters, workTypeParentId],
  );

  const prefectureOptions = PREFECTURES.map((p) => ({ value: p, label: p }));

  const structureOptions = (masters?.structures ?? []).map((s) => ({
    value: s.id,
    label: s.structureName,
  }));

  const licenseOptions = (masters?.licenses ?? []).map((l) => ({
    value: l.id,
    label: l.licenseName,
  }));

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        siteName: data.siteName,
        sitePrefecture: data.sitePrefecture,
        siteCity: data.siteCity,
        siteAddress: data.siteAddress || undefined,
        contractType: data.contractType,
        workTypeId: data.workTypeId || data.workTypeParentId,
        workDateStart: data.workDateStart,
        workDateEnd: data.workDateEnd,
        requiredCount: data.requiredCount,
        description: data.description || undefined,
        // optional property
        structureId: data.structureId || undefined,
        floorCount: data.floorCount ? Number(data.floorCount) : undefined,
        primeContractor: data.primeContractor || undefined,
        contractTier: data.contractTier ? Number(data.contractTier) : undefined,
        // optional conditions
        workTimeStart: data.workTimeStart || undefined,
        workTimeEnd: data.workTimeEnd || undefined,
        transportationType: data.transportationType || undefined,
        ccusRequired: data.ccusRequired,
        providesParking: data.providesParking,
        providesTools: data.providesTools,
        providesMeals: data.providesMeals,
        // optional skills
        requiredSkillLevel: data.requiredSkillLevel || undefined,
        requiredLicenses: data.requiredLicenses.length > 0 ? data.requiredLicenses : undefined,
      };

      if (data.contractType === 'daily_rate') {
        payload.dailyRateMin = data.dailyRateMin ? Number(data.dailyRateMin) : undefined;
        payload.dailyRateMax = data.dailyRateMax ? Number(data.dailyRateMax) : undefined;
      } else {
        payload.fixedPrice = data.fixedPrice ? Number(data.fixedPrice) : undefined;
      }

      const created = await matchingDemandApi.create(payload);
      await matchingDemandApi.publish(created.id);
      navigate('/matching/demand/search');
    } catch {
      alert('募集の作成に失敗しました。入力内容を確認してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mastersLoading) {
    return (
      <>
        <AppHeader title="募集作成" showBack />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <AppHeader title="募集作成" showBack />
      <PageContainer>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* ── Contract type toggle ── */}
          <Card>
            <p className="text-sm font-bold text-gray-900 mb-3">契約形態</p>
            <div className="grid grid-cols-2 gap-2">
              {(['daily_rate', 'fixed_price'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setValue('contractType', type)}
                  className={`py-3 rounded-lg text-sm font-medium border transition
                    ${contractType === type
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300'
                    }`}
                >
                  {type === 'daily_rate' ? '日当単価' : '請負'}
                </button>
              ))}
            </div>
          </Card>

          {/* ── Required fields ── */}
          <Card className="space-y-4">
            <p className="text-sm font-bold text-gray-900">基本情報</p>

            <Input
              label="現場名"
              required
              placeholder="例）○○マンション新築工事"
              error={errors.siteName?.message}
              {...register('siteName', { required: '現場名は必須です' })}
            />

            <Select
              label="都道府県"
              required
              placeholder="選択してください"
              options={prefectureOptions}
              error={errors.sitePrefecture?.message}
              {...register('sitePrefecture', { required: '都道府県は必須です' })}
            />

            <Input
              label="市区町村"
              required
              placeholder="例）渋谷区"
              error={errors.siteCity?.message}
              {...register('siteCity', { required: '市区町村は必須です' })}
            />

            <Input
              label="住所（任意）"
              placeholder="例）神南1-2-3"
              {...register('siteAddress')}
            />

            {/* Work Type hierarchical selects */}
            <Select
              label="工種（大分類）"
              required
              placeholder="選択してください"
              options={parentWorkTypes.map((wt) => ({ value: wt.id, label: wt.workTypeName }))}
              error={errors.workTypeParentId?.message}
              {...register('workTypeParentId', {
                required: '工種は必須です',
                onChange: () => setValue('workTypeId', ''),
              })}
            />

            {childWorkTypes.length > 0 && (
              <Select
                label="工種（小分類）"
                placeholder="選択してください"
                options={childWorkTypes.map((wt) => ({ value: wt.id, label: wt.workTypeName }))}
                {...register('workTypeId')}
              />
            )}

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="開始日"
                type="date"
                required
                error={errors.workDateStart?.message}
                {...register('workDateStart', { required: '開始日は必須です' })}
              />
              <Input
                label="終了日"
                type="date"
                required
                error={errors.workDateEnd?.message}
                {...register('workDateEnd', { required: '終了日は必須です' })}
              />
            </div>

            {/* Required count */}
            <Controller
              name="requiredCount"
              control={control}
              rules={{ min: { value: 1, message: '1名以上を指定してください' } }}
              render={({ field }) => (
                <StepperInput
                  label="必要人数"
                  value={field.value}
                  onChange={field.onChange}
                  min={1}
                  max={99}
                />
              )}
            />

            {/* Rate fields conditional on contractType */}
            {contractType === 'daily_rate' ? (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="日当下限（円）"
                  type="number"
                  placeholder="例）15000"
                  error={errors.dailyRateMin?.message}
                  {...register('dailyRateMin', {
                    required: '日当下限は必須です',
                    min: { value: 1, message: '1以上を入力してください' },
                  })}
                />
                <Input
                  label="日当上限（円）"
                  type="number"
                  placeholder="例）20000"
                  {...register('dailyRateMax')}
                />
              </div>
            ) : (
              <Input
                label="請負金額（円）"
                type="number"
                placeholder="例）500000"
                error={errors.fixedPrice?.message}
                {...register('fixedPrice', {
                  required: '請負金額は必須です',
                  min: { value: 1, message: '1以上を入力してください' },
                })}
              />
            )}

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">備考</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                rows={3}
                placeholder="募集に関する補足事項"
                {...register('description')}
              />
            </div>
          </Card>

          {/* ── Optional: Property info ── */}
          <Collapsible title="物件情報（任意）">
            <Card className="space-y-4">
              {structureOptions.length > 0 && (
                <Select
                  label="構造"
                  placeholder="選択してください"
                  options={structureOptions}
                  {...register('structureId')}
                />
              )}

              <Input
                label="階数"
                type="number"
                placeholder="例）5"
                {...register('floorCount')}
              />

              <Input
                label="元請会社"
                placeholder="例）○○建設株式会社"
                {...register('primeContractor')}
              />

              <Select
                label="次数"
                placeholder="選択してください"
                options={CONTRACT_TIER_OPTIONS}
                {...register('contractTier')}
              />
            </Card>
          </Collapsible>

          {/* ── Optional: Conditions ── */}
          <Collapsible title="条件（任意）">
            <Card className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="作業開始時刻"
                  type="time"
                  {...register('workTimeStart')}
                />
                <Input
                  label="作業終了時刻"
                  type="time"
                  {...register('workTimeEnd')}
                />
              </div>

              <Select
                label="交通手段"
                placeholder="選択してください"
                options={TRANSPORTATION_OPTIONS}
                {...register('transportationType')}
              />

              <Controller
                name="ccusRequired"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="CCUS登録必須"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="providesParking"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="駐車場あり"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="providesTools"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="工具貸出あり"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />

              <Controller
                name="providesMeals"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="食事提供あり"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Card>
          </Collapsible>

          {/* ── Optional: Skill requirements ── */}
          <Collapsible title="スキル要件（任意）">
            <Card className="space-y-4">
              <Select
                label="必要スキルレベル"
                placeholder="選択してください"
                options={SKILL_LEVELS}
                {...register('requiredSkillLevel')}
              />

              {licenseOptions.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">必要資格</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    <Controller
                      name="requiredLicenses"
                      control={control}
                      render={({ field }) => (
                        <>
                          {licenseOptions.map((license) => (
                            <label key={license.value} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                value={license.value}
                                checked={field.value.includes(license.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, license.value]);
                                  } else {
                                    field.onChange(field.value.filter((v: string) => v !== license.value));
                                  }
                                }}
                              />
                              <span className="text-gray-700">{license.label}</span>
                            </label>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>
              )}
            </Card>
          </Collapsible>

          {/* ── Submit ── */}
          <div className="pt-2 pb-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '送信中...' : '募集を公開する'}
            </Button>
          </div>
        </form>
      </PageContainer>
    </>
  );
}
