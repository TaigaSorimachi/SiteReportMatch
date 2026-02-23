import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { liffLogin } from '@/lib/liff';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function LoginPage() {
  const navigate = useNavigate();
  const { devLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDevLogin = async () => {
    if (!identifier.trim()) {
      alert('メールアドレスまたはユーザーIDを入力してください');
      return;
    }
    setIsLoading(true);
    try {
      await devLogin(identifier.trim());
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ログインに失敗しました';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLiffLogin = () => {
    try {
      liffLogin();
    } catch {
      alert('LIFFログインに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-green-700">SiteReportMatch</h1>
          <p className="text-sm text-gray-500">現場日報 &amp; マッチングサービス</p>
        </div>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800">LINEでログイン</h2>
          <Button variant="primary" onClick={handleLiffLogin}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.83 1.63 5.35 4.18 7.02L5 22l4.2-2.33c.9.21 1.84.33 2.8.33 5.52 0 10-3.82 10-8.5S17.52 2 12 2z" />
            </svg>
            LINEアカウントでログイン
          </Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800">開発者ログイン</h2>
          <Input
            label="メールアドレス / ユーザーID"
            placeholder="test@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDevLogin();
            }}
          />
          <Button
            variant="secondary"
            onClick={handleDevLogin}
            disabled={isLoading || !identifier.trim()}
          >
            {isLoading ? 'ログイン中...' : '開発者ログイン'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
