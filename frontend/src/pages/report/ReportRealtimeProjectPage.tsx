import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { projectsApi } from '@/lib/api/projects';
import { reportsApi } from '@/lib/api/reports';
import { getCurrentPosition } from '@/lib/geolocation';
import type { Project } from '@/types/api';
import type { ActiveReport } from '@/types/app';

const STORAGE_KEY = 'srm_active_report';

function getTodayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ReportRealtimeProjectPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState<string | null>(null);
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

  const handleSelectProject = async (project: Project) => {
    if (clockingIn) return;
    if (reportedProjectIds.has(project.id)) return;
    setClockingIn(project.id);
    setError(null);

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

      navigate(`/report/realtime/timer/${report.id}`);
    } catch (err: any) {
      setError(err.message || '出勤処理に失敗しました');
      setClockingIn(null);
    }
  };

  return (
    <>
      <AppHeader title="案件選択" showBack />
      <PageContainer>
        {loading && <LoadingSpinner />}

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!loading && projects.length === 0 && (
          <EmptyState message="稼働中の案件がありません" />
        )}

        <div className="space-y-3">
          {projects.map((project) => {
            const isReported = reportedProjectIds.has(project.id);
            return (
              <Card
                key={project.id}
                className={`transition-shadow ${
                  isReported
                    ? 'opacity-50 cursor-not-allowed'
                    : `cursor-pointer hover:shadow-md active:bg-gray-50 ${
                        clockingIn === project.id ? 'opacity-60 pointer-events-none' : ''
                      }`
                }`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        {project.projectName}
                      </h3>
                      {isReported && (
                        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          登録済み
                        </span>
                      )}
                    </div>
                    {project.siteName && (
                      <p className="text-sm text-gray-500 mt-1">{project.siteName}</p>
                    )}
                    {project.siteAddress && (
                      <p className="text-xs text-gray-400 mt-0.5">{project.siteAddress}</p>
                    )}
                    {(project.scheduledStart || project.scheduledEnd) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {project.scheduledStart && project.scheduledStart.slice(0, 10)}
                        {project.scheduledStart && project.scheduledEnd && ' ~ '}
                        {project.scheduledEnd && project.scheduledEnd.slice(0, 10)}
                      </p>
                    )}
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    {isReported ? (
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : clockingIn === project.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-green-600" />
                    ) : (
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </PageContainer>
    </>
  );
}
