import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi } from '@/lib/api/projects';
import { companiesApi } from '@/lib/api/companies';
import type { Company } from '@/types/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MapLocationPicker from '@/components/ui/MapLocationPicker';

const projectSchema = z.object({
  projectName: z.string().min(1, '案件名は必須です'),
  projectCode: z.string().optional().default(''),
  description: z.string().optional().default(''),
  status: z.enum(['planning', 'active', 'completed', 'suspended', 'cancelled']),
  siteName: z.string().optional().default(''),
  sitePostalCode: z.string().optional().default(''),
  sitePrefecture: z.string().optional().default(''),
  siteCity: z.string().optional().default(''),
  siteAddress: z.string().optional().default(''),
  scheduledStart: z.string().optional().default(''),
  scheduledEnd: z.string().optional().default(''),
  contractAmount: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    }),
  estimatedCost: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === '' || v === undefined || v === null) return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    }),
  geofenceRadiusM: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === '' || v === undefined || v === null) return 200;
      const n = Number(v);
      return isNaN(n) ? 200 : n;
    }),
  companyId: z.string().optional().default(''),
});

type ProjectFormValues = z.input<typeof projectSchema>;

const STATUS_OPTIONS = [
  { value: 'planning', label: '計画中' },
  { value: 'active', label: '稼働中' },
  { value: 'completed', label: '完了' },
  { value: 'suspended', label: '中断' },
  { value: 'cancelled', label: 'キャンセル' },
];

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [postalSearching, setPostalSearching] = useState(false);
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: '',
      projectCode: '',
      description: '',
      status: 'planning',
      siteName: '',
      sitePostalCode: '',
      sitePrefecture: '',
      siteCity: '',
      siteAddress: '',
      scheduledStart: '',
      scheduledEnd: '',
      contractAmount: '',
      estimatedCost: '',
      geofenceRadiusM: 200,
      companyId: isAdmin ? '' : (user?.companyId ?? ''),
    },
  });

  const postalCode = watch('sitePostalCode');

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
      try {
        if (isAdmin) {
          const res = await companiesApi.list({ limit: 1000 });
          setCompanies(res.data);
        }

        if (isEdit && id) {
          const project = await projectsApi.detail(id);
          reset({
            projectName: project.projectName,
            projectCode: project.projectCode ?? '',
            description: project.description ?? '',
            status: project.status as ProjectFormValues['status'],
            siteName: project.siteName ?? '',
            sitePostalCode: (project as any).sitePostalCode ?? '',
            sitePrefecture: (project as any).sitePrefecture ?? '',
            siteCity: (project as any).siteCity ?? '',
            siteAddress: project.siteAddress ?? '',
            scheduledStart: project.scheduledStart
              ? project.scheduledStart.substring(0, 10)
              : '',
            scheduledEnd: project.scheduledEnd
              ? project.scheduledEnd.substring(0, 10)
              : '',
            contractAmount: project.contractAmount ?? '',
            estimatedCost: project.estimatedCost ?? '',
            geofenceRadiusM: project.geofenceRadiusM ?? 200,
            companyId: project.companyId ?? '',
          });
          if (project.siteLat && project.siteLng) {
            setMapLocation({ lat: Number(project.siteLat), lng: Number(project.siteLng) });
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id, isEdit, isAdmin, reset]);

  // 郵便番号検索
  const handlePostalSearch = useCallback(async () => {
    const code = postalCode?.replace(/[-ー−]/g, '');
    if (!code || code.length < 7) return;
    setPostalSearching(true);
    try {
      const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${code}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        setValue('sitePrefecture', result.address1, { shouldDirty: true });
        setValue('siteCity', result.address2, { shouldDirty: true });
        setValue('siteAddress', result.address3, { shouldDirty: true });

        // 住所から地図を検索
        const fullAddress = `${result.address1}${result.address2}${result.address3}`;
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=jp&limit=1`,
            { headers: { 'Accept-Language': 'ja' } },
          );
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            setMapLocation({ lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) });
          }
        } catch { /* geocoding失敗は無視 */ }
      }
    } catch {
      console.error('郵便番号検索に失敗しました');
    } finally {
      setPostalSearching(false);
    }
  }, [postalCode, setValue]);

  // 郵便番号が7桁になったら自動検索
  useEffect(() => {
    const code = postalCode?.replace(/[-ー−]/g, '');
    if (code && code.length === 7) {
      handlePostalSearch();
    }
  }, [postalCode, handlePostalSearch]);

  const handleMapChange = useCallback((latlng: { lat: number; lng: number }) => {
    setMapLocation(latlng);
  }, []);

  const onSubmit = async (values: ProjectFormValues) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const dto: Record<string, unknown> = {
        projectName: values.projectName,
        status: values.status,
      };

      if (values.projectCode) dto.projectCode = values.projectCode;
      if (values.description) dto.description = values.description;
      if (values.siteName) dto.siteName = values.siteName;
      if (values.sitePostalCode) dto.sitePostalCode = values.sitePostalCode;
      if (values.sitePrefecture) dto.sitePrefecture = values.sitePrefecture;
      if (values.siteCity) dto.siteCity = values.siteCity;
      if (values.siteAddress) dto.siteAddress = values.siteAddress;
      if (values.scheduledStart) dto.scheduledStart = values.scheduledStart;
      if (values.scheduledEnd) dto.scheduledEnd = values.scheduledEnd;

      if (mapLocation) {
        dto.siteLat = mapLocation.lat;
        dto.siteLng = mapLocation.lng;
      }

      const contractAmount = Number(values.contractAmount);
      if (!isNaN(contractAmount) && values.contractAmount !== '' && values.contractAmount !== undefined) {
        dto.contractAmount = contractAmount;
      }
      const estimatedCost = Number(values.estimatedCost);
      if (!isNaN(estimatedCost) && values.estimatedCost !== '' && values.estimatedCost !== undefined) {
        dto.estimatedCost = estimatedCost;
      }
      const geofenceRadiusM = Number(values.geofenceRadiusM);
      if (!isNaN(geofenceRadiusM)) {
        dto.geofenceRadiusM = geofenceRadiusM;
      }

      if (isAdmin) {
        if (values.companyId) dto.companyId = values.companyId;
      } else if (user?.companyId) {
        dto.companyId = user.companyId;
      }

      if (isEdit && id) {
        await projectsApi.update(id, dto);
      } else {
        await projectsApi.create(dto);
      }
      navigate('/projects');
    } catch (err) {
      console.error('Failed to save project:', err);
      setSubmitError('保存に失敗しました。入力内容を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '案件編集' : '案件作成'}
        </h1>
        <Button variant="secondary" onClick={() => navigate('/projects')}>
          戻る
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {submitError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <Input
          label="案件名"
          {...register('projectName')}
          error={errors.projectName?.message}
        />

        <Input
          label="案件コード"
          {...register('projectCode')}
          error={errors.projectCode?.message}
        />

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <textarea
            id="description"
            rows={4}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            {...register('description')}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <Select
          label="ステータス"
          options={STATUS_OPTIONS}
          {...register('status')}
          error={errors.status?.message}
        />

        <Input
          label="現場名"
          {...register('siteName')}
          error={errors.siteName?.message}
        />

        {/* 郵便番号検索 */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">郵便番号</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="1500043"
              maxLength={8}
              {...register('sitePostalCode')}
            />
            <button
              type="button"
              onClick={handlePostalSearch}
              disabled={postalSearching}
              className="shrink-0 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {postalSearching ? '検索中...' : '住所検索'}
            </button>
          </div>
          <p className="text-xs text-gray-400">7桁入力で自動検索されます</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="都道府県"
            {...register('sitePrefecture')}
          />
          <Input
            label="市区町村"
            {...register('siteCity')}
          />
        </div>

        <Input
          label="現場住所"
          {...register('siteAddress')}
          error={errors.siteAddress?.message}
        />

        {/* 地図 */}
        <MapLocationPicker
          value={mapLocation}
          onChange={handleMapChange}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="工期開始日"
            type="date"
            {...register('scheduledStart')}
            error={errors.scheduledStart?.message}
          />
          <Input
            label="工期終了日"
            type="date"
            {...register('scheduledEnd')}
            error={errors.scheduledEnd?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="契約金額"
            type="number"
            {...register('contractAmount')}
            error={errors.contractAmount?.message}
          />
          <Input
            label="見積原価"
            type="number"
            {...register('estimatedCost')}
            error={errors.estimatedCost?.message}
          />
        </div>

        <Input
          label="ジオフェンス半径 (m)"
          type="number"
          {...register('geofenceRadiusM')}
          error={errors.geofenceRadiusM?.message}
        />

        {isAdmin && (
          <Select
            label="所属会社"
            options={companies.map((c) => ({
              value: c.id,
              label: c.companyName,
            }))}
            placeholder="会社を選択"
            {...register('companyId')}
            error={errors.companyId?.message}
          />
        )}

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? '保存中...' : '保存'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/projects')}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
