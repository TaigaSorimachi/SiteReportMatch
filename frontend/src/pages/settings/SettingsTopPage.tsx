import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface NavItem {
  label: string;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'プロフィール編集', path: '/settings/profile' },
  { label: '資格管理', path: '/settings/licenses' },
  { label: '通知設定', path: '/settings/notifications' },
  { label: '会社設定', path: '/settings/company', adminOnly: true },
  { label: 'カスタム項目管理', path: '/settings/custom-fields', adminOnly: true },
];

export function SettingsTopPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || isAdminOrOwner,
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <AppHeader title="設定" />
      <PageContainer>
        <Card className="divide-y divide-gray-100 !p-0 overflow-hidden">
          {visibleItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800">{item.label}</span>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </Card>

        <div className="mt-8">
          <Button variant="danger" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
