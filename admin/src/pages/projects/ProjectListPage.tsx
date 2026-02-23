import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi } from '@/lib/api/projects';
import { formatDate, formatCurrency, statusLabel } from '@/lib/utils';
import type { Project, PaginatedResponse } from '@/types/api';
import Table, { type Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'planning', label: '計画中' },
  { value: 'active', label: '稼働中' },
  { value: 'completed', label: '完了' },
  { value: 'suspended', label: '中断' },
  { value: 'cancelled', label: 'キャンセル' },
];

const STATUS_BADGE_VARIANT: Record<string, 'green' | 'blue' | 'gray' | 'yellow' | 'red'> = {
  active: 'green',
  planning: 'blue',
  completed: 'gray',
  suspended: 'yellow',
  cancelled: 'red',
};

export default function ProjectListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState<PaginatedResponse<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (!isAdmin && user?.companyId) {
        params.companyId = user.companyId;
      }
      const res = await projectsApi.list(params);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, isAdmin, user?.companyId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const columns = useMemo<Column<Project>[]>(() => {
    const cols: Column<Project>[] = [
      {
        header: '案件名',
        accessor: 'projectName',
        width: '20%',
      },
      {
        header: '現場名',
        render: (row) => row.siteName ?? '-',
      },
      {
        header: 'ステータス',
        render: (row) => (
          <Badge variant={STATUS_BADGE_VARIANT[row.status] ?? 'gray'}>
            {statusLabel(row.status)}
          </Badge>
        ),
      },
      {
        header: '契約金額',
        render: (row) => formatCurrency(row.contractAmount),
      },
      {
        header: '工期',
        render: (row) => {
          const start = formatDate(row.scheduledStart);
          const end = formatDate(row.scheduledEnd);
          if (start === '-' && end === '-') return '-';
          return `${start} ~ ${end}`;
        },
      },
    ];

    if (isAdmin) {
      cols.push({
        header: '所属会社',
        render: (row) => row.company?.companyName ?? '-',
      });
    }

    return cols;
  }, [isAdmin]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">案件一覧</h1>
        <Button onClick={() => navigate('/projects/new')}>新規作成</Button>
      </div>

      <div className="flex items-end gap-4">
        <div className="w-48">
          <Select
            label="ステータス"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table<Project>
            columns={columns}
            data={data?.data ?? []}
            onRowClick={(row) => navigate(`/projects/${row.id}`)}
            emptyMessage="案件が見つかりません"
          />
          {data && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
