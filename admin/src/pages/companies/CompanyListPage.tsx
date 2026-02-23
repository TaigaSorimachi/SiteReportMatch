import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { companiesApi } from '@/lib/api/companies';
import { companyTypeLabel, formatDate } from '@/lib/utils';
import Table, { type Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Company } from '@/types/api';

const companyTypeOptions = [
  { value: 'own', label: '自社' },
  { value: 'prime', label: '元請' },
  { value: 'subcontractor', label: '下請' },
  { value: 'partner', label: '協力会社' },
];

const createCompanySchema = z.object({
  companyName: z.string().min(1, '会社名を入力してください'),
  companyType: z.string().min(1, '種別を選択してください'),
  representative: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email('有効なメールアドレスを入力してください'), z.literal('')]).optional(),
  address: z.string().optional(),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

const companyTypeBadgeVariant: Record<string, 'blue' | 'green' | 'yellow' | 'purple' | 'gray'> = {
  own: 'blue',
  prime: 'green',
  subcontractor: 'yellow',
  partner: 'purple',
};

export default function CompanyListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      companyName: '',
      companyType: '',
      representative: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  const fetchCompanies = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await companiesApi.list({ page: p, limit: 20 });
      setCompanies(res.data);
      setTotalPages(res.meta.totalPages);
    } catch {
      // failed to load
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies(page);
  }, [page, fetchCompanies]);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const columns: Column<Company>[] = [
    { header: '会社名', accessor: 'companyName', width: '30%' },
    {
      header: '種別',
      render: (row) => (
        <Badge variant={companyTypeBadgeVariant[row.companyType] ?? 'gray'}>
          {companyTypeLabel(row.companyType)}
        </Badge>
      ),
      width: '15%',
    },
    { header: '代表者', accessor: 'representative', width: '20%' },
    { header: '電話番号', accessor: 'phone', width: '15%' },
    {
      header: '登録日',
      render: (row) => formatDate(row.createdAt),
      width: '20%',
    },
  ];

  const onRowClick = (row: Company) => {
    navigate(`/companies/${row.id}`);
  };

  const onSubmit = async (data: CreateCompanyForm) => {
    setCreating(true);
    try {
      const dto: Record<string, unknown> = {
        companyName: data.companyName,
        companyType: data.companyType,
      };
      if (data.representative) dto.representative = data.representative;
      if (data.phone) dto.phone = data.phone;
      if (data.email) dto.email = data.email;
      if (data.address) dto.address = data.address;

      await companiesApi.create(dto);
      setModalOpen(false);
      reset();
      await fetchCompanies(page);
    } catch {
      // creation failed
    } finally {
      setCreating(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    reset();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会社一覧</h1>
          <p className="mt-1 text-sm text-gray-500">登録されている会社の管理</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>新規作成</Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table columns={columns} data={companies} onRowClick={onRowClick} />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title="会社を新規作成">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="会社名"
            placeholder="株式会社サンプル"
            error={errors.companyName?.message}
            {...register('companyName')}
          />

          <Select
            label="種別"
            options={companyTypeOptions}
            placeholder="選択してください"
            error={errors.companyType?.message}
            {...register('companyType')}
          />

          <Input
            label="代表者"
            placeholder="山田 太郎"
            error={errors.representative?.message}
            {...register('representative')}
          />

          <Input
            label="電話番号"
            placeholder="03-1234-5678"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="メールアドレス"
            type="email"
            placeholder="info@example.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="住所"
            placeholder="東京都渋谷区..."
            error={errors.address?.message}
            {...register('address')}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              キャンセル
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? '作成中...' : '作成'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
