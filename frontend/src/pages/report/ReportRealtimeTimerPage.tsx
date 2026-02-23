import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { GeofenceIndicator } from '@/components/domain/GeofenceIndicator';
import { TimerDisplay } from '@/components/domain/TimerDisplay';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTimer } from '@/hooks/useTimer';
import { useGeofenceCheck } from '@/hooks/useGeofenceCheck';
import { reportsApi } from '@/lib/api/reports';
import { formatTimer } from '@/lib/utils';
import type { ActiveReport } from '@/types/app';

const STORAGE_KEY = 'srm_active_report';

export function ReportRealtimeTimerPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState<ActiveReport | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: ActiveReport = JSON.parse(stored);
        setActiveReport(parsed);
      } catch {
        setError('作業情報の読み込みに失敗しました');
      }
    } else {
      setError('作業中のレポートが見つかりません');
    }
  }, []);

  const startTime = useMemo(() => {
    if (!activeReport?.startTime) return null;
    return new Date(activeReport.startTime);
  }, [activeReport?.startTime]);

  const timer = useTimer(startTime);
  const { status: geofenceStatus } = useGeofenceCheck(activeReport?.projectId ?? null);

  const handleBreakToggle = async () => {
    if (!reportId || processing) return;
    setProcessing(true);
    setError(null);

    try {
      if (timer.isOnBreak) {
        await reportsApi.endBreak(reportId);
        timer.endBreak();
      } else {
        await reportsApi.startBreak(reportId);
        timer.startBreak();
      }
    } catch (err: any) {
      setError(err.message || '休憩処理に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (!reportId || processing) return;
    setProcessing(true);
    setError(null);

    try {
      await reportsApi.clockOut(reportId, {});
      navigate(`/report/realtime/supplement/${reportId}`);
    } catch (err: any) {
      setError(err.message || '退勤処理に失敗しました');
      setProcessing(false);
    }
  };

  if (!activeReport && !error) {
    return (
      <>
        <AppHeader title="作業中" />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <AppHeader title="作業中" />
      <PageContainer>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Geofence indicator */}
        {geofenceStatus && (
          <div className="mb-4">
            <GeofenceIndicator
              distanceMeters={geofenceStatus.distanceMeters}
              isInside={geofenceStatus.isInsideGeofence}
              projectName={activeReport?.projectName ?? geofenceStatus.projectName}
            />
          </div>
        )}

        {/* Project name */}
        {activeReport && !geofenceStatus && (
          <div className="text-center mb-2">
            <p className="text-sm font-medium text-gray-700">{activeReport.projectName}</p>
          </div>
        )}

        {/* Timer display */}
        <TimerDisplay
          seconds={timer.elapsed}
          label={timer.isOnBreak ? '休憩中' : '作業中'}
        />

        {/* Clock-in time and break total */}
        <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
          {activeReport?.startTime && (
            <div className="text-center">
              <p className="text-xs text-gray-400">出勤時刻</p>
              <p className="font-medium text-gray-700">
                {new Date(activeReport.startTime).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          )}
          <div className="text-center">
            <p className="text-xs text-gray-400">休憩合計</p>
            <p className="font-medium text-gray-700">{formatTimer(timer.breakTotal)}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-4">
          <Button
            size="lg"
            variant={timer.isOnBreak ? 'secondary' : 'primary'}
            className={
              timer.isOnBreak
                ? ''
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
            onClick={handleBreakToggle}
            disabled={processing}
          >
            {processing && !timer.isOnBreak
              ? '処理中...'
              : timer.isOnBreak
                ? '休憩終了'
                : '休憩する'}
          </Button>

          <Button
            size="lg"
            variant="danger"
            onClick={handleClockOut}
            disabled={processing}
          >
            {processing && !timer.isOnBreak ? '処理中...' : '作業終了'}
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
