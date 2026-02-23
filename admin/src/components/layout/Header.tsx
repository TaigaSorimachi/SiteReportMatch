import { useAuth } from '@/contexts/AuthContext';
import { fullName, roleLabel } from '@/lib/utils';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">{fullName(user?.lastName, user?.firstName)}</span>
          <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded">{roleLabel(user?.role ?? '')}</span>
        </div>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  );
}
