import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchingSupplyApi } from '@/lib/api/matching-supply';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/utils';
import type { SupplyInquiry, SupplyPosting } from '@/types/api';

export function SupplyInquiriesPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [posting, setPosting] = useState<SupplyPosting | null>(null);
  const [inquiries, setInquiries] = useState<SupplyInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [postingData, inquiriesData] = await Promise.all([
          matchingSupplyApi.detail(id),
          matchingSupplyApi.getInquiries(id),
        ]);
        setPosting(postingData);
        setInquiries(inquiriesData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '問合せ一覧の取得に失敗しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAccept = async (inquiryId: string) => {
    if (!id) return;
    setProcessingId(inquiryId);
    try {
      await matchingSupplyApi.acceptInquiry(id, inquiryId);
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: 'accepted' } : inq,
        ),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '承認に失敗しました';
      alert(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (inquiryId: string) => {
    if (!id) return;
    setProcessingId(inquiryId);
    try {
      await matchingSupplyApi.rejectInquiry(id, inquiryId);
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: 'rejected' } : inq,
        ),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '却下に失敗しました';
      alert(message);
    } finally {
      setProcessingId(null);
    }
  };

  const isOwner = posting && user?.id === posting.userId;

  if (loading) {
    return (
      <>
        <AppHeader title="問合せ一覧" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <AppHeader title="問合せ一覧" showBack />
        <PageContainer>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <AppHeader title="問合せ一覧" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Posting summary */}
          {posting && (
            <Card className="space-y-1">
              <p className="text-xs text-gray-500">対象投稿</p>
              <p className="text-sm font-medium text-gray-900">
                {posting.title ||
                  (posting.workType
                    ? posting.workType.workTypeName
                    : '---')}
              </p>
            </Card>
          )}

          {inquiries.length === 0 && (
            <EmptyState message="問合せはまだありません" />
          )}

          {inquiries.map((inquiry) => (
            <Card key={inquiry.id} className="space-y-3">
              {/* Inquirer info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {inquiry.inquirer
                      ? `${inquiry.inquirer.lastName?.charAt(0) || ''}${inquiry.inquirer.firstName?.charAt(0) || ''}`
                      : '--'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {inquiry.inquirer
                        ? `${inquiry.inquirer.lastName} ${inquiry.inquirer.firstName}`
                        : '---'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDateTime(inquiry.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge status={inquiry.status} />
              </div>

              {/* Message */}
              {inquiry.message && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    {inquiry.message}
                  </p>
                </div>
              )}

              {/* Accept / Reject buttons (only for posting owner, pending inquiries) */}
              {isOwner && inquiry.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReject(inquiry.id)}
                    disabled={processingId === inquiry.id}
                  >
                    {processingId === inquiry.id ? '処理中...' : '却下'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAccept(inquiry.id)}
                    disabled={processingId === inquiry.id}
                  >
                    {processingId === inquiry.id ? '処理中...' : '承認'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </PageContainer>
    </>
  );
}
