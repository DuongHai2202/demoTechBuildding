import { Link } from 'react-router-dom';
import {
  ArchiveBoxIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  PlusIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useProjects } from '../features/projects/api/projectApi';
import { useAllAttendance, usePersonalHistory } from '../features/attendance/api/attendanceApi';
import { useAllMaterialRequests } from '../features/materials/api/materialApi';
import { useAuthStore } from '../features/auth/stores/authStore';
import { hasPermission } from '../features/auth/authorization';
import { StatusBadge } from '../components/StatusBadge';

type ActivityType = 'project' | 'attendance' | 'request';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  time?: string | null;
  status?: string | null;
}

function normalizeStatus(status?: string | null) {
  return status?.toUpperCase().replace(/[-\s]/g, '_') || '';
}

function formatActivityDate(value?: string | null) {
  if (!value) return 'Vừa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa cập nhật';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatActivityTime(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof BuildingOfficeIcon;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex size-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </div>
        <span className="text-xs font-medium text-[var(--color-text-muted)]">Hôm nay</span>
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">{value}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const today = (() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  })();

  const canManageProjects = hasPermission(user, 'PROJECT_MANAGE');
  const canViewProjects = hasPermission(user, 'PROJECT_READ');
  const canManageAttendance = hasPermission(user, 'ATTENDANCE_MANAGE');
  const canUseAttendance = hasPermission(user, 'ATTENDANCE_USE');
  const canViewMaterialRequests = hasPermission(user, 'MATERIAL_REQUEST');
  const canViewWorkLogs = hasPermission(user, 'WORKLOG_READ');

  const projectsQuery = useProjects();
  // The global attendance endpoint is ADMIN-only. Other operational users see
  // only their own attendance, while roles without attendance access do not
  // make a request that would intentionally return 403.
  const allAttendanceQuery = useAllAttendance(today, today, { enabled: canManageAttendance });
  const personalAttendanceQuery = usePersonalHistory(user?.id ?? 0, today, today, {
    enabled: !canManageAttendance && canUseAttendance,
  });
  const requestsQuery = useAllMaterialRequests({ enabled: canViewMaterialRequests });

  const projects = projectsQuery.data ?? [];
  const attendance = (canManageAttendance ? allAttendanceQuery.data : personalAttendanceQuery.data) ?? [];
  const requests = requestsQuery.data ?? [];
  const attendanceQuery = canManageAttendance ? allAttendanceQuery : personalAttendanceQuery;
  const isLoading = projectsQuery.isLoading || attendanceQuery.isLoading || requestsQuery.isLoading;
  const hasError = projectsQuery.isError || attendanceQuery.isError || requestsQuery.isError;

  const stats = (() => {
    const activeProjects = projects.filter((project) => {
      const status = normalizeStatus(project.status);
      return status.includes('PROGRESS') || status === 'ACTIVE' || status === 'ONGOING';
    }).length;
    const pendingRequests = requests.filter((request) => {
      const status = normalizeStatus(request.status);
      return status === 'PENDING' || status === 'REQUESTED' || status === 'WAITING_APPROVAL';
    }).length;

    return {
      totalProjects: projects.length,
      activeProjects,
      attendanceToday: attendance.length,
      pendingRequests,
    };
  })();

  const recentActivities = (() => {
    const activities: Activity[] = [
      ...projects.slice(0, 4).map((project) => ({
        id: `p-${project.id}`,
        type: 'project' as const,
        title: `Dự án: ${project.name}`,
        time: project.createdAt,
        status: project.status,
      })),
      ...(canUseAttendance ? attendance.slice(0, 5).map((item) => ({
        id: `a-${item.id}`,
        type: 'attendance' as const,
        title: `${item.fullName} đã chấm công`,
        time: item.checkInAt,
        status: item.status,
      })) : []),
      ...(canViewMaterialRequests ? requests.slice(0, 4).map((request) => ({
        id: `r-${request.id}`,
        type: 'request' as const,
        title: `Yêu cầu vật tư: ${request.materialName || 'Vật tư'}`,
        time: request.createdAt,
        status: request.status,
      })) : []),
    ];

    return activities
      .sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())
      .slice(0, 8);
  })();

  const displayName = user?.fullName || user?.username || 'bạn';
  const firstName = displayName.trim().split(/\s+/).pop() || displayName;

  const retryAll = () => {
    void Promise.all([
      projectsQuery.refetch(),
      attendanceQuery.refetch(),
      requestsQuery.refetch(),
    ]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Đang tải trang tổng quan">
        <div className="h-24 animate-pulse rounded-2xl bg-[var(--color-surface-alt)]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl bg-[var(--color-surface-alt)]" />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-2xl bg-[var(--color-surface-alt)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-theme)] sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-primary)]">Tổng quan hôm nay</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
            Xin chào, {firstName}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Theo dõi tiến độ dự án, nhân sự và vật tư từ một nơi.
          </p>
        </div>
        {canManageProjects && (
          <Link
            to="/projects/new"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            <PlusIcon className="size-4" />
            Tạo dự án
          </Link>
        )}
      </section>

      {hasError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p>Không thể tải đủ dữ liệu tổng quan. Bạn có thể thử tải lại.</p>
          <button
            type="button"
            onClick={retryAll}
            className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg border border-amber-300 px-3 py-1.5 font-semibold hover:bg-amber-100 sm:self-auto"
          >
            <ArrowPathIcon className="size-4" />
            Thử lại
          </button>
        </div>
      )}

      <section aria-label="Chỉ số tổng quan" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {canViewProjects && <>
          <StatCard label="Dự án được truy cập" value={stats.totalProjects} hint="Theo phạm vi tài khoản của bạn" icon={BuildingOfficeIcon} tone="bg-blue-50 text-blue-600" />
          <StatCard label="Đang thi công" value={stats.activeProjects} hint="Dự án đang được triển khai" icon={ClipboardDocumentListIcon} tone="bg-emerald-50 text-emerald-600" />
        </>}
        {canUseAttendance && <StatCard label={canManageAttendance ? 'Chấm công hôm nay' : 'Chấm công của tôi hôm nay'} value={stats.attendanceToday} hint={canManageAttendance ? 'Tất cả lượt ghi nhận trong ngày' : 'Lượt ghi nhận của tài khoản'} icon={CalendarDaysIcon} tone="bg-violet-50 text-violet-600" />}
        {canViewMaterialRequests && <StatCard label="Yêu cầu chờ xử lý" value={stats.pendingRequests} hint="Yêu cầu vật tư cần xem" icon={ArchiveBoxIcon} tone="bg-amber-50 text-amber-600" />}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">Hoạt động gần đây</h2>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Các cập nhật mới nhất trong hệ thống</p>
            </div>
            {canViewWorkLogs && <Link to="/worklogs" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline">Xem nhật ký<ArrowRightIcon className="size-4" /></Link>}
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {recentActivities.map((activity) => {
              const Icon = activity.type === 'project'
                ? BuildingOfficeIcon
                : activity.type === 'attendance'
                  ? UserGroupIcon
                  : ArchiveBoxIcon;

              return (
                <div key={activity.id} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-surface-alt)] sm:px-6">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--color-text-primary)]">{activity.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={activity.status || 'PENDING'} />
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                        <ClockIcon className="size-3.5" />
                        {formatActivityDate(activity.time)}
                      </span>
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-xs font-medium text-[var(--color-text-muted)] sm:block">
                    {formatActivityTime(activity.time)}
                  </span>
                </div>
              );
            })}

            {recentActivities.length === 0 && (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <CheckCircleIcon className="size-10 text-[var(--color-text-muted)]" />
                <p className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]">Chưa có hoạt động mới</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Các cập nhật phát sinh sẽ xuất hiện tại đây.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-theme)] sm:p-6">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Thao tác nhanh</h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Đi tới các công việc thường dùng</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {canManageProjects && <Link to="/projects/new" className="group rounded-xl border border-[var(--color-border)] p-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
              <BuildingOfficeIcon className="size-5 text-[var(--color-primary)]" />
              <span className="mt-2 block text-sm font-semibold text-[var(--color-text-primary)]">Tạo dự án</span>
            </Link>}
            {canUseAttendance && <Link to="/attendance" className="group rounded-xl border border-[var(--color-border)] p-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
              <CalendarDaysIcon className="size-5 text-[var(--color-primary)]" />
              <span className="mt-2 block text-sm font-semibold text-[var(--color-text-primary)]">Chấm công</span>
            </Link>}
            {canViewWorkLogs && <Link to="/worklogs" className="group rounded-xl border border-[var(--color-border)] p-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
              <ClipboardDocumentListIcon className="size-5 text-[var(--color-primary)]" />
              <span className="mt-2 block text-sm font-semibold text-[var(--color-text-primary)]">Nhật ký</span>
            </Link>}
            {canViewMaterialRequests && <Link to="/material-management" className="group rounded-xl border border-[var(--color-border)] p-3 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]">
              <ArchiveBoxIcon className="size-5 text-[var(--color-primary)]" />
              <span className="mt-2 block text-sm font-semibold text-[var(--color-text-primary)]">Yêu cầu vật tư</span>
            </Link>}
          </div>
          {canViewProjects && <Link to="/projects" className="mt-5 flex items-center justify-between rounded-xl bg-[var(--color-surface-alt)] px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-primary-light)]">Xem dự án được phân quyền<ArrowRightIcon className="size-4 text-[var(--color-primary)]" /></Link>}
        </div>
      </section>
    </div>
  );
}
