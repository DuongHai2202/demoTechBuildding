import { useMemo } from 'react';
import {
  ClockIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { useProjects } from '../features/projects/api/projectApi';
import { useAllAttendance } from '../features/attendance/api/attendanceApi';
import { useAllMaterialRequests } from '../features/materials/api/materialApi';
import { StatusBadge } from '../components/StatusBadge';

export default function DashboardPage() {
  const today = new Date().toISOString().split('T')[0];

  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: attendance = [], isLoading: loadingAttendance } = useAllAttendance(today, today);
  const { data: requests = [], isLoading: loadingRequests } = useAllMaterialRequests();

  const recentActivities = useMemo(() => {
    const act = [
      ...projects.slice(0, 3).map(p => ({
        id: `p-${p.id}`,
        type: 'project',
        title: `Dự án mới: ${p.name}`,
        time: p.createdAt,
        status: p.status
      })),
      ...attendance.slice(0, 5).map(a => ({
        id: `a-${a.id}`,
        type: 'attendance',
        title: `${a.fullName} đã chấm công`,
        time: a.checkInAt,
        status: a.status
      })),
      ...requests.slice(0, 3).map(r => ({
        id: `r-${r.id}`,
        type: 'request',
        title: `Yêu cầu vật tư: ${r.materialName || 'Vật tư'}`,
        time: r.createdAt || new Date().toISOString(),
        status: r.status
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return act.slice(0, 8);
  }, [projects, attendance, requests]);

  if (loadingProjects || loadingAttendance || loadingRequests) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Welcome
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Hoạt động</p>
        </div>
      </div>



      {/* Main Content Sections */}
      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity */}
        <div className="col-span-1">
          <div className="rounded-2xl bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)] min-h-[500px]">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Hoạt động gần đây</h2>
              </div>
              <button className="text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="group flex items-start gap-4 p-3 rounded-xl transition-colors hover:bg-[var(--color-bg)]">
                  <div className="relative mt-1">
                    <div className="h-10 w-10 rounded-full bg-[var(--color-surface)] shadow-sm flex items-center justify-center border border-[var(--color-border)] group-hover:border-[var(--color-primary)] transition-colors text-[var(--color-primary)]">
                      {activity.type === 'project' && <BuildingOfficeIcon className="size-5" />}
                      {activity.type === 'attendance' && <UserIcon className="size-5" />}
                      {activity.type === 'request' && <ArchiveBoxIcon className="size-5" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                        {activity.title}
                      </p>
                      <span className="shrink-0 text-xs font-medium text-[var(--color-text-muted)]">
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <StatusBadge status={activity.status || 'PENDING'} />
                      <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] font-medium">
                        <ClockIcon className="h-3 w-3" />
                        {new Date(activity.time).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {recentActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-16 w-16 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-3xl mb-4">📭</div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">
                    Chưa có hoạt động nào được ghi nhận hôm nay.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
