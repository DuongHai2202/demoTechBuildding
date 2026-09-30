import { lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ProtectedRoute } from './ProtectedRoute';
import { PermissionRoute } from './ProtectedRoute';

// Lazy load pages (React_Skill: performance – Bundle Optimization)
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const VerifyOtpPage = lazy(() => import('../pages/auth/VerifyOtpPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProjectListPage = lazy(() => import('../pages/projects/ProjectListPage'));
const ProjectCreatePage = lazy(() => import('../pages/projects/ProjectCreatePage'));
const ProjectEditPage = lazy(() => import('../pages/projects/ProjectEditPage'));
const ProjectDetailPage = lazy(() => import('../pages/projects/ProjectDetailPage'));
const AttendancePage = lazy(() => import('../pages/AttendancePage'));
const MaterialsPage = lazy(() => import('../pages/MaterialsPage'));
const WorkLogsPage = lazy(() => import('../pages/WorkLogsPage'));
const ContractsPage = lazy(() => import('../pages/ContractsPage'));
const ContractDetailPage = lazy(() => import('../pages/contracts/ContractDetailPage'));
const PartnersPage = lazy(() => import('../pages/PartnersPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));
import PendingApprovalPage from '../pages/auth/PendingApprovalPage';
const ApprovalRequestsPage = lazy(() => import('../pages/admin/ApprovalRequestsPage'));
const MaterialManagementPage = lazy(() => import('../pages/MaterialManagementPage'));
const AttendanceManagementPage = lazy(() => import('../pages/admin/AttendanceManagementPage'));
const TechnicalStandardsPage = lazy(() => import('../pages/TechnicalStandardsPage'));
const BiddingPage = lazy(() => import('../pages/BiddingPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'));

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
      </Route>

      {/* Protected pages */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout sidebar={<Sidebar />} header={<Header />} />}>
          <Route element={<PermissionRoute permission="DASHBOARD_VIEW" />}>
            <Route index element={<DashboardPage />} />
          </Route>
          <Route element={<PermissionRoute permission="PROJECT_READ" />}>
            <Route path="projects" element={<ProjectListPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
          </Route>
          <Route element={<PermissionRoute permission="PROJECT_MANAGE" />}>
            <Route path="projects/new" element={<ProjectCreatePage />} />
            <Route path="projects/:id/edit" element={<ProjectEditPage />} />
          </Route>
          <Route element={<PermissionRoute permission="CONTRACT_READ" />}>
            <Route path="projects/:id/contracts/:contractId" element={<ContractDetailPage />} />
            <Route path="contracts" element={<ContractsPage />} />
          </Route>
          <Route element={<PermissionRoute permission="ATTENDANCE_USE" />}>
            <Route path="attendance" element={<AttendancePage />} />
          </Route>
          <Route element={<PermissionRoute permission="MATERIAL_READ" />}>
            <Route path="materials" element={<MaterialsPage />} />
          </Route>
          <Route element={<PermissionRoute permission="WORKLOG_READ" />}>
            <Route path="worklogs" element={<WorkLogsPage />} />
          </Route>
          <Route element={<PermissionRoute permission="PARTNER_READ" />}>
            <Route path="partners" element={<PartnersPage />} />
          </Route>
          <Route element={<PermissionRoute permission="USER_MANAGE" />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route element={<PermissionRoute permission="SETTINGS_VIEW" />}>
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="notifications" element={<NotificationsPage />} />
          <Route element={<PermissionRoute permission="ROLE_REQUEST_REVIEW" />}>
            <Route path="approval-requests" element={<ApprovalRequestsPage />} />
          </Route>
          <Route element={<PermissionRoute permission="ATTENDANCE_MANAGE" />}>
            <Route path="admin/attendance" element={<AttendanceManagementPage />} />
          </Route>
          <Route element={<PermissionRoute permission="MATERIAL_REQUEST" />}>
            <Route path="material-management" element={<MaterialManagementPage />} />
          </Route>
          <Route element={<PermissionRoute permission="TECHNICAL_STANDARD_READ" />}>
            <Route path="technical-standards" element={<TechnicalStandardsPage />} />
          </Route>
          <Route element={<PermissionRoute permission="BIDDING_READ" />}>
            <Route path="bidding" element={<BiddingPage />} />
          </Route>
        </Route>
        
        {/* Full-screen pages for Pending User */}
        <Route path="pending-approval" element={<PendingApprovalPage />} />
      </Route>

      {/* 404 */}
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
