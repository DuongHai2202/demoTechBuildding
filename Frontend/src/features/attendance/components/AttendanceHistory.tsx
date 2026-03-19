import { useState } from 'react';
import { useProjectHistory, usePersonalHistory, exportAttendanceExcel } from '../api/attendanceApi';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useProjects } from '../../projects/api/projectApi';
import { useAuthStore } from '../../auth/stores/authStore';
import { ArrowDownTrayIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

import { StatusBadge } from '../../../components/StatusBadge';

export function AttendanceHistory() {
  const user = useAuthStore((s) => s.user);
  const [viewType, setViewType] = useState<'personal' | 'project'>('personal');
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: projects } = useProjects();
  
  // Custom check for project list - only show projects where user has access if not global PM/Admin
  const isGlobalManager = user?.roles?.some(r => ['ADMIN', 'PM'].includes(r));
  
  const { data: personalLogs, isLoading: isPersonalLoading } = usePersonalHistory(
    user?.id || 0,
    startDate,
    endDate
  );

  const { data: projectLogs, isLoading: isProjectLoading } = useProjectHistory(
    viewType === 'project' ? Number(selectedProjectId) || 0 : 0,
    startDate,
    endDate
  );

  const logs = viewType === 'project' ? projectLogs : personalLogs;
  const isLoading = viewType === 'project' ? isProjectLoading : isPersonalLoading;

  const handleExport = () => {
    if (viewType === 'project' && selectedProjectId) {
      exportAttendanceExcel(Number(selectedProjectId), startDate, endDate);
    }
  };

  const columns = [
    { key: 'fullName', header: 'Nhân viên' },
    { 
      key: 'checkInAt', 
      header: 'Giờ vào',
      render: (v: any) => v.checkInAt ? new Date(v.checkInAt).toLocaleString('vi-VN') : '-'
    },
    { 
      key: 'checkOutAt', 
      header: 'Giờ ra',
      render: (v: any) => v.checkOutAt ? new Date(v.checkOutAt).toLocaleString('vi-VN') : '-'
    },
    { 
      key: 'workingHours', 
      header: 'Số giờ',
      render: (v: any) => v.workingHours ? v.workingHours.toFixed(2) : '0'
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (v: any) => {
        const statusMap: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
          'CHECKED_IN': { label: 'Đang làm việc', variant: 'info' },
          'COMPLETED': { label: 'Hoàn thành', variant: 'success' },
          'IN_PROJECT': { label: 'Trong dự án', variant: 'success' },
        };
        const config = statusMap[v.status] || { label: v.status, variant: 'warning' };
        return <StatusBadge label={config.label} variant={config.variant} />;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-[var(--color-border)] pb-2">
        <button
          onClick={() => setViewType('personal')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
            viewType === 'personal'
              ? 'bg-[var(--color-primary)] text-white'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
          }`}
        >
          <UserIcon className="size-4" />
          Cá nhân
        </button>
        {(isGlobalManager || (projects && projects.length > 0)) && (
          <button
            onClick={() => setViewType('project')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
              viewType === 'project'
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
            }`}
          >
            <BuildingOfficeIcon className="size-4" />
            Theo dự án
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {viewType === 'project' && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">Dự án</label>
              <select
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm outline-none"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
              >
                <option value="">-- Chọn dự án --</option>
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className={viewType === 'personal' ? 'md:col-span-2' : ''}>
            <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">Từ ngày</label>
            <input 
              type="date" 
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className={viewType === 'personal' ? 'md:col-span-2' : ''}>
            <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">Đến ngày</label>
            <input 
              type="date" 
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {viewType === 'project' && (
        <div className="flex justify-end">
          <Button 
            variant="secondary" 
            onClick={handleExport} 
            disabled={!selectedProjectId || !logs?.length}
          >
            <ArrowDownTrayIcon className="size-4 mr-2" />
            Xuất file Excel
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        <DataTable
          columns={columns}
          items={logs || []}
          isLoading={isLoading}
          emptyMessage={
            viewType === 'project' && !selectedProjectId 
            ? "Vui lòng chọn dự án để xem dữ liệu." 
            : "Không có dữ liệu chấm công cho khoảng thời gian này."
          }
        />
      </div>
    </div>
  );
}
