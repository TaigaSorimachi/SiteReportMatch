import { useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/layout/AppHeader';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';

export function ReportHubPage() {
  const navigate = useNavigate();

  return (
    <>
      <AppHeader title="日報" />
      <PageContainer>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card
              className="flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] hover:border-green-400 hover:shadow-md transition-all active:scale-[0.98]"
              onClick={() => navigate('/report/batch')}
            >
              <svg
                className="w-10 h-10 text-green-600 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75"
                />
              </svg>
              <span className="text-base font-bold text-gray-800">まとめ入力</span>
              <span className="text-xs text-gray-500 mt-1">一括で日報を作成</span>
            </Card>

            <Card
              className="flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] hover:border-green-400 hover:shadow-md transition-all active:scale-[0.98]"
              onClick={() => navigate('/report/realtime/project')}
            >
              <svg
                className="w-10 h-10 text-blue-600 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-base font-bold text-gray-800">リアルタイム</span>
              <span className="text-xs text-gray-500 mt-1">打刻で日報を記録</span>
            </Card>
          </div>

          <button
            onClick={() => navigate('/report/history')}
            className="w-full flex items-center justify-between bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">日報履歴</span>
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
