import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api/users';
import { companiesApi } from '@/lib/api/companies';
import type { Company } from '@/types/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ROLE_OPTIONS = [
  { value: 'owner', label: 'オーナー' },
  { value: 'worker', label: '作業者' },
];

const memberSchema = z.object({
  lastName: z.string().min(1, '姓は必須です'),
  firstName: z.string().min(1, '名は必須です'),
  lastNameKana: z.string().optional().default(''),
  firstNameKana: z.string().optional().default(''),
  email: z
    .union([z.string().email('有効なメールアドレスを入力してください'), z.literal('')])
    .optional()
    .default(''),
  phone: z.string().optional().default(''),
  role: z.string().min(1, 'ロールを選択してください'),
  password: z.string().optional().default(''),
  companyId: z.string().optional().default(''),
});

type MemberFormValues = z.input<typeof memberSchema>;

export default function MemberFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      lastName: '',
      firstName: '',
      lastNameKana: '',
      firstNameKana: '',
      email: '',
      phone: '',
      role: '',
      password: '',
      companyId: isAdmin ? '' : (user?.companyId ?? ''),
    },
  });

  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
      try {
        if (isAdmin) {
          const res = await companiesApi.list({ limit: 1000 });
          setCompanies(res.data);
        }

        if (isEdit && id) {
          const member = await usersApi.detail(id);
          reset({
            lastName: member.lastName,
            firstName: member.firstName,
            lastNameKana: member.lastNameKana ?? '',
            firstNameKana: member.firstNameKana ?? '',
            email: member.email ?? '',
            phone: member.phone ?? '',
            role: member.role,
            password: '',
            companyId: member.companyId ?? '',
          });
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [id, isEdit, isAdmin, reset]);

  const onSubmit = async (values: MemberFormValues) => {
    setSubmitError(null);
    setLoading(true);
    try {
      const dto: Record<string, unknown> = {
        lastName: values.lastName,
        firstName: values.firstName,
        role: values.role,
      };

      if (values.lastNameKana) dto.lastNameKana = values.lastNameKana;
      if (values.firstNameKana) dto.firstNameKana = values.firstNameKana;
      if (values.email) dto.email = values.email;
      if (values.phone) dto.phone = values.phone;

      // Password only in create mode
      if (!isEdit && values.password) {
        dto.password = values.password;
      }

      // Company assignment
      if (isAdmin) {
        if (values.companyId) dto.companyId = values.companyId;
      } else if (user?.companyId) {
        dto.companyId = user.companyId;
      }

      if (isEdit && id) {
        await usersApi.update(id, dto);
      } else {
        await usersApi.create(dto);
      }
      navigate('/members');
    } catch (err) {
      console.error('Failed to save member:', err);
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
          {isEdit ? 'メンバー編集' : 'メンバー作成'}
        </h1>
        <Button variant="secondary" onClick={() => navigate('/members')}>
          戻る
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {submitError && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="姓"
            placeholder="山田"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
          <Input
            label="名"
            placeholder="太郎"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="姓（カナ）"
            placeholder="ヤマダ"
            {...register('lastNameKana')}
            error={errors.lastNameKana?.message}
          />
          <Input
            label="名（カナ）"
            placeholder="タロウ"
            {...register('firstNameKana')}
            error={errors.firstNameKana?.message}
          />
        </div>

        <Input
          label="メールアドレス"
          type="email"
          placeholder="example@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <Input
          label="電話番号"
          placeholder="090-1234-5678"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <Select
          label="ロール"
          options={ROLE_OPTIONS}
          placeholder="選択してください"
          {...register('role')}
          error={errors.role?.message}
        />

        {!isEdit && (
          <Input
            label="パスワード"
            type="password"
            placeholder="管理者アカウント用パスワード"
            {...register('password')}
            error={errors.password?.message}
          />
        )}

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
            onClick={() => navigate('/members')}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
