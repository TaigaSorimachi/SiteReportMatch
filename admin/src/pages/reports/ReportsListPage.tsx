import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { reportsApi } from '@/lib/api/reports';
import { projectsApi } from '@/lib/api/projects';
import type { DailyReport, Project } from '@/types/api';
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

const WEATHER_LABELS: Record<string, string> = {
  '晴れ': '☀️ 晴れ',
  '曇り': '☁️ 曇り',
  '雨': '🌧️ 雨',
  '雪': '❄️ 雪',
};

export default function ReportsListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    const load = async () => {
      try {
        const projRes = await projectsApi.list({
          limit: 100,
          ...(user?.role !== 'admin' && user?.companyId ? { companyId: user.companyId } : {}),
        });
        setProjects(projRes.data);
      } catch { /* ignore */ }
    };
    load();
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit, sort: 'reportDate:desc' };
        if (statusFilter) params.status = statusFilter;
        if (projectFilter) params.projectId = projectFilter;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;
        const res = await reportsApi.list(params);
        setReports(res.data);
        setTotalPages(res.meta.totalPages);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, statusFilter, projectFilter, dateFrom, dateTo]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  };

  const formatTime = (d?: string) => {
    if (!d) return '-';
    const date = new Date(d);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">日報管理</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">ステータス</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">すべて</option>
              <option value="draft">下書き</option>
              <option value="submitted">提出済</option>
              <option value="approved">承認済</option>
              <option value="rejected">差戻し</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">案件</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
            >
              <option value="">すべて</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.projectName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">開始日</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">終了日</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner />
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400">日報データがありません</div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">作業者</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">出勤</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">退勤</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">人工</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">天気</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/reports/${r.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatDate(r.reportDate)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.worker ? `${r.worker.lastName} ${r.worker.firstName}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">
                      {r.project?.projectName ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatTime(r.clockIn)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {formatTime(r.clockOut)}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700">
                      {r.manDays ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                      {r.weather ? (WEATHER_LABELS[r.weather] ?? r.weather) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                前へ
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded border text-sm disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                次へ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
