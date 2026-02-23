import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { workersApi } from '@/lib/api/workers';
import { useMasters } from '@/hooks/useMasters';
import { formatDate } from '@/lib/utils';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { WorkerLicense } from '@/types/api';

function isExpiringSoon(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 30;
}

function isExpired(expiryDate?: string): boolean {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
}

export function LicenseManagePage() {
  const { user } = useAuth();
  const { data: masters, isLoading: mastersLoading } = useMasters();
  const [licenses, setLicenses] = useState<WorkerLicense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    licenseId: '',
    licenseNumber: '',
    issuedDate: '',
    expiryDate: '',
  });

  const loadLicenses = useCallback(async () => {
    if (!user) return;
    try {
      const data = await workersApi.getLicenses(user.id);
      setLicenses(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  const resetForm = () => {
    setForm({ licenseId: '', licenseNumber: '', issuedDate: '', expiryDate: '' });
    setShowForm(false);
  };

  const handleAdd = async () => {
    if (!user || !form.licenseId) return;
    setIsSaving(true);
    try {
      await workersApi.addLicense(user.id, form);
      resetForm();
      await loadLicenses();
    } catch {
      alert('資格の追加に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (licenseRecordId: string) => {
    if (!user) return;
    if (!window.confirm('この資格を削除しますか？')) return;
    try {
      await workersApi.removeLicense(user.id, licenseRecordId);
      await loadLicenses();
    } catch {
      alert('削除に失敗しました');
    }
  };

  const licenseOptions = (masters?.licenses ?? []).map((l) => ({
    value: l.id,
    label: l.licenseName,
  }));

  if (isLoading || mastersLoading) return <LoadingSpinner />;

  return (
    <>
      <AppHeader title="資格管理" showBack />
      <PageContainer>
        <div className="space-y-4">
          {licenses.length === 0 && !showForm && (
            <EmptyState message="登録済みの資格はありません" />
          )}

          {licenses.map((lic) => (
            <Card key={lic.id} className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {lic.license?.licenseName ?? '資格'}
                  </p>
                  {lic.licenseNumber && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      番号: {lic.licenseNumber}
                    </p>
                  )}
                  {lic.issuedDate && (
                    <p className="text-xs text-gray-500">
                      取得日: {formatDate(lic.issuedDate)}
                    </p>
                  )}
                  {lic.expiryDate && (
                    <p className="text-xs text-gray-500">
                      有効期限: {formatDate(lic.expiryDate)}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(lic.id)}
                  className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="削除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {isExpired(lic.expiryDate) && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-50 rounded-lg">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-red-700">有効期限切れ</span>
                </div>
              )}

              {!isExpired(lic.expiryDate) && isExpiringSoon(lic.expiryDate) && (
                <div className="flex items-center gap-1.5 px-2 py-1.5 bg-yellow-50 rounded-lg">
                  <svg className="w-4 h-4 text-yellow-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-yellow-700">有効期限が近づいています（30日以内）</span>
                </div>
              )}
            </Card>
          ))}

          {showForm && (
            <Card className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">資格を追加</h3>

              <Select
                label="資格"
                options={licenseOptions}
                placeholder="資格を選択"
                value={form.licenseId}
                onChange={(e) => setForm((p) => ({ ...p, licenseId: e.target.value }))}
                required
              />

              <Input
                label="資格番号"
                value={form.licenseNumber}
                onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                placeholder="任意"
              />

              <Input
                label="取得日"
                type="date"
                value={form.issuedDate}
                onChange={(e) => setForm((p) => ({ ...p, issuedDate: e.target.value }))}
              />

              <Input
                label="有効期限"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
              />

              <div className="flex gap-2">
                <Button variant="secondary" onClick={resetForm} className="flex-1">
                  キャンセル
                </Button>
                <Button onClick={handleAdd} disabled={isSaving || !form.licenseId} className="flex-1">
                  {isSaving ? '追加中...' : '追加'}
                </Button>
              </div>
            </Card>
          )}

          {!showForm && (
            <Button onClick={() => setShowForm(true)}>
              追加
            </Button>
          )}
        </div>
      </PageContainer>
    </>
  );
}
