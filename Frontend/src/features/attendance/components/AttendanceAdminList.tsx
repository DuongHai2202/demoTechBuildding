import { useState } from 'react';
import { useProjectHistory, exportAttendanceExcel } from '../api/attendanceApi';
import { 
  CalendarIcon, 
  UserCircleIcon,
  MapPinIcon, 
  ClockIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/Button';

interface AttendanceAdminListProps {
  projectId: number;
}

export function AttendanceAdminList({ projectId }: AttendanceAdminListProps) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs, isLoading } = useProjectHistory(projectId, startDate, endDate);

  const handleExport = () => {
    exportAttendanceExcel(projectId, startDate, endDate);
  };

  const filteredLogs = logs?.filter(log => 
    log.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase">Check-in</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase">Hoàn thành</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 uppercase">Thất bại</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
        <p className="text-[var(--color-text-muted)] font-medium">Đang tải dữ liệu chấm công...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[var(--color-bg)] p-4 rounded-2xl border border-[var(--color-border)]">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase px-1">Từ ngày</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase px-1">Đến ngày</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div className="space-y-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase px-1">Tìm nhân viên</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="Tên hoặc Username..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 block w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={handleExport}
          className="flex items-center gap-2"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Stats Summary - Compact List View */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[150px] p-4 rounded-2xl bg-white dark:bg-slate-800 border border-[var(--color-border)] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tổng lượt</p>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{filteredLogs.length}</p>
          </div>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
            <UserCircleIcon className="w-5 h-5 text-slate-500" />
          </div>
        </div>
        <div className="flex-1 min-w-[150px] p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Thành công</p>
            <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 leading-none mt-1">
              {filteredLogs.filter(l => l.status !== 'FAILED').length}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
        <div className="flex-1 min-w-[150px] p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Thất bại</p>
            <p className="text-xl font-black text-rose-700 dark:text-rose-400 leading-none mt-1">
              {filteredLogs.filter(l => l.status === 'FAILED').length}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
            <ExclamationCircleIcon className="w-5 h-5 text-rose-600" />
          </div>
        </div>
        <div className="flex-1 min-w-[150px] p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Đang làm việc</p>
            <p className="text-xl font-black text-blue-700 dark:text-blue-400 leading-none mt-1">
              {filteredLogs.filter(l => l.status === 'CHECKED_IN').length}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <ClockIcon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
              <tr className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                <th className="px-6 py-4">Nhân viên</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Loại / Trạng thái</th>
                <th className="px-6 py-4">Vị trí (GPS)</th>
                <th className="px-6 py-4">Ghi chú / Lý do</th>
                <th className="px-6 py-4">Minh chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[var(--color-text-muted)] italic">
                    Không tìm thấy dữ liệu chấm công cho bộ lọc này.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[var(--color-bg)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
                          {log.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-text-primary)]">{log.fullName}</p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">@{log.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[var(--color-text-primary)] font-medium">
                          <ClockIcon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                          {log.checkInAt ? new Date(log.checkInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          {log.checkOutAt && (
                            <>
                              <span className="mx-1 opacity-40">-</span>
                              {new Date(log.checkOutAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {new Date(log.checkInAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-[var(--color-text-secondary)]">
                          <MapPinIcon className="w-3 h-3 text-[var(--color-primary)]" />
                          <span className="text-[11px] font-mono">{log.gpsLatIn?.toFixed(5)}, {log.gpsLongIn?.toFixed(5)}</span>
                        </div>
                        {log.distanceInMeters != null && (
                           <p className={`text-[10px] font-bold ${log.status === 'FAILED' ? 'text-rose-500' : 'text-[var(--color-text-muted)]'}`}>
                             {log.distanceInMeters > 0 ? `Cách tâm: ${log.distanceInMeters.toFixed(1)}m` : 'Tại tâm dự án'}
                           </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      {log.remarks ? (
                        <div className="flex items-start gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                          <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="text-[11px] font-medium leading-tight">{log.remarks}</span>
                        </div>
                      ) : (
                        log.status === 'COMPLETED' ? (
                          <div className="flex items-start gap-2 text-emerald-600">
                             <CheckCircleIcon className="w-4 h-4 shrink-0" />
                             <span className="text-[11px]">Hợp lệ</span>
                          </div>
                        ) : <span className="text-[11px] text-slate-400 italic">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {log.selfieUrlIn && (
                          <a href={log.selfieUrlIn} target="_blank" rel="noreferrer" className="group relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--color-border)] shadow-sm bg-black/5">
                            <img src={log.selfieUrlIn} alt="In" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                               <PhotoIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white text-[7px] font-bold px-1 rounded-tl">IN</span>
                          </a>
                        )}
                        {log.selfieUrlOut && (
                          <a href={log.selfieUrlOut} target="_blank" rel="noreferrer" className="group relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--color-border)] shadow-sm bg-black/5">
                            <img src={log.selfieUrlOut} alt="Out" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                               <PhotoIcon className="w-4 h-4 text-white" />
                            </div>
                            <span className="absolute bottom-0 right-0 bg-orange-500 text-white text-[7px] font-bold px-1 rounded-tl">OUT</span>
                          </a>
                        )}
                        {!log.selfieUrlIn && !log.selfieUrlOut && (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <PhotoIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
