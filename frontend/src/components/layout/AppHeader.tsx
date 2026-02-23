import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '@/components/domain/NotificationBell';

interface Props {
  title: string;
  showBack?: boolean;
  showNotification?: boolean;
}

export function AppHeader({ title, showBack = false, showNotification = true }: Props) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-base font-bold text-gray-900 truncate">{title}</h1>
        </div>
        {showNotification && <NotificationBell />}
      </div>
    </header>
  );
}
