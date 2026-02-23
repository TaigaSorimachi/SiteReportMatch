import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { GeofenceIndicator } from '@/components/domain/GeofenceIndicator';
import { TimerDisplay } from '@/components/domain/TimerDisplay';
import { useTimer } from '@/hooks/useTimer';
import { useGeofenceCheck } from '@/hooks/useGeofenceCheck';
import { projectsApi } from '@/lib/api/projects';
import { reportsApi } from '@/lib/api/reports';
import { getCurrentPosition } from '@/lib/geolocation';
import { formatTimer } from '@/lib/utils';
import type { Project, DailyReport } from '@/types/api';
import type { ActiveReport } from '@/types/app';

const STORAGE_KEY = 'srm_active_report';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTodayDisplay(): string {
  const now = new Date();
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const day = days[now.getDay()];
  return `${y}年${m}月${d}日(${day})`;
}

// ──────────────────────────────────────────────────────────────────────
// Embedded timer section (used when an active report exists)
// ──────────────────────────────────────────────────────────────────────
function ActiveTimerSection({
  activeReport,
  onClockOut,
}: {
  activeReport: ActiveReport;
  onClockOut: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTime = useMemo(
    () => new Date(activeReport.startTime),
    [activeReport.startTime],
  );

  const timer = useTimer(startTime);
  const { status: geofenceStatus } = useGeofenceCheck(activeReport.projectId);

  const handleBreakToggle = async () => {
    if (processing) return;
    setProcessing(true);
    setError(null);

    try {
      if (timer.isOnBreak) {
        await reportsApi.endBreak(activeReport.reportId);
        timer.endBreak();
      } else {
        await reportsApi.startBreak(activeReport.reportId);
        timer.startBreak();
      }
    } catch (err: any) {
      setError(err.message || '休憩処理に失敗しました');
    } finally {
      setProcessing(false);
    }
  };

  const handleClockOut = async () => {
    if (processing) return;
    setProcessing(true);
    setError(null);

    try {
      await reportsApi.clockOut(activeReport.reportId, {});
      onClockOut();
    } catch (err: any) {
      setError(err.message || '退勤処理に失敗しました');
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {geofenceStatus && (
        <GeofenceIndicator
          distanceMeters={geofenceStatus.distanceMeters}
          isInside={geofenceStatus.isInsideGeofence}
          projectName={activeReport.projectName ?? geofenceStatus.projectName}
        />
      )}

      {!geofenceStatus && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{activeReport.projectName}</p>
        </div>
      )}

      <TimerDisplay
        seconds={timer.elapsed}
        label={timer.isOnBreak ? '休憩中' : '作業中'}
      />

      <div className="flex justify-center gap-8 text-sm text-gray-500">
        <div className="text-center">
          <p className="text-xs text-gray-400">出勤時刻</p>
          <p className="font-medium text-gray-700">
            {new Date(activeReport.startTime).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">休憩合計</p>
          <p className="font-medium text-gray-700">{formatTimer(timer.breakTotal)}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
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
          {timer.isOnBreak ? '休憩終了' : '休憩する'}
        </Button>

        <Button
          size="lg"
          variant="danger"
          onClick={handleClockOut}
          disabled={processing}
        >
          {processing ? '処理中...' : '作業終了'}
        </Button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Clock-in section (used when no active report exists)
// ──────────────────────────────────────────────────────────────────────
function ClockInSection({
  onClockInComplete,
}: {
  onClockInComplete: (report: ActiveReport) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportedProjectIds, setReportedProjectIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const today = getTodayString();
        const [projectsRes, reportsRes] = await Promise.all([
          projectsApi.list({ status: 'active' }),
          reportsApi.list({ dateFrom: today, dateTo: today }),
        ]);
        setProjects(projectsRes.data);
        setReportedProjectIds(new Set(reportsRes.data.map((r: any) => r.projectId)));
      } catch (err: any) {
        setError(err.message || '案件の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const projectOptions = projects
    .filter((p) => !reportedProjectIds.has(p.id))
    .map((p) => ({
      value: p.id,
      label: p.projectName,
    }));

  const handleClockIn = async () => {
    if (!selectedProjectId || clockingIn) return;
    setClockingIn(true);
    setError(null);

    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) return;

    try {
      const coords = await getCurrentPosition();
      const report = await reportsApi.clockIn({
        projectId: project.id,
        location: {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        },
      });

      const activeReport: ActiveReport = {
        reportId: report.id,
        projectId: project.id,
        projectName: project.projectName,
        startTime: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeReport));
      onClockInComplete(activeReport);
    } catch (err: any) {
      setError(err.message || '出勤処理に失敗しました');
      setClockingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Today's date */}
      <div className="text-center">
        <p className="text-lg font-bold text-gray-900">{formatTodayDisplay()}</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Project selector */}
          <Select
            label="案件を選択"
            options={projectOptions}
            placeholder="案件を選択してください"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          />

          {/* Clock-in button */}
          <Button
            size="lg"
            onClick={handleClockIn}
            disabled={!selectedProjectId || clockingIn}
            className="bg-green-600 hover:bg-green-700 active:bg-green-800"
          >
            {clockingIn ? '出勤処理中...' : '出勤'}
          </Button>
        </>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Timeline entry
// ──────────────────────────────────────────────────────────────────────
function TimelineEntry({ report }: { report: DailyReport }) {
  const clockInTime = report.clockIn
    ? new Date(report.clockIn).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : '--:--';
  const clockOutTime = report.clockOut
    ? new Date(report.clockOut).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {report.project?.projectName ?? '案件'}
        </p>
        <p className="text-xs text-gray-500">
          {clockInTime} ~ {clockOutTime}
          {report.workMinutes != null && (
            <span className="ml-2">({Math.floor(report.workMinutes / 60)}h{report.workMinutes % 60}m)</span>
          )}
        </p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          report.status === 'submitted'
            ? 'bg-purple-100 text-purple-700'
            : report.status === 'approved'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-700'
        }`}
      >
        {report.status === 'submitted'
          ? '提出済'
          : report.status === 'approved'
            ? '承認済'
            : report.status}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Main page
// ──────────────────────────────────────────────────────────────────────
export function AttendancePage() {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState<ActiveReport | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [todayReports, setTodayReports] = useState<DailyReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // Check localStorage for active report
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setActiveReport(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setHasCheckedStorage(true);
  }, []);

  // Load today's reports
  useEffect(() => {
    (async () => {
      try {
        const today = getTodayString();
        const res = await reportsApi.list({ dateFrom: today, dateTo: today });
        setTodayReports(res.data);
      } catch {
        // silently fail for timeline
      } finally {
        setLoadingReports(false);
      }
    })();
  }, [activeReport]);

  const handleClockOut = () => {
    const reportId = activeReport?.reportId;
    localStorage.removeItem(STORAGE_KEY);
    setActiveReport(null);
    if (reportId) {
      navigate(`/report/realtime/supplement/${reportId}`);
    }
  };

  if (!hasCheckedStorage) {
    return (
      <>
        <AppHeader title="出退勤" />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <AppHeader title="出退勤" />
      <PageContainer>
        {activeReport ? (
          <ActiveTimerSection
            activeReport={activeReport}
            onClockOut={handleClockOut}
          />
        ) : (
          <ClockInSection
            onClockInComplete={(report) => setActiveReport(report)}
          />
        )}

        {/* Today's attendance timeline */}
        <div className="mt-8">
          <h2 className="text-sm font-bold text-gray-700 mb-3">本日の勤怠</h2>
          {loadingReports ? (
            <LoadingSpinner />
          ) : todayReports.length === 0 ? (
            <EmptyState message="本日の勤怠記録はありません" />
          ) : (
            <Card>
              {todayReports.map((report) => (
                <TimelineEntry key={report.id} report={report} />
              ))}
            </Card>
          )}
        </div>
      </PageContainer>
    </>
  );
}
