import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ListBulletIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useProjectHistory, usePersonalHistory, exportAttendanceExcel } from '../api/attendanceApi';
import { AttendanceCalendar } from './AttendanceCalendar';
import { DataTable } from '../../../components/ui/DataTable';
import { Button } from '../../../components/ui/Button';
import { useProjects } from '../../projects/api/projectApi';
import { useAuthStore } from '../../auth/stores/authStore';
import type { Attendance } from '../types/attendance.types';
import {
  formatCalendarHeading,
  formatDateTime,
  formatDuration,
  getEffectiveAttendanceStatus,
  getCalendarRange,
  getLocalDateInputValue,
  getMinutesForAttendance,
} from '../utils/attendanceTime';

type HistoryScope = 'personal' | 'project';
type CalendarView = 'month' | 'week';

function statusMeta(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Hoàn thành', color: 'var(--color-success)', dot: 'bg-[var(--color-success)]' };
    case 'CHECKED_IN':
      return { label: 'Đang làm', color: 'var(--color-info)', dot: 'bg-[var(--color-info)]' };
    case 'MISSING_CHECKOUT':
      return { label: 'Thiếu checkout · chờ xử lý', color: 'var(--color-warning)', dot: 'bg-[var(--color-warning)]' };
    case 'ABSENT':
      return { label: 'Vắng · thiếu checkout', color: 'var(--color-danger)', dot: 'bg-[var(--color-danger)]' };
    case 'PENDING_REVIEW':
      return { label: 'Chờ kiểm tra', color: 'var(--color-warning)', dot: 'bg-[var(--color-warning)]' };
    case 'FAILED':
      return { label: 'Thất bại', color: 'var(--color-danger)', dot: 'bg-[var(--color-danger)]' };
    default:
      return { label: status || 'Chưa xác định', color: 'var(--color-text-muted)', dot: 'bg-[var(--color-text-muted)]' };
  }
}

export function AttendanceHistory() {
  const user = useAuthStore((state) => state.user);
  const [scope, setScope] = useState<HistoryScope>('personal');
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateInputValue());
  const [now, setNow] = useState(() => new Date());
  const [showAllRecords, setShowAllRecords] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const { data: projects } = useProjects();
  const isGlobalManager = user?.roles?.some((role) => ['ADMIN', 'PM'].includes(role));
  const period = useMemo(() => getCalendarRange(calendarView, anchorDate), [calendarView, anchorDate]);

  const { data: personalLogs, isLoading: isPersonalLoading } = usePersonalHistory(
    user?.id || 0,
    period.startDate,
    period.endDate,
  );
  const { data: projectLogs, isLoading: isProjectLoading } = useProjectHistory(
    scope === 'project' ? Number(selectedProjectId) || 0 : 0,
    period.startDate,
    period.endDate,
  );

  const logs = (scope === 'project' ? projectLogs : personalLogs) || [];
  const isLoading = scope === 'project' ? isProjectLoading : isPersonalLoading;
  const completedLogs = logs.filter((log) => log.status === 'COMPLETED' && log.checkOutAt);
  const activeLogs = logs.filter((log) => getEffectiveAttendanceStatus(log, now) === 'CHECKED_IN' && !log.checkOutAt);
  const reviewLogs = logs.filter((log) => ['FAILED', 'MISSING_CHECKOUT', 'ABSENT', 'PENDING_REVIEW'].includes(getEffectiveAttendanceStatus(log, now)) || log.overtimeStatus === 'PENDING');
  const totalMinutes = logs.reduce((sum, log) => sum + (getMinutesForAttendance(log, now) ?? 0), 0);
  const approvedOvertimeMinutes = logs.reduce((sum, log) => sum + (log.overtimeApprovedMinutes ?? 0), 0);

  const movePeriod = (direction: number) => {
    const nextDate = new Date(anchorDate);
    if (calendarView === 'month') {
      nextDate.setMonth(nextDate.getMonth() + direction);
    } else {
      nextDate.setDate(nextDate.getDate() + direction * 7);
    }
    const nextRange = getCalendarRange(calendarView, nextDate);
    setAnchorDate(nextDate);
    setSelectedDate(nextRange.startDate);
  };

  const goToToday = () => {
    const today = new Date();
    setAnchorDate(today);
    setSelectedDate(getLocalDateInputValue(today));
  };

  const changeCalendarView = (nextView: CalendarView) => {
    setCalendarView(nextView);
    const nextRange = getCalendarRange(nextView, anchorDate);
    if (selectedDate < nextRange.startDate || selectedDate > nextRange.endDate) {
      setSelectedDate(nextRange.startDate);
    }
  };

  const handleExport = () => {
    if (scope === 'project' && selectedProjectId) {
      exportAttendanceExcel(Number(selectedProjectId), period.startDate, period.endDate);
    }
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Nhân viên',
      render: (log: Attendance) => (
        <div className="min-w-36">
          <p className="font-semibold text-[var(--color-text-primary)]">{log.fullName || log.username || 'Không xác định'}</p>
          <p className="text-xs text-[var(--color-text-muted)]">@{log.username || '—'}</p>
        </div>
      ),
    },
    {
      key: 'projectName',
      header: 'Dự án',
      render: (log: Attendance) => <span className="font-medium text-[var(--color-text-secondary)]">{log.projectName || '—'}</span>,
    },
    {
      key: 'shiftName',
      header: 'Ca làm',
      render: (log: Attendance) => log.shiftName ? (
        <div className="min-w-28">
          <p className="font-semibold text-[var(--color-text-primary)]">{log.shiftName}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{log.shiftCode || '—'}</p>
        </div>
      ) : <span className="text-sm text-[var(--color-text-muted)]">Không gắn ca</span>,
    },
    {
      key: 'checkInAt',
      header: 'Thời gian',
      render: (log: Attendance) => (
        <div className="min-w-44 space-y-1">
          <p className="font-semibold text-[var(--color-text-primary)]">Vào: {formatDateTime(log.checkInAt)}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Ra: {log.status === 'FAILED' ? 'Không áp dụng' : formatDateTime(log.checkOutAt)}</p>
        </div>
      ),
    },
    {
      key: 'workingMinutes',
      header: 'Thời lượng',
      render: (log: Attendance) => {
        const minutes = getMinutesForAttendance(log, now);
        const displayStatus = getEffectiveAttendanceStatus(log, now);
        const isLive = displayStatus === 'CHECKED_IN' && !log.checkOutAt;
        return (
          <div className="min-w-32">
            <p className={`font-bold ${isLive ? 'text-[var(--color-info)]' : 'text-[var(--color-text-primary)]'}`}>
              {isLive ? 'Đang làm · ' : ''}{displayStatus === 'FAILED' ? 'Không tính' : formatDuration(minutes)}
            </p>
            {minutes != null && <p className="text-xs text-[var(--color-text-muted)]">{minutes} phút</p>}
          </div>
        );
      },
    },
    {
      key: 'overtimeMinutes',
      header: 'Tăng ca',
      render: (log: Attendance) => {
        const calculated = log.overtimeMinutes ?? 0;
        if (calculated <= 0) return <span className="text-sm text-[var(--color-text-muted)]">—</span>;
        const status = log.overtimeStatus === 'APPROVED'
          ? `Đã duyệt ${log.overtimeApprovedMinutes ?? 0} phút`
          : log.overtimeStatus === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt';
        return <div className="min-w-28"><p className="font-semibold text-[var(--color-text-primary)]">{calculated} phút</p><p className={`text-xs font-medium ${log.overtimeStatus === 'APPROVED' ? 'text-[var(--color-success)]' : log.overtimeStatus === 'REJECTED' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`}>{status}</p></div>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (log: Attendance) => {
        const meta = statusMeta(getEffectiveAttendanceStatus(log, now));
        return (
          <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: meta.color }}>
            <span className={`size-2 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--color-border)] pb-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Theo dõi thời gian</p>
          <h2 className="mt-1 text-2xl font-bold text-[var(--color-text-primary)]">Lịch chấm công</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Xem tổng quan theo tháng, theo tuần và mở từng ngày để kiểm tra chi tiết.</p>
        </div>
        {scope === 'project' && (
          <Button variant="secondary" onClick={handleExport} disabled={!selectedProjectId || !logs.length}>
            <ArrowDownTrayIcon className="mr-2 size-4" />
            Xuất kỳ đang xem
          </Button>
        )}
      </div>

      <nav className="flex gap-6 border-b border-[var(--color-border)]" aria-label="Phạm vi lịch chấm công">
        <button
          type="button"
          onClick={() => setScope('personal')}
          className={`flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm font-semibold transition-colors ${
            scope === 'personal'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <UserIcon className="size-4" />
          Cá nhân
        </button>
        {(isGlobalManager || (projects && projects.length > 0)) && (
          <button
            type="button"
            onClick={() => setScope('project')}
              className={`flex items-center gap-2 border-b-2 px-1 pb-2.5 text-sm font-semibold transition-colors ${
              scope === 'project'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <BuildingOfficeIcon className="size-4" />
            Theo dự án
          </button>
        )}
      </nav>

      <div className="flex flex-col gap-3 border-y border-[var(--color-border)] py-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => movePeriod(-1)} className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-primary)]" aria-label="Kỳ trước">
            <ChevronLeftIcon className="size-5" />
          </button>
          <button type="button" onClick={goToToday} className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-primary)]">
            Hôm nay
          </button>
          <button type="button" onClick={() => movePeriod(1)} className="rounded-lg border border-[var(--color-border)] p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-primary)]" aria-label="Kỳ sau">
            <ChevronRightIcon className="size-5" />
          </button>
          <div className="ml-1 flex items-center gap-2 text-base font-bold text-[var(--color-text-primary)] sm:ml-3">
            <CalendarDaysIcon className="size-5 text-[var(--color-primary)]" />
            {formatCalendarHeading(calendarView, anchorDate)}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {scope === 'project' && (
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="whitespace-nowrap">Dự án</span>
              <select
                className="min-w-56 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value ? Number(event.target.value) : '')}
              >
                <option value="">Chọn dự án</option>
                {projects?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
          )}
          <div className="flex items-center border-b border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => changeCalendarView('month')}
              className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold ${calendarView === 'month' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)]'}`}
            >
              <CalendarDaysIcon className="size-4" />
              Tháng
            </button>
            <button
              type="button"
              onClick={() => changeCalendarView('week')}
              className={`flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-semibold ${calendarView === 'week' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)]'}`}
            >
              <ClockIcon className="size-4" />
              Tuần
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)] sm:grid-cols-4">
        <div className="px-4 py-3 sm:px-5">
          <p className="text-xs text-[var(--color-text-muted)]">Tổng lượt</p>
          <p className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">{logs.length}</p>
        </div>
        <div className="px-4 py-3 sm:px-5">
          <p className="text-xs text-[var(--color-text-muted)]">Tổng thời lượng</p>
          <p className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">{formatDuration(totalMinutes)}</p>
        </div>
        <div className="border-t border-[var(--color-border)] px-4 py-3 sm:border-t-0 sm:px-5">
          <p className="text-xs text-[var(--color-text-muted)]">Hoàn thành / đang làm</p>
          <p className="mt-1 text-xl font-bold text-[var(--color-success)]">{completedLogs.length} <span className="text-sm font-medium text-[var(--color-text-muted)]">/ {activeLogs.length}</span></p>
        </div>
        <div className="border-t border-[var(--color-border)] px-4 py-3 sm:border-t-0 sm:px-5">
          <p className="text-xs text-[var(--color-text-muted)]">Cần kiểm tra</p>
          <p className="mt-1 text-xl font-bold text-[var(--color-warning)]">{reviewLogs.length}</p>
        </div>
        <div className="border-t border-[var(--color-border)] px-4 py-3 sm:col-span-4 sm:px-5">
          <p className="text-xs text-[var(--color-text-muted)]">Tăng ca đã duyệt</p>
          <p className="mt-1 text-xl font-bold text-[var(--color-primary)]">{approvedOvertimeMinutes} phút <span className="text-sm font-medium text-[var(--color-text-muted)]">({formatDuration(approvedOvertimeMinutes)})</span></p>
        </div>
      </div>

      <AttendanceCalendar
        logs={logs}
        view={calendarView}
        anchorDate={anchorDate}
        selectedDate={selectedDate}
        now={now}
        isLoading={isLoading}
        onSelectDate={setSelectedDate}
      />

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <ListBulletIcon className="size-5 text-[var(--color-primary)]" />
            <div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)]">Danh sách toàn kỳ</h3>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Dùng khi cần đối chiếu từng lượt, thời gian và trạng thái.</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowAllRecords((visible) => !visible)} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            {showAllRecords ? 'Thu gọn danh sách' : 'Mở danh sách chi tiết'}
          </button>
        </div>
        {showAllRecords && (
          <DataTable
            columns={columns}
            items={logs}
            isLoading={isLoading}
            emptyMessage={scope === 'project' && !selectedProjectId ? 'Vui lòng chọn dự án để xem dữ liệu.' : 'Không có dữ liệu chấm công trong kỳ này.'}
          />
        )}
      </section>
    </div>
  );
}
