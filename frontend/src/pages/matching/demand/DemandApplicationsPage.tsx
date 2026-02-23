import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchingDemandApi } from '@/lib/api/matching-demand';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime, formatCurrency } from '@/lib/utils';
import type { DemandPosting, DemandApplication } from '@/types/api';

export function DemandApplicationsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posting, setPosting] = useState<DemandPosting | null>(null);
  const [applications, setApplications] = useState<DemandApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [postingData, appsData] = await Promise.all([
          matchingDemandApi.detail(id),
          matchingDemandApi.getApplications(id),
        ]);
        setPosting(postingData);
        setApplications(appsData);
      } catch {
        setError('応募情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const isOwner = posting && user && posting.companyId === user.companyId;

  const handleAccept = async (applicationId: string) => {
    if (!id) return;
    setActionLoading(applicationId);
    try {
      await matchingDemandApi.acceptApplication(id, applicationId);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: 'accepted' } : app,
        ),
      );
    } catch {
      alert('承認に失敗しました');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!id) return;
    const reason = window.prompt('差戻し理由を入力してください（任意）');
    setActionLoading(applicationId);
    try {
      await matchingDemandApi.rejectApplication(id, applicationId, reason ?? undefined);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: 'rejected' } : app,
        ),
      );
    } catch {
      alert('差戻しに失敗しました');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <>
        <AppHeader title="応募一覧" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader title="応募一覧" showBack />
        <PageContainer>
          <EmptyState message={error} />
        </PageContainer>
      </>
    );
  }

  const pendingApps = applications.filter((a) => a.status === 'pending');
  const decidedApps = applications.filter((a) => a.status !== 'pending');

  return (
    <>
      <AppHeader title="応募一覧" showBack />
      <PageContainer>
        {/* ── Posting summary ── */}
        {posting && (
          <Card className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-900 truncate">{posting.siteName}</h2>
              <Badge status={posting.status} />
            </div>
            <p className="text-xs text-gray-500">
              応募 {applications.length}件 / 必要 {posting.requiredCount}名 / 確定 {posting.confirmedCount}名
            </p>
          </Card>
        )}

        {/* ── Applications ── */}
        {applications.length === 0 ? (
          <EmptyState message="まだ応募がありません" />
        ) : (
          <div className="space-y-4">
            {/* Pending applications */}
            {pendingApps.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  未対応 ({pendingApps.length}件)
                </h3>
                <div className="space-y-3">
                  {pendingApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      isOwner={!!isOwner}
                      isActionLoading={actionLoading === app.id}
                      onAccept={() => handleAccept(app.id)}
                      onReject={() => handleReject(app.id)}
                      onNavigateMessages={() => navigate(`/matching/messages/demand/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Decided applications */}
            {decidedApps.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  対応済 ({decidedApps.length}件)
                </h3>
                <div className="space-y-3">
                  {decidedApps.map((app) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      isOwner={!!isOwner}
                      isActionLoading={actionLoading === app.id}
                      onAccept={() => handleAccept(app.id)}
                      onReject={() => handleReject(app.id)}
                      onNavigateMessages={() => navigate(`/matching/messages/demand/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </>
  );
}

// ─── Application Card sub-component ───────────────────────────────

interface ApplicationCardProps {
  application: DemandApplication;
  isOwner: boolean;
  isActionLoading: boolean;
  onAccept: () => void;
  onReject: () => void;
  onNavigateMessages: () => void;
}

function ApplicationCard({
  application,
  isOwner,
  isActionLoading,
  onAccept,
  onReject,
  onNavigateMessages,
}: ApplicationCardProps) {
  const applicantName = application.applicant
    ? `${application.applicant.lastName} ${application.applicant.firstName}`
    : '応募者';

  return (
    <Card>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shrink-0">
            {application.applicant?.avatarUrl ? (
              <img
                src={application.applicant.avatarUrl}
                alt={applicantName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{applicantName}</p>
            <p className="text-xs text-gray-500">{formatDateTime(application.createdAt)}</p>
          </div>
        </div>
        <Badge status={application.status} />
      </div>

      {/* Details */}
      <div className="space-y-1 mb-3">
        {application.proposedRate != null && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">希望単価:</span>
            <span className="font-medium text-gray-900">{formatCurrency(application.proposedRate)}/日</span>
          </div>
        )}
        {application.availableCount != null && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">対応可能人数:</span>
            <span className="font-medium text-gray-900">{application.availableCount}名</span>
          </div>
        )}
        {application.message && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{application.message}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isOwner && application.status === 'pending' && (
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="primary"
            size="sm"
            onClick={onAccept}
            disabled={isActionLoading}
            className="flex-1"
          >
            {isActionLoading ? '処理中...' : '承認する'}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onReject}
            disabled={isActionLoading}
            className="flex-1"
          >
            差戻す
          </Button>
        </div>
      )}

      {/* Message link */}
      <button
        type="button"
        onClick={onNavigateMessages}
        className="mt-2 text-sm text-green-600 font-medium"
      >
        メッセージを送る
      </button>
    </Card>
  );
}
