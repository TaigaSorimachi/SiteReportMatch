import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { reportsApi } from '@/lib/api/reports';
import type { DailyReport } from '@/types/api';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const STATUS_LABELS: Record<string, string> = {
  draft: '下書き',
  in_progress: '作業中',
  submitted: '提出済',
  approved: '承認済',
  rejected: '差戻し',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ReportDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    reportsApi
      .detail(id)
      .then(setReport)
      .catch((err) => console.error('Failed to load report:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const updated = await reportsApi.approve(id);
      setReport(updated);
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    const reason = window.prompt('差戻し理由を入力してください');
    if (!reason) return;
    setActionLoading(true);
    try {
      const updated = await reportsApi.reject(id, reason);
      setReport(updated);
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });

  const formatTime = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMinutes = (m?: number) => {
    if (m == null) return '-';
    const h = Math.floor(m / 60);
    const min = m % 60;
    return `${h}時間${min > 0 ? `${min}分` : ''}`;
  };

  const formatCurrency = (n?: number) => {
    if (n == null) return '-';
    return `¥${Number(n).toLocaleString()}`;
  };

  if (loading) return <LoadingSpinner />;
  if (!report) return <div className="text-center py-12 text-gray-400">日報が見つかりません</div>;

  const canReview = (user?.role === 'admin' || user?.role === 'owner') && report.status === 'submitted';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">日報詳細</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[report.status] ?? 'bg-gray-100'}`}>
            {STATUS_LABELS[report.status] ?? report.status}
          </span>
        </div>
        <Button variant="secondary" onClick={() => navigate('/reports')}>戻る</Button>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">基本情報</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
          <div>
            <dt className="text-xs text-gray-500">日付</dt>
            <dd className="text-sm font-medium mt-1">{formatDate(report.reportDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">作業者</dt>
            <dd className="text-sm font-medium mt-1">
              {report.worker ? `${report.worker.lastName} ${report.worker.firstName}` : '-'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">案件</dt>
            <dd className="text-sm font-medium mt-1">{report.project?.projectName ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">入力モード</dt>
            <dd className="text-sm font-medium mt-1">{report.inputMode === 'realtime' ? 'リアルタイム' : '一括入力'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">天候</dt>
            <dd className="text-sm font-medium mt-1">{report.weather ?? '-'}{report.temperature != null ? ` / ${report.temperature}°C` : ''}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">進捗率</dt>
            <dd className="text-sm font-medium mt-1">{report.progressPct != null ? `${report.progressPct}%` : '-'}</dd>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">勤怠</h2>
        </div>
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
          <div>
            <dt className="text-xs text-gray-500">出勤</dt>
            <dd className="text-2xl font-bold text-blue-600 mt-1">{formatTime(report.clockIn)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">退勤</dt>
            <dd className="text-2xl font-bold text-blue-600 mt-1">{formatTime(report.clockOut)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">実働時間</dt>
            <dd className="text-lg font-semibold mt-1">{formatMinutes(report.workMinutes)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">人工</dt>
            <dd className="text-lg font-semibold mt-1">{report.manDays ?? '-'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">休憩</dt>
            <dd className="text-sm font-medium mt-1">{report.breakMinutes}分</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">残業</dt>
            <dd className="text-sm font-medium mt-1">{formatMinutes(report.overtimeMinutes)}</dd>
          </div>
        </div>
      </div>

      {/* Work Content */}
      {report.workContent && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">作業内容</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{report.workContent}</p>
          </div>
        </div>
      )}

      {/* Cost Items */}
      {report.costItems && report.costItems.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">原価明細</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">種別</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">項目名</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">数量</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500">単位</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">単価</th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500">金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.costItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-2 text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.costType === 'material' ? 'bg-blue-50 text-blue-700' :
                      item.costType === 'rental' ? 'bg-purple-50 text-purple-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {item.costType === 'material' ? '材料費' : item.costType === 'rental' ? 'リース' : item.costType}
                    </span>
                  </td>
                  <td className="px-6 py-2 text-sm text-gray-700">{item.itemName}</td>
                  <td className="px-6 py-2 text-sm text-right text-gray-700">{item.quantity}</td>
                  <td className="px-6 py-2 text-sm text-gray-700">{item.unit}</td>
                  <td className="px-6 py-2 text-sm text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-2 text-sm text-right font-medium text-gray-900">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={5} className="px-6 py-2 text-sm font-medium text-right">合計</td>
                <td className="px-6 py-2 text-sm font-bold text-right text-gray-900">
                  {formatCurrency(report.costItems.reduce((s, i) => s + (Number(i.amount) || 0), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Rejection Reason */}
      {report.rejectionReason && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-4">
          <h3 className="text-sm font-medium text-red-800 mb-1">差戻し理由</h3>
          <p className="text-sm text-red-700">{report.rejectionReason}</p>
        </div>
      )}

      {/* Actions */}
      {canReview && (
        <div className="flex gap-4 pt-2">
          <Button onClick={handleApprove} disabled={actionLoading}>
            {actionLoading ? '処理中...' : '承認'}
          </Button>
          <button
            onClick={handleReject}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            差戻し
          </button>
        </div>
      )}
    </div>
  );
}
