import { useMemo } from 'react';
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import type { Attendance } from '../types/attendance.types';
import {
  formatCalendarDate,
  formatDuration,
  formatTime,
  getCalendarRange,
  getEffectiveAttendanceStatus,
  getLocalDateKey,
  getLocalDateInputValue,
  getMinutesForAttendance,
  getStartOfWeek,
} from '../utils/attendanceTime';

interface AttendanceCalendarProps {
  logs: Attendance[];
  view: 'month' | 'week';
  anchorDate: Date;
  selectedDate: string;
  now: Date;
  isLoading?: boolean;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function statusMeta(status: string) {
  switch (status) {
    case 'COMPLETED':
      return { label: 'Hoàn thành', color: 'var(--color-success)', dot: 'bg-[var(--color-success)]' };
    case 'CHECKED_IN':
      return { label: 'Đang làm', color: 'var(--color-info)', dot: 'bg-[var(--color-info)]' };
    case 'MISSING_CHECKOUT':
      return { label: 'Thiếu checkout · chờ xử lý', color: 'var(--color-warning)', dot: 'bg-[var(--color-warning)]' };
    case 'ABSENT':
      return { label: 'Vắng ca', color: 'var(--color-danger)', dot: 'bg-[var(--color-danger)]' };
    case 'PENDING_REVIEW':
      return { label: 'Chờ kiểm tra', color: 'var(--color-warning)', dot: 'bg-[var(--color-warning)]' };
    case 'FAILED':
      return { label: 'Thất bại', color: 'var(--color-danger)', dot: 'bg-[var(--color-danger)]' };
    default:
      return { label: status || 'Chưa xác định', color: 'var(--color-text-muted)', dot: 'bg-[var(--color-text-muted)]' };
  }
}

function formatCompactDuration(minutes: number): string {
  if (minutes <= 0) return '0p';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${remainingMinutes}p`;
  return `${hours}h${remainingMinutes > 0 ? `${remainingMinutes}p` : ''}`;
}

function createCalendarDates(view: 'month' | 'week', anchorDate: Date): Date[] {
  const range = getCalendarRange(view, anchorDate);
  const firstDate = view === 'month' ? getStartOfWeek(range.start) : range.start;
  const lastDate = view === 'month' ? getStartOfWeek(range.end) : range.end;
  if (view === 'month') lastDate.setDate(lastDate.getDate() + 6);

  const dates: Date[] = [];
  const cursor = new Date(firstDate);
  while (cursor <= lastDate) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function CalendarDay({
  date,
  logs,
  isCurrentPeriod,
  isSelected,
  isToday,
  now,
  onSelect,
}: {
  date: Date;
  logs: Attendance[];
  isCurrentPeriod: boolean;
  isSelected: boolean;
  isToday: boolean;
  now: Date;
  onSelect: () => void;
}) {
  const minutes = logs.reduce((total, log) => total + (getMinutesForAttendance(log, now) ?? 0), 0);
  const durationLogs = logs.filter((log) => getMinutesForAttendance(log, now) != null).length;
  const reviewCount = logs.filter((log) => ['FAILED', 'MISSING_CHECKOUT', 'ABSENT', 'PENDING_REVIEW'].includes(getEffectiveAttendanceStatus(log, now)) || log.overtimeStatus === 'PENDING').length;
  const activeCount = logs.filter((log) => getEffectiveAttendanceStatus(log, now) === 'CHECKED_IN' && !log.checkOutAt).length;
  const dateKey = getLocalDateInputValue(date);
  const compactStatus = reviewCount > 0
    ? `${reviewCount} cần xem`
    : activeCount > 0
      ? `${activeCount} đang mở`
      : 'Hoàn thành';
  const statusDotClass = reviewCount > 0
    ? 'bg-[var(--color-danger)]'
    : activeCount > 0
      ? 'bg-[var(--color-info)]'
      : 'bg-[var(--color-success)]';

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`Xem chấm công ngày ${dateKey}`}
      title={logs.length > 0 ? `${dateKey}: ${logs.length} lượt, ${durationLogs > 0 ? formatDuration(minutes) : 'chưa có thời lượng hợp lệ'}` : dateKey}
      className={`group flex min-h-[74px] w-full flex-col border-b border-r border-[var(--color-border)] p-1.5 text-left transition-colors hover:bg-[var(--color-primary-light)]/40 sm:min-h-[94px] sm:p-2 ${
        isCurrentPeriod ? 'bg-[var(--color-surface)]' : 'bg-[var(--color-surface-alt)]/50 opacity-50'
      } ${isSelected ? 'relative z-10 bg-[var(--color-primary-light)]/60 ring-2 ring-inset ring-[var(--color-primary)]' : ''}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold sm:size-7 sm:text-sm ${
          isToday ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-primary)]'
        }`}>
          {date.getDate()}
        </span>
        {isToday && <span className="hidden text-[10px] font-semibold text-[var(--color-primary)] sm:inline">Hôm nay</span>}
      </div>

      {logs.length > 0 ? (
        <div className="mt-auto space-y-0.5 pt-1.5 text-[10px] sm:pt-2 sm:text-[11px]">
          <div className="flex min-w-0 items-center gap-1">
            <span className={`size-1.5 shrink-0 rounded-full ${statusDotClass}`} />
            <p className="truncate font-semibold text-[var(--color-text-primary)]">
              {logs.length}<span className="hidden sm:inline"> lượt</span>
            </p>
            {durationLogs > 0 && (
              <>
                <span className="text-[var(--color-text-disabled)]">·</span>
                <p className="shrink-0 text-[var(--color-text-muted)]">{formatCompactDuration(minutes)}</p>
              </>
            )}
          </div>
          <p className={`hidden items-center gap-1 truncate font-semibold sm:flex ${
            reviewCount > 0
              ? 'text-[var(--color-danger)]'
              : activeCount > 0
                ? 'text-[var(--color-info)]'
                : 'text-[var(--color-success)]'
          }`}>
            {reviewCount > 0 ? <ExclamationTriangleIcon className="size-3 shrink-0" /> : <span className={`size-1.5 shrink-0 rounded-full ${statusDotClass}`} />}
            {compactStatus}
          </p>
        </div>
      ) : <span className="mt-auto h-3" aria-hidden="true" />}
    </button>
  );
}

export function AttendanceCalendar({
  logs,
  view,
  anchorDate,
  selectedDate,
  now,
  isLoading = false,
  onSelectDate,
}: AttendanceCalendarProps) {
  const dates = useMemo(() => createCalendarDates(view, anchorDate), [view, anchorDate]);
  const range = getCalendarRange(view, anchorDate);
  const groupedLogs = useMemo(() => {
    const grouped = new Map<string, Attendance[]>();
    logs.forEach((log) => {
      const key = getLocalDateKey(log.checkInAt);
      const dayLogs = grouped.get(key) ?? [];
      dayLogs.push(log);
      grouped.set(key, dayLogs);
    });
    return grouped;
  }, [logs]);

  const selectedLogs = groupedLogs.get(selectedDate) ?? [];
  const todayKey = getLocalDateKey(now);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]" aria-busy={isLoading}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-secondary)] sm:text-sm">
          <CalendarDaysIcon className="size-4 text-[var(--color-primary)] sm:size-5" />
          <span>{view === 'month' ? 'Lịch theo tháng' : 'Lịch theo tuần'}</span>
        </div>
        {isLoading && <span className="text-xs text-[var(--color-text-muted)]">Đang cập nhật dữ liệu…</span>}
      </div>

      <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/60">
        {WEEKDAYS.map((day) => (
          <div key={day} className="border-r border-[var(--color-border)] px-1 py-1.5 text-center text-[10px] font-bold text-[var(--color-text-muted)] last:border-r-0 sm:px-2 sm:py-2 sm:text-xs">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dates.map((date) => {
          const dateKey = getLocalDateInputValue(date);
          const isCurrentPeriod = date >= range.start && date <= range.end;
          return (
            <CalendarDay
              key={dateKey}
              date={date}
              logs={groupedLogs.get(dateKey) ?? []}
              isCurrentPeriod={isCurrentPeriod}
              isSelected={dateKey === selectedDate}
              isToday={dateKey === todayKey}
              now={now}
              onSelect={() => onSelectDate(dateKey)}
            />
          );
        })}
      </div>

      <div className="border-t border-[var(--color-border)]">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-4">
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] sm:text-base">Chi tiết ngày {formatCalendarDate(selectedDate)}</h3>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)] sm:text-xs">Chọn ngày để xem các lượt ghi nhận.</p>
          </div>
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">{selectedLogs.length} lượt</p>
        </div>

        {selectedLogs.length > 0 ? (
          <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
            {selectedLogs.map((log) => {
              const displayStatus = getEffectiveAttendanceStatus(log, now);
              const meta = statusMeta(displayStatus);
              const minutes = getMinutesForAttendance(log, now);
              const duration = displayStatus === 'FAILED' ? 'Không tính' : formatDuration(minutes);
              return (
                <div key={log.id} className="grid grid-cols-1 items-center gap-2 px-3 py-3 sm:grid-cols-[minmax(96px,0.3fr)_minmax(0,1fr)_minmax(130px,0.45fr)] sm:gap-4 sm:px-4">
                  <div className="text-xs font-semibold text-[var(--color-text-primary)] sm:text-sm">
                    <p>{formatTime(log.checkInAt)} – {displayStatus === 'FAILED' ? '—' : formatTime(log.checkOutAt)}</p>
                    <p className="mt-1 text-xs font-normal text-[var(--color-text-muted)]">
                      {displayStatus === 'FAILED'
                        ? 'Lần thử không hợp lệ'
                        : log.shiftName
                          ? `${log.shiftName}${log.shiftCode ? ` · ${log.shiftCode}` : ''}`
                          : 'Thời gian làm việc'}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-text-primary)]">{log.fullName || log.username || 'Không xác định'}</p>
                    <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">{log.projectName || 'Không gắn dự án'}</p>
                    {(log.lateMinutes ?? 0) > 0 && displayStatus !== 'ABSENT' && <p className="mt-1 text-xs font-semibold text-[var(--color-warning)]">Đi muộn {log.lateMinutes} phút · vẫn tính công</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">{duration}</p>
                    {(log.overtimeMinutes ?? 0) > 0 && <p className={`mt-1 text-xs font-semibold ${log.overtimeStatus === 'APPROVED' ? 'text-[var(--color-success)]' : log.overtimeStatus === 'REJECTED' ? 'text-[var(--color-danger)]' : 'text-[var(--color-warning)]'}`}>OT {log.overtimeStatus === 'APPROVED' ? `${log.overtimeApprovedMinutes ?? 0} phút đã duyệt` : `${log.overtimeMinutes} phút · ${log.overtimeStatus === 'PENDING' ? 'chờ duyệt' : 'từ chối'}`}</p>}
                    <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: meta.color }}>
                      <span className={`size-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-t border-[var(--color-border)] px-4 py-8 text-center">
            <CalendarDaysIcon className="mx-auto size-8 text-[var(--color-text-disabled)]" />
            <p className="mt-2 text-sm font-semibold text-[var(--color-text-secondary)]">Chưa có lượt chấm công</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Dữ liệu của ngày được chọn sẽ hiển thị tại đây.</p>
          </div>
        )}
      </div>
    </div>
  );
}
