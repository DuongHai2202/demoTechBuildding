import { useEffect, useMemo, useState } from 'react';
import { useProjectHistory, exportAttendanceExcel, useReviewOvertime } from '../api/attendanceApi';
import {
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/Button';
import { Pagination } from '../../../components/ui/Pagination';
import { formatDuration, getEffectiveAttendanceStatus, getLocalDateInputValue, getMinutesForAttendance } from '../utils/attendanceTime';
import type { Attendance } from '../types/attendance.types';
import { getApiErrorMessage } from '../../../services/apiError';

const PAGE_SIZE = 10;
type StatusFilter = 'ALL' | 'REVIEW' | 'CHECKED_IN' | 'COMPLETED' | 'ABSENT' | 'FAILED';
const REVIEW_STATUSES = ['FAILED', 'MISSING_CHECKOUT', 'ABSENT', 'PENDING_REVIEW'];

function needsReview(log: Attendance): boolean {
  return REVIEW_STATUSES.includes(getEffectiveAttendanceStatus(log)) || log.overtimeStatus === 'PENDING';
}

function overtimeStatusLabel(status: Attendance['overtimeStatus']): string {
  switch (status) {
    case 'PENDING': return 'Chờ duyệt';
    case 'APPROVED': return 'Đã duyệt';
    case 'REJECTED': return 'Từ chối';
    default: return 'Không có';
  }
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function formatCoordinate(value: number | null | undefined): string {
  return value != null && Number.isFinite(value) ? value.toFixed(6) : '—';
}

function getStatusMeta(status: string) {
  switch (status) {
    case 'CHECKED_IN':
      return { label: 'Đang làm', color: 'var(--color-info)', dot: 'bg-[var(--color-info)]' };
    case 'COMPLETED':
      return { label: 'Hoàn thành', color: 'var(--color-success)', dot: 'bg-[var(--color-success)]' };
    case 'FAILED':
      return { label: 'Thất bại', color: 'var(--color-danger)', dot: 'bg-[var(--color-danger)]' };
    case 'MISSING_CHECKOUT':
      return { label: 'Thiếu checkout · chờ xử lý', color: 'var(--color-warning)', dot: 'bg-[var(--color-warning)]' };
    case 'ABSENT':
      return { label: 'Vắng ca', color: 'var(--color-danger)', dot: 'bg-[var(--color-danger)]' };
    case 'PENDING_REVIEW':
      return { label: 'Chờ kiểm tra', color: 'var(--color-warning)', dot: 'bg-[var(--color-warning)]' };
    default:
      return { label: status || 'Chưa xác định', color: 'var(--color-text-muted)', dot: 'bg-[var(--color-text-muted)]' };
  }
}

function StatusText({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: meta.color }}>
      <span className={`size-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0">
      <dt className="text-[11px] font-medium text-[var(--color-text-muted)]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{value}</dd>
    </div>
  );
}

interface AttendanceAdminListProps {
  projectId: number;
}

export function AttendanceAdminList({ projectId }: AttendanceAdminListProps) {
  const [currentDate, setCurrentDate] = useState(() => getLocalDateInputValue());
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<Attendance | null>(null);
  const [approvedOvertimeMinutes, setApprovedOvertimeMinutes] = useState(0);
  const [overtimeReviewNote, setOvertimeReviewNote] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const liveDate = getLocalDateInputValue();
      if (liveDate !== currentDate) {
        if (startDate === currentDate) setStartDate(liveDate);
        if (endDate === currentDate) setEndDate(liveDate);
        setCurrentDate(liveDate);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentDate, startDate, endDate]);

  const { data: logs, isLoading } = useProjectHistory(projectId, startDate, endDate);
  const reviewOvertime = useReviewOvertime();
  const allLogs = logs || [];
  const isInvalidRange = startDate > endDate;

  const searchedLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return allLogs;
    return allLogs.filter((log) => {
      const fullName = log.fullName || '';
      const username = log.username || '';
      return fullName.toLowerCase().includes(query) || username.toLowerCase().includes(query);
    });
  }, [allLogs, searchTerm]);

  const statusCounts = useMemo(() => ({
    ALL: searchedLogs.length,
    REVIEW: searchedLogs.filter(needsReview).length,
    CHECKED_IN: searchedLogs.filter((log) => getEffectiveAttendanceStatus(log) === 'CHECKED_IN').length,
    COMPLETED: searchedLogs.filter((log) => getEffectiveAttendanceStatus(log) === 'COMPLETED').length,
    ABSENT: searchedLogs.filter((log) => getEffectiveAttendanceStatus(log) === 'ABSENT').length,
    FAILED: searchedLogs.filter((log) => getEffectiveAttendanceStatus(log) === 'FAILED').length,
  }), [searchedLogs]);

  const filteredLogs = useMemo(() => {
    if (statusFilter === 'ALL') return searchedLogs;
    if (statusFilter === 'REVIEW') return searchedLogs.filter(needsReview);
    return searchedLogs.filter((log) => getEffectiveAttendanceStatus(log) === statusFilter);
  }, [searchedLogs, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, startDate, endDate, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const canExport = !isInvalidRange && allLogs.length > 0;

  const handleExport = () => {
    if (canExport) exportAttendanceExcel(projectId, startDate, endDate);
  };

  const handleReset = () => {
    setStartDate(currentDate);
    setEndDate(currentDate);
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  useEffect(() => {
    setApprovedOvertimeMinutes(selectedLog?.overtimeMinutes ?? 0);
    setOvertimeReviewNote('');
    setReviewError('');
  }, [selectedLog?.id, selectedLog?.overtimeMinutes]);

  const handleOvertimeReview = (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedLog || selectedLog.overtimeStatus !== 'PENDING') return;

    const calculatedMinutes = selectedLog.overtimeMinutes ?? 0;
    if (status === 'APPROVED' && (!Number.isInteger(approvedOvertimeMinutes) || approvedOvertimeMinutes <= 0 || approvedOvertimeMinutes > calculatedMinutes)) {
      setReviewError(`Số phút được duyệt phải từ 1 đến ${calculatedMinutes} phút. Nếu không chấp nhận, hãy chọn Từ chối và ghi rõ lý do.`);
      return;
    }
    if (status === 'REJECTED' && !overtimeReviewNote.trim()) {
      setReviewError('Cần nhập lý do khi từ chối tăng ca.');
      return;
    }

    setReviewError('');
    reviewOvertime.mutate(
      {
        attendanceId: selectedLog.id,
        request: {
          status,
          approvedMinutes: status === 'REJECTED' ? 0 : approvedOvertimeMinutes,
          note: overtimeReviewNote.trim() || undefined,
        },
      },
      {
        onSuccess: () => setSelectedLog(null),
        onError: (error) => {
          setReviewError(getApiErrorMessage(error, 'Không thể cập nhật duyệt tăng ca. Vui lòng thử lại.'));
        },
      },
    );
  };

  const selectDateRange = (range: 'today' | 'month') => {
    if (range === 'today') {
      setStartDate(currentDate);
      setEndDate(currentDate);
      return;
    }
    setStartDate(`${currentDate.slice(0, 7)}-01`);
    setEndDate(currentDate);
  };

  const filterItems: Array<{ key: StatusFilter; label: string }> = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'REVIEW', label: 'Cần kiểm tra' },
    { key: 'CHECKED_IN', label: 'Đang làm' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
    { key: 'ABSENT', label: 'Vắng' },
    { key: 'FAILED', label: 'Thất bại' },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
        <div className="size-9 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]" />
        <p className="text-sm font-medium text-[var(--color-text-muted)]">Đang tải dữ liệu chấm công...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="border-y border-[var(--color-border)] py-3">
        <div className="grid gap-3 lg:grid-cols-[auto_auto_minmax(220px,1fr)_auto] lg:items-end">
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
            <span>Từ ngày</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
            <span>Đến ngày</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)]" />
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
            <span>Tìm nhân viên</span>
            <span className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input type="search" placeholder="Tên hoặc username..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-primary)]" />
            </span>
          </label>
          <div className="flex items-end gap-2">
            <button type="button" onClick={handleReset} className="h-10 rounded-lg px-3 text-sm font-semibold text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-primary)]">Đặt lại</button>
            <Button variant="secondary" onClick={handleExport} disabled={!canExport} className="h-10 whitespace-nowrap">Xuất Excel</Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 border-t border-[var(--color-border)] pt-3 text-xs">
          <span className="font-medium text-[var(--color-text-muted)]">Khoảng nhanh</span>
          <button type="button" onClick={() => selectDateRange('today')} className="font-semibold text-[var(--color-primary)] hover:underline">Hôm nay</button>
          <button type="button" onClick={() => selectDateRange('month')} className="font-semibold text-[var(--color-primary)] hover:underline">Tháng này</button>
        </div>
        {isInvalidRange && <p className="mt-2 text-xs font-semibold text-[var(--color-danger)]">Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.</p>}
      </section>

      <nav className="flex gap-6 overflow-x-auto border-b border-[var(--color-border)]" aria-label="Lọc trạng thái chấm công">
        {filterItems.map((item) => (
          <button key={item.key} type="button" onClick={() => setStatusFilter(item.key)} className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-2.5 text-sm font-semibold transition-colors ${statusFilter === item.key ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'}`}>
            {item.label}
            <span className="text-xs font-medium text-[var(--color-text-disabled)]">{statusCounts[item.key]}</span>
          </button>
        ))}
      </nav>

        <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] border-y border-[var(--color-border)] sm:grid-cols-4">
        <div className="px-3 py-3 sm:px-4"><p className="text-xs text-[var(--color-text-muted)]">Tổng lượt</p><p className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">{filteredLogs.length}</p></div>
         <div className="px-3 py-3 sm:px-4"><p className="text-xs text-[var(--color-text-muted)]">Hợp lệ</p><p className="mt-1 text-xl font-bold text-[var(--color-success)]">{filteredLogs.filter((log) => !['FAILED', 'ABSENT'].includes(getEffectiveAttendanceStatus(log))).length}</p></div>
        <div className="border-t border-[var(--color-border)] px-3 py-3 sm:border-t-0 sm:px-4"><p className="text-xs text-[var(--color-text-muted)]">Cần kiểm tra</p><p className="mt-1 text-xl font-bold text-[var(--color-warning)]">{filteredLogs.filter(needsReview).length}</p></div>
         <div className="border-t border-[var(--color-border)] px-3 py-3 sm:border-t-0 sm:px-4"><p className="text-xs text-[var(--color-text-muted)]">Đang làm</p><p className="mt-1 text-xl font-bold text-[var(--color-info)]">{filteredLogs.filter((log) => getEffectiveAttendanceStatus(log) === 'CHECKED_IN').length}</p></div>
      </div>

      <section className="overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-3 sm:px-4">
          <div><h3 className="text-base font-bold text-[var(--color-text-primary)]">Nhật ký chấm công</h3><p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Bấm “Xem” để kiểm tra đầy đủ thời gian, GPS và minh chứng.</p></div>
          <span className="text-xs text-[var(--color-text-muted)]">{filteredLogs.length} lượt phù hợp</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/50"><tr className="text-[11px] font-semibold text-[var(--color-text-muted)]"><th className="px-4 py-3">Nhân viên</th><th className="px-4 py-3">Thời gian</th><th className="px-4 py-3">Thời lượng</th><th className="px-4 py-3">Tăng ca</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Vị trí</th><th className="px-4 py-3">Ghi chú</th><th className="px-4 py-3">Minh chứng</th><th className="px-4 py-3 text-right">Chi tiết</th></tr></thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-16 text-center"><CalendarIcon className="mx-auto size-9 text-[var(--color-text-disabled)]" /><p className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]">Không có dữ liệu phù hợp</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">Thử đổi khoảng thời gian hoặc bộ lọc trạng thái.</p></td></tr>
              ) : paginatedLogs.map((log) => {
                const minutes = getMinutesForAttendance(log, new Date());
                const displayStatus = getEffectiveAttendanceStatus(log, new Date());
                const isLive = displayStatus === 'CHECKED_IN' && !log.checkOutAt;
                return (
                  <tr key={log.id} className="transition-colors hover:bg-[var(--color-surface-alt)]/40">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">{(log.fullName || log.username || '?').charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-semibold text-[var(--color-text-primary)]">{log.fullName || log.username || 'Chưa xác định'}</p><p className="truncate text-xs text-[var(--color-text-muted)]">@{log.username || '—'}</p></div></div></td>
                    <td className="px-4 py-3"><p className="font-semibold text-[var(--color-text-primary)]">{formatTime(log.checkInAt)} <span className="mx-1 text-[var(--color-text-disabled)]">→</span> {log.status === 'FAILED' ? '—' : formatTime(log.checkOutAt)}</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatDateTime(log.checkInAt).split(',')[0]}</p>{(log.lateMinutes ?? 0) > 0 && displayStatus !== 'ABSENT' && <p className="mt-1 text-xs font-semibold text-[var(--color-warning)]">Muộn {log.lateMinutes} phút · tính công</p>}</td>
                    <td className="px-4 py-3"><p className={`font-semibold ${isLive ? 'text-[var(--color-info)]' : 'text-[var(--color-text-primary)]'}`}>{isLive ? 'Đang làm · ' : ''}{log.status === 'FAILED' ? 'Không tính' : formatDuration(minutes)}</p>{minutes != null && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{minutes} phút</p>}</td>
                    <td className="px-4 py-3"><p className="font-semibold text-[var(--color-text-primary)]">{(log.overtimeMinutes ?? 0) > 0 ? `${log.overtimeMinutes} phút` : '—'}</p>{(log.overtimeMinutes ?? 0) > 0 && <p className={`mt-1 text-xs font-medium ${log.overtimeStatus === 'PENDING' ? 'text-[var(--color-warning)]' : log.overtimeStatus === 'APPROVED' ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`}>{overtimeStatusLabel(log.overtimeStatus)}{log.overtimeStatus === 'APPROVED' ? ` · ${log.overtimeApprovedMinutes ?? 0} phút` : ''}</p>}</td>
                    <td className="px-4 py-3"><StatusText status={displayStatus} /></td>
                    <td className="px-4 py-3"><div className="space-y-1 text-xs"><p className="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]"><MapPinIcon className="size-3.5 text-[var(--color-primary)]" />{log.distanceInMeters != null ? `${log.distanceInMeters.toFixed(1)}m từ tâm` : 'Chưa có khoảng cách'}</p>{log.gpsAccuracyIn != null && <p className="text-[var(--color-text-muted)]">GPS ±{log.gpsAccuracyIn.toFixed(0)}m</p>}</div></td>
                    <td className="max-w-[190px] px-4 py-3">{log.remarks ? <p className="border-l-2 border-[var(--color-danger)] pl-2 text-xs leading-5 text-[var(--color-danger)]">{log.remarks}</p> : log.status === 'COMPLETED' ? <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-success)]"><CheckCircleIcon className="size-4" />Hợp lệ</p> : <span className="text-xs text-[var(--color-text-disabled)]">Chưa có</span>}</td>
                    <td className="px-4 py-3"><div className="flex items-start gap-3">{log.selfieUrlIn ? <a href={log.selfieUrlIn} target="_blank" rel="noreferrer" title="Ảnh vào" className="block"><img src={log.selfieUrlIn} alt="Ảnh check-in" className="size-9 rounded-lg border border-[var(--color-border)] object-cover" /><span className="mt-1 block text-center text-[10px] text-[var(--color-text-muted)]">Vào</span></a> : null}{log.selfieUrlOut ? <a href={log.selfieUrlOut} target="_blank" rel="noreferrer" title="Ảnh ra" className="block"><img src={log.selfieUrlOut} alt="Ảnh check-out" className="size-9 rounded-lg border border-[var(--color-border)] object-cover" /><span className="mt-1 block text-center text-[10px] text-[var(--color-text-muted)]">Ra</span></a> : null}{!log.selfieUrlIn && !log.selfieUrlOut && <PhotoIcon className="mt-1 size-5 text-[var(--color-text-disabled)]" />}</div></td>
                    <td className="px-4 py-3 text-right"><button type="button" onClick={() => setSelectedLog(log)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"><EyeIcon className="size-4" />Xem</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filteredLogs.length} onPageChange={setPage} itemLabel="lượt chấm công" ariaLabel="Phân trang nhật ký chấm công" />
      </section>

      {selectedLog && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="attendance-detail-title">
          <button type="button" className="absolute inset-0 bg-slate-950/30" aria-label="Đóng chi tiết chấm công" onClick={() => setSelectedLog(null)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-[var(--color-surface)] shadow-2xl">
             <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">Chi tiết lượt chấm công</p><h2 id="attendance-detail-title" className="mt-1 truncate text-lg font-bold text-[var(--color-text-primary)]">{selectedLog.fullName || selectedLog.username || 'Không xác định'}</h2><div className="mt-2"><StatusText status={getEffectiveAttendanceStatus(selectedLog)} /></div></div><button type="button" onClick={() => setSelectedLog(null)} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]" aria-label="Đóng"><XMarkIcon className="size-5" /></button></div>
             <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              <section><h3 className="mb-3 text-sm font-bold text-[var(--color-text-primary)]">Thời gian làm việc</h3><dl className="grid gap-3 sm:grid-cols-2"><DetailField label="Bắt đầu" value={formatDateTime(selectedLog.checkInAt)} /><DetailField label="Kết thúc" value={getEffectiveAttendanceStatus(selectedLog) === 'FAILED' ? 'Không áp dụng' : formatDateTime(selectedLog.checkOutAt)} /><DetailField label="Đi muộn" value={(selectedLog.lateMinutes ?? 0) > 0 ? `${selectedLog.lateMinutes} phút · vẫn tính công` : 'Không'} /><DetailField label="Tổng thời lượng" value={getEffectiveAttendanceStatus(selectedLog) === 'FAILED' ? 'Không tính' : formatDuration(getMinutesForAttendance(selectedLog, new Date()))} /><DetailField label="Tổng số phút" value={getMinutesForAttendance(selectedLog, new Date()) != null ? `${getMinutesForAttendance(selectedLog, new Date())} phút` : '—'} /></dl></section>
              <section className="border-t border-[var(--color-border)] pt-5"><h3 className="mb-3 text-sm font-bold text-[var(--color-text-primary)]">Tăng ca</h3><dl className="grid gap-3 sm:grid-cols-2"><DetailField label="Phút hệ thống tính" value={(selectedLog.overtimeMinutes ?? 0) > 0 ? `${selectedLog.overtimeMinutes} phút` : 'Không có'} /><DetailField label="Phút được duyệt" value={selectedLog.overtimeApprovedMinutes != null ? `${selectedLog.overtimeApprovedMinutes} phút` : 'Chưa xử lý'} /><DetailField label="Trạng thái" value={overtimeStatusLabel(selectedLog.overtimeStatus)} /><DetailField label="Người duyệt" value={selectedLog.overtimeReviewedBy || '—'} /></dl>
                {selectedLog.overtimeStatus === 'PENDING' && (
                  <div className="mt-4 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">Xử lý yêu cầu tăng ca</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">Có thể duyệt toàn bộ hoặc một phần số phút hệ thống đã tính. Chỉ số phút được duyệt mới đi vào báo cáo.</p>
                    <label className="mt-3 block text-xs font-semibold text-[var(--color-text-secondary)]">Số phút duyệt</label>
                    <input type="number" min={1} max={selectedLog.overtimeMinutes ?? 0} step={1} value={approvedOvertimeMinutes} onChange={(event) => setApprovedOvertimeMinutes(Number(event.target.value))} className="mt-1 h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]" />
                    <label className="mt-3 block text-xs font-semibold text-[var(--color-text-secondary)]">Ghi chú xử lý {overtimeReviewNote.trim() ? '' : '(bắt buộc khi từ chối)'}</label>
                    <textarea value={overtimeReviewNote} onChange={(event) => setOvertimeReviewNote(event.target.value)} maxLength={500} rows={3} className="mt-1 w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]" placeholder="Nêu rõ lý do hoặc căn cứ duyệt..." />
                    {reviewError && <p className="mt-2 text-xs font-semibold text-[var(--color-danger)]">{reviewError}</p>}
                    <div className="mt-3 flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => handleOvertimeReview('REJECTED')} disabled={reviewOvertime.isPending}>Từ chối</Button><Button onClick={() => handleOvertimeReview('APPROVED')} disabled={reviewOvertime.isPending}>{reviewOvertime.isPending ? 'Đang lưu...' : 'Duyệt tăng ca'}</Button></div>
                  </div>
                )}
                {selectedLog.overtimeReviewNote && <p className="mt-3 border-l-2 border-[var(--color-warning)] pl-3 text-sm leading-6 text-[var(--color-text-secondary)]">{selectedLog.overtimeReviewNote}</p>}
              </section>
              <section className="border-t border-[var(--color-border)] pt-5"><h3 className="mb-3 text-sm font-bold text-[var(--color-text-primary)]">Vị trí và xác thực</h3><dl className="grid gap-3 sm:grid-cols-2"><DetailField label="Tọa độ vào" value={`${formatCoordinate(selectedLog.gpsLatIn)}, ${formatCoordinate(selectedLog.gpsLongIn)}`} /><DetailField label="Tọa độ ra" value={`${formatCoordinate(selectedLog.gpsLatOut)}, ${formatCoordinate(selectedLog.gpsLongOut)}`} /><DetailField label="Khoảng cách vào" value={selectedLog.distanceInMeters != null ? `${selectedLog.distanceInMeters.toFixed(1)} m` : '—'} /><DetailField label="Khoảng cách ra" value={selectedLog.distanceOutMeters != null ? `${selectedLog.distanceOutMeters.toFixed(1)} m` : '—'} /><DetailField label="Sai số GPS vào" value={selectedLog.gpsAccuracyIn != null ? `±${selectedLog.gpsAccuracyIn.toFixed(1)} m` : '—'} /><DetailField label="Sai số GPS ra" value={selectedLog.gpsAccuracyOut != null ? `±${selectedLog.gpsAccuracyOut.toFixed(1)} m` : '—'} /></dl></section>
              <section className="border-t border-[var(--color-border)] pt-5"><h3 className="mb-3 text-sm font-bold text-[var(--color-text-primary)]">Minh chứng</h3><div className="flex gap-4">{selectedLog.selfieUrlIn ? <a href={selectedLog.selfieUrlIn} target="_blank" rel="noreferrer" className="block"><img src={selectedLog.selfieUrlIn} alt="Ảnh xác thực vào" className="size-24 rounded-xl border border-[var(--color-border)] object-cover" /><span className="mt-1 block text-center text-xs text-[var(--color-text-muted)]">Ảnh vào</span></a> : <p className="text-sm text-[var(--color-text-muted)]">Không có ảnh vào</p>}{selectedLog.selfieUrlOut ? <a href={selectedLog.selfieUrlOut} target="_blank" rel="noreferrer" className="block"><img src={selectedLog.selfieUrlOut} alt="Ảnh xác thực ra" className="size-24 rounded-xl border border-[var(--color-border)] object-cover" /><span className="mt-1 block text-center text-xs text-[var(--color-text-muted)]">Ảnh ra</span></a> : null}</div></section>
              <section className="border-t border-[var(--color-border)] pt-5"><h3 className="mb-2 text-sm font-bold text-[var(--color-text-primary)]">Ghi chú xử lý</h3>{selectedLog.remarks ? <p className="border-l-2 border-[var(--color-danger)] pl-3 text-sm leading-6 text-[var(--color-danger)]">{selectedLog.remarks}</p> : <p className="text-sm text-[var(--color-text-muted)]">Chưa có ghi chú hoặc lý do lỗi.</p>}</section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
