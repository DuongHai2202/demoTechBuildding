import type { Attendance } from '../types/attendance.types';

export type AttendanceCalendarView = 'month' | 'week';

/** Format a date input using the browser's local calendar, not UTC. */
export function getLocalDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getEffectiveAttendanceStatus(
  attendance: Pick<Attendance, 'status' | 'checkOutAt' | 'scheduledEndAt'>,
  now = new Date(),
): string {
  const hasMissingCheckout = !attendance.checkOutAt
    && ['CHECKED_IN', 'MISSING_CHECKOUT'].includes(attendance.status)
    && !!attendance.scheduledEndAt;
  if (hasMissingCheckout) {
    const scheduledEnd = new Date(attendance.scheduledEndAt as string).getTime();
    if (Number.isFinite(scheduledEnd) && now.getTime() > scheduledEnd) {
      return 'ABSENT';
    }
  }
  return attendance.status;
}

export function getMinutesForAttendance(
  attendance: Pick<Attendance, 'workingMinutes' | 'checkInAt' | 'checkOutAt' | 'status' | 'scheduledEndAt'>,
  now = new Date(),
): number | null {
  const effectiveStatus = getEffectiveAttendanceStatus(attendance, now);
  if (effectiveStatus === 'ABSENT') return 0;
  if (attendance.workingMinutes != null && Number.isFinite(attendance.workingMinutes)) {
    return Math.max(0, Math.floor(attendance.workingMinutes));
  }
  if (!attendance.checkInAt) return null;
  if (!attendance.checkOutAt && effectiveStatus !== 'CHECKED_IN') return null;

  const start = new Date(attendance.checkInAt).getTime();
  const end = attendance.checkOutAt ? new Date(attendance.checkOutAt).getTime() : now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
  return Math.floor((end - start) / 60000);
}

export function formatDuration(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes)) return 'Chưa checkout';
  const safeMinutes = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  if (hours === 0) return `${remainingMinutes} phút`;
  if (remainingMinutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${remainingMinutes} phút`;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

/** Return a stable local calendar key without allowing UTC conversion to shift the day. */
export function getLocalDateKey(value: string | Date): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = typeof value === 'string' ? new Date(value) : value;
  return getLocalDateInputValue(date);
}

export function parseLocalDateKey(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getStartOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = result.getDay();
  const distanceToMonday = day === 0 ? 6 : day - 1;
  result.setDate(result.getDate() - distanceToMonday);
  return result;
}

export function getCalendarRange(view: AttendanceCalendarView, anchorDate: Date) {
  if (view === 'week') {
    const start = getStartOfWeek(anchorDate);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end, startDate: getLocalDateInputValue(start), endDate: getLocalDateInputValue(end) };
  }

  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const end = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0);
  return { start, end, startDate: getLocalDateInputValue(start), endDate: getLocalDateInputValue(end) };
}

export function formatCalendarHeading(view: AttendanceCalendarView, anchorDate: Date): string {
  if (view === 'month') {
    return anchorDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  }

  const { start, end } = getCalendarRange(view, anchorDate);
  const startLabel = start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  const endLabel = end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${startLabel} – ${endLabel}`;
}

export function formatCalendarDate(value: string): string {
  return parseLocalDateKey(value).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
