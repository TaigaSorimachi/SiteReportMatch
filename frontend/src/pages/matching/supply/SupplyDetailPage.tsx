import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { matchingSupplyApi } from '@/lib/api/matching-supply';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { SupplyPosting } from '@/types/api';

const SKILL_LEVEL_LABELS: Record<string, string> = {
  beginner: '初級',
  intermediate: '中級',
  advanced: '上級',
  expert: 'エキスパート',
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  daily_rate: '単価',
  fixed_price: '請負',
};

export function SupplyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posting, setPosting] = useState<SupplyPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inquiry form state
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await matchingSupplyApi.detail(id);
        setPosting(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '詳細の取得に失敗しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleInquire = async () => {
    if (!id || !inquiryMessage.trim()) return;
    setSubmitting(true);
    try {
      await matchingSupplyApi.inquire(id, { message: inquiryMessage.trim() });
      setShowInquiryForm(false);
      setInquiryMessage('');
      alert('問合せを送信しました');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '問合せの送信に失敗しました';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <AppHeader title="人材詳細" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error || !posting) {
    return (
      <>
        <AppHeader title="人材詳細" showBack />
        <PageContainer>
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error || 'データが見つかりません'}</p>
          </div>
        </PageContainer>
      </>
    );
  }

  const isOwner = user?.id === posting.userId;

  return (
    <>
      <AppHeader title="人材詳細" showBack />
      <PageContainer>
        <div className="space-y-4">
          {/* Header */}
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    posting.contractType === 'daily_rate'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {CONTRACT_TYPE_LABELS[posting.contractType] || posting.contractType}
                </span>
                {posting.workType && (
                  <span className="text-gray-600">{posting.workType.workTypeName}</span>
                )}
              </div>
              <Badge status={posting.status} />
            </div>

            {posting.title && (
              <h2 className="text-lg font-bold text-gray-900">{posting.title}</h2>
            )}

            {/* Worker info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                {posting.user
                  ? `${posting.user.lastName?.charAt(0) || ''}${posting.user.firstName?.charAt(0) || ''}`
                  : '--'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {posting.user ? `${posting.user.lastName} ${posting.user.firstName}` : '---'}
                </p>
                <p className="text-xs text-gray-500">
                  投稿日: {formatDate(posting.createdAt)}
                </p>
              </div>
            </div>
          </Card>

          {/* Rate */}
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">希望日当</h3>
            <p className="text-xl font-bold text-gray-900">
              {posting.desiredDailyRate
                ? `${formatCurrency(posting.desiredDailyRate)}/日`
                : '未設定'}
            </p>
          </Card>

          {/* Availability */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">対応可能期間・エリア</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">開始日</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(posting.availableStart)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">終了日</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(posting.availableEnd)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">都道府県</p>
              <p className="text-sm font-medium text-gray-900">{posting.availablePrefecture}</p>
            </div>
            {posting.availableArea && (
              <div>
                <p className="text-xs text-gray-500">エリア詳細</p>
                <p className="text-sm font-medium text-gray-900">{posting.availableArea}</p>
              </div>
            )}
          </Card>

          {/* Skill & Experience */}
          <Card className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">スキル・経験</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">スキルレベル</p>
                <p className="text-sm font-medium text-gray-900">
                  {posting.skillLevel
                    ? SKILL_LEVEL_LABELS[posting.skillLevel] || posting.skillLevel
                    : '---'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">経験年数</p>
                <p className="text-sm font-medium text-gray-900">
                  {posting.experienceYears != null ? `${posting.experienceYears}年` : '---'}
                </p>
              </div>
            </div>
          </Card>

          {/* Description */}
          {posting.description && (
            <Card className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">詳細説明</h3>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{posting.description}</p>
            </Card>
          )}

          {/* Owner actions */}
          {isOwner && (
            <Button
              variant="secondary"
              onClick={() => navigate(`/matching/supply/${posting.id}/inquiries`)}
            >
              問合せ一覧を見る
            </Button>
          )}

          {/* Inquiry button for non-owners */}
          {!isOwner && (
            <>
              {!showInquiryForm ? (
                <Button onClick={() => setShowInquiryForm(true)}>問合せする</Button>
              ) : (
                <Card className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">問合せメッセージ</h3>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    rows={4}
                    placeholder="問合せ内容を入力してください"
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowInquiryForm(false);
                        setInquiryMessage('');
                      }}
                    >
                      キャンセル
                    </Button>
                    <Button
                      onClick={handleInquire}
                      disabled={submitting || !inquiryMessage.trim()}
                    >
                      {submitting ? '送信中...' : '送信'}
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Messages link */}
          <button
            className="w-full flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
            onClick={() => navigate(`/matching/messages/supply/${posting.id}`)}
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
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">メッセージ</span>
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
        </div>
      </PageContainer>
    </>
  );
}
