import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/lib/api/users';
import { companiesApi } from '@/lib/api/companies';
import { fullName, roleLabel, formatDate } from '@/lib/utils';
import type { User, Company, PaginatedResponse } from '@/types/api';
import Table, { type Column } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const ROLE_BADGE_VARIANT: Record<string, 'purple' | 'blue' | 'green' | 'gray'> = {
  admin: 'purple',
  owner: 'blue',
  worker: 'gray',
};

export default function MemberListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [data, setData] = useState<PaginatedResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);

  // Load companies list for the filter dropdown (platform only)
  useEffect(() => {
    if (!isAdmin) return;
    const loadCompanies = async () => {
      try {
        const res = await companiesApi.list({ limit: 1000 });
        setCompanies(res.data);
      } catch {
        // failed to load companies
      }
    };
    loadCompanies();
  }, [isAdmin]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 20 };
      if (keyword) {
        params.keyword = keyword;
      }
      if (isAdmin) {
        if (companyFilter) {
          params.companyId = companyFilter;
        }
      } else if (user?.companyId) {
        // Admin role: auto-filter by own company
        params.companyId = user.companyId;
      }
      const res = await usersApi.list(params);
      setData(res);
    } catch {
      // failed to fetch users
    } finally {
      setLoading(false);
    }
  }, [page, keyword, companyFilter, isAdmin, user?.companyId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setPage(1);
  };

  const handleCompanyFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompanyFilter(e.target.value);
    setPage(1);
  };

  const companyFilterOptions = useMemo(
    () => [
      { value: '', label: 'すべて' },
      ...companies.map((c) => ({ value: c.id, label: c.companyName })),
    ],
    [companies],
  );

  const columns = useMemo<Column<User>[]>(() => {
    const cols: Column<User>[] = [
      {
        header: '名前',
        render: (row) => fullName(row.lastName, row.firstName),
        width: '20%',
      },
      {
        header: 'メール',
        render: (row) => row.email ?? '-',
        width: '25%',
      },
      {
        header: 'ロール',
        render: (row) => (
          <Badge variant={ROLE_BADGE_VARIANT[row.role] ?? 'gray'}>
            {roleLabel(row.role)}
          </Badge>
        ),
        width: '12%',
      },
      {
        header: '所属会社',
        render: (row) => row.company?.companyName ?? '-',
        width: '23%',
      },
      {
        header: '登録日',
        render: (row) => formatDate(row.createdAt),
        width: '20%',
      },
    ];
    return cols;
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">メンバー一覧</h1>
        <Button onClick={() => navigate('/members/new')}>新規作成</Button>
      </div>

      <div className="flex items-end gap-4">
        <div className="w-64">
          <Input
            label="検索"
            placeholder="名前・メールで検索"
            value={keyword}
            onChange={handleKeywordChange}
          />
        </div>
        {isAdmin && (
          <div className="w-48">
            <Select
              label="所属会社"
              options={companyFilterOptions}
              value={companyFilter}
              onChange={handleCompanyFilterChange}
            />
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Table<User>
            columns={columns}
            data={data?.data ?? []}
            onRowClick={(row) => navigate(`/members/${row.id}`)}
            emptyMessage="メンバーが見つかりません"
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
