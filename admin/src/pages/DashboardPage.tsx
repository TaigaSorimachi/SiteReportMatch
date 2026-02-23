import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companiesApi } from '@/lib/api/companies';
import { usersApi } from '@/lib/api/users';
import { projectsApi } from '@/lib/api/projects';
import { fullName } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface StatCard {
  icon: string;
  label: string;
  value: number;
}

function StatCardItem({ icon, label, value }: StatCard) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'admin') {
          const [companies, users, projects] = await Promise.all([
            companiesApi.list({ limit: 1 }),
            usersApi.list({ limit: 1 }),
            projectsApi.list({ limit: 1 }),
          ]);
          setStats([
            { icon: '\u{1F3E2}', label: '\u4F1A\u793E\u6570', value: companies.meta.total },
            { icon: '\u{1F465}', label: '\u30E6\u30FC\u30B6\u30FC\u6570', value: users.meta.total },
            { icon: '\u{1F4CB}', label: '\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u6570', value: projects.meta.total },
          ]);
        }
      } catch {
        // Stats failed to load - show empty
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {fullName(user?.lastName, user?.firstName)} さん、こんにちは
        </h1>
        <p className="mt-1 text-sm text-gray-500">ダッシュボード</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <StatCardItem key={stat.label} {...stat} />
        ))}
      </div>
    </div>
  );
}
