import { lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ProtectedRoute } from './ProtectedRoute';

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
import PendingApprovalPage from '../pages/auth/PendingApprovalPage';
const ApprovalRequestsPage = lazy(() => import('../pages/admin/ApprovalRequestsPage'));
const MaterialManagementPage = lazy(() => import('../pages/MaterialManagementPage'));
const AttendanceManagementPage = lazy(() => import('../pages/admin/AttendanceManagementPage'));
const TechnicalStandardsPage = lazy(() => import('../pages/TechnicalStandardsPage'));
const BiddingPage = lazy(() => import('../pages/BiddingPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

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
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/new" element={<ProjectCreatePage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="projects/:id/edit" element={<ProjectEditPage />} />
          <Route path="projects/:id/contracts/:contractId" element={<ContractDetailPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="worklogs" element={<WorkLogsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="approval-requests" element={<ApprovalRequestsPage />} />
          <Route path="admin/attendance" element={<AttendanceManagementPage />} />
          <Route path="material-management" element={<MaterialManagementPage />} />
          <Route path="technical-standards" element={<TechnicalStandardsPage />} />
          <Route path="bidding" element={<BiddingPage />} />
        </Route>
        
        {/* Full-screen pages for Pending User */}
        <Route path="pending-approval" element={<PendingApprovalPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
