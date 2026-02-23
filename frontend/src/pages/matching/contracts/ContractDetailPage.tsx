import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { matchingContractsApi } from '@/lib/api/matching-contracts';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import type { MatchContract } from '@/types/api';

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contract, setContract] = useState<MatchContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await matchingContractsApi.detail(id);
        setContract(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '成約詳細の取得に失敗しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleComplete = async () => {
    if (!id || !confirm('この成約を完了にしますか？')) return;
    setCompleting(true);
    try {
      const updated = await matchingContractsApi.complete(id);
      setContract((prev) => (prev ? { ...prev, status: 'completed', ...updated } : prev));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '完了処理に失敗しました';
      alert(message);
    } finally {
      setCompleting(false);
    }
  };

  const handleCancel = async () => {
    const reason = prompt('キャンセル理由を入力してください');
    if (!id || reason === null) return;
    setCancelling(true);
    try {
      const updated = await matchingContractsApi.cancel(id, { reason });
      setContract((prev) => (prev ? { ...prev, status: 'cancelled', ...updated } : prev));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'キャンセルに失敗しました';
      alert(message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="成約詳細" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error || !contract) {
    return (
      <>
        <AppHeader title="成約詳細" showBack />
        <PageContainer>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error || 'データが見つかりません'}</p>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <AppHeader title="成約詳細" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Status header */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">ステータス</h2>
              <Badge status={contract.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">契約種別</p>
                <p className="font-medium text-gray-900">
                  {contract.contractType === 'daily_rate' ? '単価契約' : '請負契約'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">合意単価</p>
                <p className="font-medium text-gray-900">
                  {contract.agreedRate ? `${formatCurrency(contract.agreedRate)}/日` : '---'}
                </p>
              </div>
            </div>
          </Card>

          {/* Parties */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">当事者</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                  発注
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contract.clientCompany?.companyName || '---'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-medium text-green-700">
                  作業
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contract.workerUser
                      ? `${contract.workerUser.lastName} ${contract.workerUser.firstName}`
                      : '---'}
                  </p>
                  {contract.workerCompanyId && (
                    <p className="text-xs text-gray-500">所属企業あり</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Period */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">契約期間</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">開始日</p>
                <p className="text-sm font-medium text-gray-900">
                  {contract.workDateStart ? formatDate(contract.workDateStart) : '---'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">終了日</p>
                <p className="text-sm font-medium text-gray-900">
                  {contract.workDateEnd ? formatDate(contract.workDateEnd) : '---'}
                </p>
              </div>
            </div>
            {contract.completedAt && (
              <div>
                <p className="text-xs text-gray-500">完了日時</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(contract.completedAt)}
                </p>
              </div>
            )}
            {contract.cancelledAt && (
              <div>
                <p className="text-xs text-gray-500">キャンセル日時</p>
                <p className="text-sm font-medium text-red-600">
                  {formatDateTime(contract.cancelledAt)}
                </p>
              </div>
            )}
            {contract.cancelReason && (
              <div>
                <p className="text-xs text-gray-500">キャンセル理由</p>
                <p className="text-sm text-gray-800">{contract.cancelReason}</p>
              </div>
            )}
          </Card>

          {/* Related postings */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">関連投稿</h3>
            {contract.demandPosting && (
              <button
                className="w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => navigate(`/matching/demand/${contract.demandPostingId}`)}
              >
                <p className="text-xs text-gray-500">求人投稿</p>
                <p className="text-sm font-medium text-gray-900">
                  {contract.demandPosting.siteName}
                </p>
                <p className="text-xs text-gray-500">
                  {contract.demandPosting.sitePrefecture}
                  {contract.demandPosting.siteCity || ''}
                </p>
              </button>
            )}
            {contract.supplyPosting && (
              <button
                className="w-full text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => navigate(`/matching/supply/${contract.supplyPostingId}`)}
              >
                <p className="text-xs text-gray-500">人材投稿</p>
                <p className="text-sm font-medium text-gray-900">
                  {contract.supplyPosting.title ||
                    contract.supplyPosting.workType?.workTypeName ||
                    '---'}
                </p>
                <p className="text-xs text-gray-500">
                  {contract.supplyPosting.availablePrefecture}
                </p>
              </button>
            )}
            {!contract.demandPosting && !contract.supplyPosting && (
              <p className="text-sm text-gray-400">関連投稿なし</p>
            )}
          </Card>

          {/* Reviews */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">レビュー</h3>
              {(contract.status === 'completed' || contract.status === 'active') && (
                <button
                  className="text-xs text-green-600 font-medium hover:underline"
                  onClick={() => navigate(`/matching/contracts/${contract.id}/review`)}
                >
                  レビューを書く
                </button>
              )}
            </div>
            {contract.reviews && contract.reviews.length > 0 ? (
              <div className="space-y-3">
                {contract.reviews.map((review) => (
                  <div key={review.id} className="p-2 bg-gray-50 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {review.reviewer
                          ? `${review.reviewer.lastName} ${review.reviewer.firstName}`
                          : '---'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {review.reviewType === 'client_to_worker' ? '発注者→作業者' : '作業者→発注者'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400">{formatDateTime(review.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">レビューはまだありません</p>
            )}
          </Card>

          {/* Action buttons for active contracts */}
          {contract.status === 'active' && (
            <div className="space-y-3">
              <Button onClick={handleComplete} disabled={completing}>
                {completing ? '処理中...' : '完了'}
              </Button>
              <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? '処理中...' : 'キャンセル'}
              </Button>
            </div>
          )}

          {/* Link to review page */}
          {(contract.status === 'completed' || contract.status === 'active') && (
            <button
              className="w-full flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
              onClick={() => navigate(`/matching/contracts/${contract.id}/review`)}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">レビューを投稿する</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </PageContainer>
    </>
  );
}
