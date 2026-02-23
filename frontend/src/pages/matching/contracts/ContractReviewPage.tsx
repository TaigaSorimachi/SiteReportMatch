import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { matchingContractsApi } from '@/lib/api/matching-contracts';

const REVIEW_TYPE_OPTIONS = [
  { value: 'client_to_worker', label: '発注者 → 作業者' },
  { value: 'worker_to_client', label: '作業者 → 発注者' },
];

export function ContractReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reviewType, setReviewType] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!id) return;
    if (!reviewType) {
      setError('レビュー種別を選択してください');
      return;
    }
    if (rating === 0) {
      setError('評価を選択してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await matchingContractsApi.addReview(id, {
        reviewType,
        rating,
        comment: comment.trim() || undefined,
      });
      navigate(-1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'レビューの投稿に失敗しました';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AppHeader title="レビュー投稿" showBack />
      <PageContainer>
        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">レビュー種別</h2>
            <Select
              required
              options={REVIEW_TYPE_OPTIONS}
              placeholder="選択してください"
              value={reviewType}
              onChange={(e) => setReviewType(e.target.value)}
            />
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">評価</h2>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                  onClick={() => setRating(star)}
                >
                  <svg
                    className={`w-10 h-10 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500">
              {rating === 0
                ? '星をタップして評価してください'
                : `${rating} / 5`}
            </p>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">コメント</h2>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-200"
              rows={5}
              placeholder="レビューコメントを入力してください（任意）"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </Card>

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '投稿中...' : 'レビューを投稿'}
          </Button>
        </div>
      </PageContainer>
    </>
  );
}
