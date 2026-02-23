import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { BottomNav } from '@/components/layout/BottomNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage';
// Report
import { ReportHubPage } from '@/pages/report/ReportHubPage';
import { ReportBatchFormPage } from '@/pages/report/ReportBatchFormPage';
import { ReportBatchConfirmPage } from '@/pages/report/ReportBatchConfirmPage';
import { ReportRealtimeProjectPage } from '@/pages/report/ReportRealtimeProjectPage';
import { ReportRealtimeTimerPage } from '@/pages/report/ReportRealtimeTimerPage';
import { ReportRealtimeSupplementPage } from '@/pages/report/ReportRealtimeSupplementPage';
import { ReportHistoryPage } from '@/pages/report/ReportHistoryPage';
import { ReportDetailPage } from '@/pages/report/ReportDetailPage';
// Attendance
import { AttendancePage } from '@/pages/attendance/AttendancePage';
// Matching
import { MatchingTopPage } from '@/pages/matching/MatchingTopPage';
import { DemandCreatePage } from '@/pages/matching/demand/DemandCreatePage';
import { DemandSearchPage } from '@/pages/matching/demand/DemandSearchPage';
import { DemandDetailPage } from '@/pages/matching/demand/DemandDetailPage';
import { DemandApplicationsPage } from '@/pages/matching/demand/DemandApplicationsPage';
import { SupplyCreatePage } from '@/pages/matching/supply/SupplyCreatePage';
import { SupplyListPage } from '@/pages/matching/supply/SupplyListPage';
import { SupplyDetailPage } from '@/pages/matching/supply/SupplyDetailPage';
import { SupplyInquiriesPage } from '@/pages/matching/supply/SupplyInquiriesPage';
import { ContractListPage } from '@/pages/matching/contracts/ContractListPage';
import { ContractDetailPage } from '@/pages/matching/contracts/ContractDetailPage';
import { ContractReviewPage } from '@/pages/matching/contracts/ContractReviewPage';
import { MessageThreadPage } from '@/pages/matching/messages/MessageThreadPage';
// Analytics
import { AnalyticsTopPage } from '@/pages/analytics/AnalyticsTopPage';
import { StaffingSummaryPage } from '@/pages/analytics/StaffingSummaryPage';
import { ProjectPLPage } from '@/pages/analytics/ProjectPLPage';
import { MatchingKpiPage } from '@/pages/analytics/MatchingKpiPage';
import { AlertsListPage } from '@/pages/analytics/AlertsListPage';
// Settings
import { SettingsTopPage } from '@/pages/settings/SettingsTopPage';
import { ProfileEditPage } from '@/pages/settings/ProfileEditPage';
import { LicenseManagePage } from '@/pages/settings/LicenseManagePage';
import { CompanySettingsPage } from '@/pages/settings/admin/CompanySettingsPage';
import { CustomFieldsPage } from '@/pages/settings/admin/CustomFieldsPage';
import { NotificationSettingsPage } from '@/pages/settings/NotificationSettingsPage';

function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <BottomNav />
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/report" replace /> },
      { path: 'report', element: <ReportHubPage /> },
      { path: 'report/batch', element: <ReportBatchFormPage /> },
      { path: 'report/batch/confirm', element: <ReportBatchConfirmPage /> },
      { path: 'report/realtime/project', element: <ReportRealtimeProjectPage /> },
      { path: 'report/realtime/timer/:reportId', element: <ReportRealtimeTimerPage /> },
      { path: 'report/realtime/supplement/:reportId', element: <ReportRealtimeSupplementPage /> },
      { path: 'report/history', element: <ReportHistoryPage /> },
      { path: 'report/history/:id', element: <ReportDetailPage /> },
      { path: 'attendance', element: <AttendancePage /> },
      { path: 'matching', element: <MatchingTopPage /> },
      { path: 'matching/demand/create', element: <DemandCreatePage /> },
      { path: 'matching/demand/search', element: <DemandSearchPage /> },
      { path: 'matching/demand/:id', element: <DemandDetailPage /> },
      { path: 'matching/demand/:id/applications', element: <DemandApplicationsPage /> },
      { path: 'matching/supply/create', element: <SupplyCreatePage /> },
      { path: 'matching/supply', element: <SupplyListPage /> },
      { path: 'matching/supply/:id', element: <SupplyDetailPage /> },
      { path: 'matching/supply/:id/inquiries', element: <SupplyInquiriesPage /> },
      { path: 'matching/contracts', element: <ContractListPage /> },
      { path: 'matching/contracts/:id', element: <ContractDetailPage /> },
      { path: 'matching/contracts/:id/review', element: <ContractReviewPage /> },
      { path: 'matching/messages/demand/:id', element: <MessageThreadPage /> },
      { path: 'matching/messages/supply/:id', element: <MessageThreadPage /> },
      { path: 'analytics', element: <AnalyticsTopPage /> },
      { path: 'analytics/staffing', element: <StaffingSummaryPage /> },
      { path: 'analytics/pl', element: <ProjectPLPage /> },
      { path: 'analytics/kpi', element: <MatchingKpiPage /> },
      { path: 'analytics/alerts', element: <AlertsListPage /> },
      { path: 'settings', element: <SettingsTopPage /> },
      { path: 'settings/profile', element: <ProfileEditPage /> },
      { path: 'settings/licenses', element: <LicenseManagePage /> },
      { path: 'settings/company', element: <CompanySettingsPage /> },
      { path: 'settings/custom-fields', element: <CustomFieldsPage /> },
      { path: 'settings/notifications', element: <NotificationSettingsPage /> },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
