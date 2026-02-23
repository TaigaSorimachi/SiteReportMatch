import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { companiesApi } from '@/lib/api/companies';
import { usersApi } from '@/lib/api/users';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Company } from '@/types/api';

const companyTypeOptions = [
  { value: 'own', label: '自社' },
  { value: 'prime', label: '元請' },
  { value: 'subcontractor', label: '下請' },
  { value: 'partner', label: '協力会社' },
];

const companySchema = z.object({
  companyName: z.string().min(1, '会社名を入力してください'),
  companyNameKana: z.string().optional(),
  companyType: z.string().min(1, '種別を選択してください'),
  corporateNumber: z.string().optional(),
  representative: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email('有効なメールアドレスを入力してください'), z.literal('')]).optional(),
  website: z.string().optional(),
});

type CompanyForm = z.infer<typeof companySchema>;

const adminSchema = z.object({
  lastName: z.string().min(1, '姓を入力してください'),
  firstName: z.string().min(1, '名を入力してください'),
  email: z.string().min(1, 'メールアドレスを入力してください').email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

type AdminForm = z.infer<typeof adminSchema>;

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
  });

  const {
    register: registerAdmin,
    handleSubmit: handleSubmitAdmin,
    reset: resetAdmin,
    formState: { errors: adminErrors },
  } = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      try {
        const data = await companiesApi.detail(id);
        setCompany(data);
        reset({
          companyName: data.companyName,
          companyNameKana: data.companyNameKana ?? '',
          companyType: data.companyType,
          corporateNumber: data.corporateNumber ?? '',
          representative: data.representative ?? '',
          postalCode: data.postalCode ?? '',
          address: data.address ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          website: data.website ?? '',
        });
      } catch {
        // failed to load
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, reset]);

  const onSave = async (data: CompanyForm) => {
    if (!id) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const dto: Record<string, unknown> = { ...data };
      const updated = await companiesApi.update(id, dto);
      setCompany(updated);
      setSaveMessage('保存しました');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const onCreateAdmin = async (data: AdminForm) => {
    if (!company) return;
    setCreatingAdmin(true);
    setAdminMessage('');
    try {
      await usersApi.create({
        lastName: data.lastName,
        firstName: data.firstName,
        email: data.email,
        password: data.password,
        companyId: company.id,
        role: 'owner',
      });
      setAdminMessage('オーナーを追加しました');
      resetAdmin();
      setTimeout(() => {
        setAdminModalOpen(false);
        setAdminMessage('');
      }, 2000);
    } catch {
      setAdminMessage('オーナーの追加に失敗しました');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleCloseAdminModal = () => {
    setAdminModalOpen(false);
    setAdminMessage('');
    resetAdmin();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">会社が見つかりません</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/companies')}>
          一覧に戻る
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/companies')}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            会社一覧に戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{company.companyName}</h1>
        </div>
        <Button variant="secondary" onClick={() => setAdminModalOpen(true)}>
          オーナーを追加
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSave)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="会社名"
              error={errors.companyName?.message}
              {...register('companyName')}
            />

            <Input
              label="会社名（カナ）"
              error={errors.companyNameKana?.message}
              {...register('companyNameKana')}
            />

            <Select
              label="種別"
              options={companyTypeOptions}
              placeholder="選択してください"
              error={errors.companyType?.message}
              {...register('companyType')}
            />

            <Input
              label="法人番号"
              error={errors.corporateNumber?.message}
              {...register('corporateNumber')}
            />

            <Input
              label="代表者"
              error={errors.representative?.message}
              {...register('representative')}
            />

            <Input
              label="郵便番号"
              placeholder="123-4567"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />

            <div className="md:col-span-2">
              <Input
                label="住所"
                error={errors.address?.message}
                {...register('address')}
              />
            </div>

            <Input
              label="電話番号"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="メールアドレス"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="ウェブサイト"
              placeholder="https://example.com"
              error={errors.website?.message}
              {...register('website')}
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('失敗') ? 'text-red-600' : 'text-green-600'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </form>
      </div>

      <Modal isOpen={adminModalOpen} onClose={handleCloseAdminModal} title="オーナーを追加">
        {adminMessage && (
          <div className={`mb-4 rounded-lg p-3 ${adminMessage.includes('失敗') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            <p className={`text-sm ${adminMessage.includes('失敗') ? 'text-red-700' : 'text-green-700'}`}>
              {adminMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmitAdmin(onCreateAdmin)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="姓"
              placeholder="山田"
              error={adminErrors.lastName?.message}
              {...registerAdmin('lastName')}
            />

            <Input
              label="名"
              placeholder="太郎"
              error={adminErrors.firstName?.message}
              {...registerAdmin('firstName')}
            />
          </div>

          <Input
            label="メールアドレス"
            type="email"
            placeholder="admin@example.com"
            error={adminErrors.email?.message}
            {...registerAdmin('email')}
          />

          <Input
            label="パスワード"
            type="password"
            placeholder="パスワードを入力"
            error={adminErrors.password?.message}
            {...registerAdmin('password')}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseAdminModal}>
              キャンセル
            </Button>
            <Button type="submit" disabled={creatingAdmin}>
              {creatingAdmin ? '追加中...' : '追加'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
