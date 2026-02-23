import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { matchingDemandApi } from '@/lib/api/matching-demand';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { DemandPosting } from '@/types/api';

export function DemandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posting, setPosting] = useState<DemandPosting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposedRate, setProposedRate] = useState('');
  const [availableCount, setAvailableCount] = useState('1');
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await matchingDemandApi.detail(id);
        setPosting(data);
      } catch {
        setError('募集情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const isOwner = posting && user && posting.companyId === user.companyId;

  const handleApply = async () => {
    if (!id) return;
    setIsApplying(true);
    try {
      await matchingDemandApi.apply(id, {
        proposedRate: proposedRate ? Number(proposedRate) : undefined,
        availableCount: availableCount ? Number(availableCount) : 1,
        message: applyMessage || undefined,
      });
      alert('応募が完了しました');
      setShowApplyModal(false);
      // Refresh posting data
      const updated = await matchingDemandApi.detail(id);
      setPosting(updated);
    } catch {
      alert('応募に失敗しました');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <AppHeader title="募集詳細" showBack />
        <LoadingSpinner />
      </>
    );
  }

  if (error || !posting) {
    return (
      <>
        <AppHeader title="募集詳細" showBack />
        <PageContainer>
          <EmptyState message={error ?? '募集が見つかりません'} />
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <AppHeader title="募集詳細" showBack />
      <PageContainer>
        {/* ── Header ── */}
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              posting.contractType === 'daily_rate'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {posting.contractType === 'daily_rate' ? '日当単価' : '請負'}
            </span>
            <Badge status={posting.status} />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-1">{posting.siteName}</h2>

          {posting.company && (
            <p className="text-sm text-gray-500 mb-3">{posting.company.companyName}</p>
          )}

          <div className="text-2xl font-bold text-gray-900 mb-3">
            {posting.contractType === 'daily_rate'
              ? `${formatCurrency(posting.dailyRateMin ?? 0)}${posting.dailyRateMax ? `〜${formatCurrency(posting.dailyRateMax)}` : ''}/日`
              : `${formatCurrency(posting.fixedPrice ?? 0)}`}
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">場所</span>
              <p className="font-medium text-gray-900">{posting.sitePrefecture}{posting.siteCity}</p>
            </div>
            {posting.siteAddress && (
              <div>
                <span className="text-gray-500">住所</span>
                <p className="font-medium text-gray-900">{posting.siteAddress}</p>
              </div>
            )}
            <div>
              <span className="text-gray-500">期間</span>
              <p className="font-medium text-gray-900">
                {formatDate(posting.workDateStart, 'M/d')}〜{formatDate(posting.workDateEnd, 'M/d')}
              </p>
            </div>
            <div>
              <span className="text-gray-500">人数</span>
              <p className="font-medium text-gray-900">
                {posting.confirmedCount}/{posting.requiredCount}名
                {posting.requiredCount - posting.confirmedCount > 0 && (
                  <span className="text-red-500 ml-1">
                    (残{posting.requiredCount - posting.confirmedCount}名)
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* ── Work Type ── */}
        {posting.workType && (
          <Card className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">工種</h3>
            <p className="text-sm text-gray-700">{posting.workType.workTypeName}</p>
          </Card>
        )}

        {/* ── Description ── */}
        {posting.description && (
          <Card className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">募集内容</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{posting.description}</p>
          </Card>
        )}

        {/* ── Conditions ── */}
        <Card className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">条件・待遇</h3>
          <div className="flex flex-wrap gap-2">
            {posting.providesParking && (
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                駐車場あり
              </span>
            )}
            {posting.providesTools && (
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                工具貸出あり
              </span>
            )}
            {posting.providesMeals && (
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                食事提供あり
              </span>
            )}
            {posting.ccusRequired && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                CCUS登録必須
              </span>
            )}
            {!posting.providesParking && !posting.providesTools && !posting.providesMeals && !posting.ccusRequired && (
              <span className="text-sm text-gray-400">特記事項なし</span>
            )}
          </div>
        </Card>

        {/* ── Notes ── */}
        {posting.notes && (
          <Card className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">備考</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{posting.notes}</p>
          </Card>
        )}

        {/* ── Actions ── */}
        <div className="space-y-3 pt-2 pb-4">
          {isOwner ? (
            <>
              <Button
                variant="primary"
                onClick={() => navigate(`/matching/demand/${id}/applications`)}
              >
                応募一覧を見る
              </Button>
              <Link
                to={`/matching/messages/demand/${id}`}
                className="block text-center text-sm text-green-600 font-medium py-2"
              >
                メッセージを確認する
              </Link>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                onClick={() => setShowApplyModal(true)}
                disabled={posting.status !== 'open' && posting.status !== 'published'}
              >
                応募する
              </Button>
              <Link
                to={`/matching/messages/demand/${id}`}
                className="block text-center text-sm text-green-600 font-medium py-2"
              >
                メッセージを送る
              </Link>
            </>
          )}
        </div>
      </PageContainer>

      {/* ── Apply Modal ── */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 pb-8 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">応募する</h3>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500">
              {posting.siteName} への応募内容を入力してください
            </p>

            <Input
              label="希望単価（円/日）"
              type="number"
              placeholder={posting.dailyRateMin ? `参考: ${posting.dailyRateMin}` : '例）18000'}
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
            />

            <Input
              label="対応可能人数"
              type="number"
              min={1}
              value={availableCount}
              onChange={(e) => setAvailableCount(e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">メッセージ</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
                rows={3}
                placeholder="自己紹介や経験をアピールしましょう"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
              />
            </div>

            <Button onClick={handleApply} disabled={isApplying}>
              {isApplying ? '送信中...' : '応募を送信する'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
