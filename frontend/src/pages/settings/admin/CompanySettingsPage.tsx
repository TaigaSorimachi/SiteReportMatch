import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { companiesApi } from '@/lib/api/companies';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function CompanySettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    // 日報設定
    defaultReportMode: 'batch',
    allowWorkerModeSwitch: false,
    requirePhoto: false,
    requireSafetyRecord: false,
    // GPS設定
    gpsEnabled: false,
    gpsWorkerCanDisable: false,
    geofenceEnabled: false,
    geofenceDefaultRadiusM: 200,
    // マッチング設定
    matchingEnabled: false,
    autoApproveApplications: false,
    // 人工計算
    standardWorkHours: 8,
    overtimeThresholdHours: 8,
  });

  const isAdminOrOwner = user?.role === 'admin' || user?.role === 'owner';

  useEffect(() => {
    if (!user?.companyId || !isAdminOrOwner) {
      setIsLoading(false);
      return;
    }
    (async () => {
      try {
        const settings = await companiesApi.getSettings(user.companyId!);
        setForm({
          defaultReportMode: settings.defaultReportMode ?? 'batch',
          allowWorkerModeSwitch: settings.allowWorkerModeSwitch ?? false,
          requirePhoto: settings.requirePhoto ?? false,
          requireSafetyRecord: settings.requireSafetyRecord ?? false,
          gpsEnabled: settings.gpsEnabled ?? false,
          gpsWorkerCanDisable: settings.gpsWorkerCanDisable ?? false,
          geofenceEnabled: settings.geofenceEnabled ?? false,
          geofenceDefaultRadiusM: settings.geofenceDefaultRadiusM ?? 200,
          matchingEnabled: settings.matchingEnabled ?? false,
          autoApproveApplications: settings.autoApproveApplications ?? false,
          standardWorkHours: settings.standardWorkHours ?? 8,
          overtimeThresholdHours: settings.overtimeThresholdHours ?? 8,
        });
      } catch {
        // use defaults
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user, isAdminOrOwner]);

  const handleToggle = (field: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumber = (field: string, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user?.companyId) return;
    setIsSaving(true);
    try {
      await companiesApi.updateSettings(user.companyId, form);
      alert('設定を保存しました');
    } catch {
      alert('保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAdminOrOwner) {
    return (
      <>
        <AppHeader title="会社設定" showBack />
        <PageContainer>
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-gray-500">管理者のみ</p>
          </div>
        </PageContainer>
      </>
    );
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <AppHeader title="会社設定" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* 日報設定 */}
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-600">日報設定</h2>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                デフォルト日報モード
              </label>
              <div className="flex gap-4 pt-1">
                {[
                  { value: 'batch', label: '一括入力' },
                  { value: 'realtime', label: 'リアルタイム' },
                  { value: 'both', label: '両方' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="defaultReportMode"
                      value={option.value}
                      checked={form.defaultReportMode === option.value}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, defaultReportMode: e.target.value }))
                      }
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Toggle
              label="作業員によるモード切替を許可"
              checked={form.allowWorkerModeSwitch}
              onChange={(checked) => handleToggle('allowWorkerModeSwitch', checked)}
            />

            <Toggle
              label="写真を必須にする"
              checked={form.requirePhoto}
              onChange={(checked) => handleToggle('requirePhoto', checked)}
            />

            <Toggle
              label="安全記録を必須にする"
              checked={form.requireSafetyRecord}
              onChange={(checked) => handleToggle('requireSafetyRecord', checked)}
            />
          </Card>

          {/* GPS設定 */}
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-600">GPS設定</h2>

            <Toggle
              label="GPS機能を有効にする"
              checked={form.gpsEnabled}
              onChange={(checked) => handleToggle('gpsEnabled', checked)}
            />

            <Toggle
              label="作業員がGPSを無効化できる"
              checked={form.gpsWorkerCanDisable}
              onChange={(checked) => handleToggle('gpsWorkerCanDisable', checked)}
            />

            <Toggle
              label="ジオフェンスを有効にする"
              checked={form.geofenceEnabled}
              onChange={(checked) => handleToggle('geofenceEnabled', checked)}
            />

            <Input
              label="ジオフェンスデフォルト半径 (m)"
              type="number"
              min={0}
              step={50}
              value={form.geofenceDefaultRadiusM}
              onChange={(e) => handleNumber('geofenceDefaultRadiusM', Number(e.target.value))}
            />
          </Card>

          {/* マッチング設定 */}
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-600">マッチング設定</h2>

            <Toggle
              label="マッチング機能を有効にする"
              checked={form.matchingEnabled}
              onChange={(checked) => handleToggle('matchingEnabled', checked)}
            />

            <Toggle
              label="応募を自動承認する"
              checked={form.autoApproveApplications}
              onChange={(checked) => handleToggle('autoApproveApplications', checked)}
            />
          </Card>

          {/* 人工計算 */}
          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-600">人工計算</h2>

            <Input
              label="標準労働時間 (時間)"
              type="number"
              min={1}
              max={24}
              step={0.5}
              value={form.standardWorkHours}
              onChange={(e) => handleNumber('standardWorkHours', Number(e.target.value))}
            />

            <Input
              label="残業閾値 (時間)"
              type="number"
              min={1}
              max={24}
              step={0.5}
              value={form.overtimeThresholdHours}
              onChange={(e) => handleNumber('overtimeThresholdHours', Number(e.target.value))}
            />
          </Card>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? '保存中...' : '保存する'}
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
