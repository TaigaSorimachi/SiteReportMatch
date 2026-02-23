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

export function ReportRealtimeProjectPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockingIn, setClockingIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await projectsApi.list({ status: 'active' });
        setProjects(res.data);
      } catch (err: any) {
        setError(err.message || '案件の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelectProject = async (project: Project) => {
    if (clockingIn) return;
    setClockingIn(project.id);
    setError(null);

    try {
      const coords = await getCurrentPosition();
      const report = await reportsApi.clockIn({
        projectId: project.id,
        location: {
          latitude: coords.latitude,
          longitude: coords.longitude,
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
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`cursor-pointer transition-shadow hover:shadow-md active:bg-gray-50 ${
                clockingIn === project.id ? 'opacity-60 pointer-events-none' : ''
              }`}
              onClick={() => handleSelectProject(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900 truncate">
                    {project.projectName}
                  </h3>
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
                  {clockingIn === project.id ? (
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
          ))}
        </div>
      </PageContainer>
    </>
  );
}
