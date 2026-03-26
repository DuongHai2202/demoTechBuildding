import { useState, useEffect } from 'react';
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
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const liveDate = new Date().toISOString().split('T')[0];
      if (liveDate !== currentDate) {
        // If the user hasn't manually changed the dates, reset them to the new "today"
        if (startDate === currentDate) setStartDate(liveDate);
        if (endDate === currentDate) setEndDate(liveDate);
        setCurrentDate(liveDate);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [currentDate, startDate, endDate]);

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
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[var(--color-info-bg,rgba(59,130,246,0.1))] text-[var(--color-info,rgb(59,130,246))] border border-[var(--color-info,rgb(59,130,246))]/10 uppercase tracking-wider">Check-in</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[var(--color-success-bg,rgba(16,185,129,0.1))] text-[var(--color-success,rgb(16,185,129))] border border-[var(--color-success,rgb(16,185,129))]/10 uppercase tracking-wider">Hoàn thành</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-[var(--color-danger)]/10 uppercase tracking-wider">Thất bại</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] border border-[var(--color-border)] uppercase tracking-wider">{status}</span>;
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card-theme)]">
        <div className="flex flex-wrap items-end gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest px-1">Từ ngày</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-primary-500/20 transition-all hover:border-[var(--color-primary-light)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest px-1">Đến ngày</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-primary-500/20 transition-all hover:border-[var(--color-primary-light)]"
            />
          </div>
          <div className="space-y-1.5 min-w-[280px]">
            <label className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest px-1">Tìm nhân viên</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="Tên hoặc Username..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-primary-500/20 transition-all hover:border-[var(--color-primary-light)]"
              />
            </div>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 h-[42px] bg-[var(--color-surface-alt)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] border-[var(--color-border)] font-bold text-xs uppercase tracking-wider"
        >
          <ArrowDownTrayIcon className="size-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Stats Summary - Premium Theme Sync */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card-theme)] flex items-center justify-between group hover:border-[var(--color-primary)] transition-all duration-300">
          <div>
            <p className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest">Tổng lượt</p>
            <p className="text-2xl font-black text-[var(--color-text-primary)] leading-none mt-2">{filteredLogs.length}</p>
          </div>
          <div className="size-12 rounded-xl bg-[var(--color-surface-alt)] flex items-center justify-center text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)] transition-colors">
            <UserCircleIcon className="size-6" />
          </div>
        </div>

        {/* Success Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card-theme)] flex items-center justify-between group hover:border-[var(--color-success,var(--color-primary))] transition-all duration-300">
          <div>
            <p className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest">Thành công</p>
            <p className="text-2xl font-black text-[var(--color-success,rgb(16,185,129))] leading-none mt-2">
              {filteredLogs.filter(l => l.status !== 'FAILED').length}
            </p>
          </div>
          <div className="size-12 rounded-xl bg-[var(--color-success-bg,rgba(16,185,129,0.1))] flex items-center justify-center text-[var(--color-success,rgb(16,185,129))]">
            <CheckCircleIcon className="size-6" />
          </div>
        </div>

        {/* Failed Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card-theme)] flex items-center justify-between group hover:border-[var(--color-danger)] transition-all duration-300">
          <div>
            <p className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest">Thất bại</p>
            <p className="text-2xl font-black text-[var(--color-danger)] leading-none mt-2">
              {filteredLogs.filter(l => l.status === 'FAILED').length}
            </p>
          </div>
          <div className="size-12 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center text-[var(--color-danger)]">
            <ExclamationCircleIcon className="size-6" />
          </div>
        </div>

        {/* Working Card */}
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-card-theme)] flex items-center justify-between group hover:border-[var(--color-info,var(--color-primary))] transition-all duration-300">
          <div>
            <p className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest">Đang làm việc</p>
            <p className="text-2xl font-black text-[var(--color-info,rgb(59,130,246))] leading-none mt-2">
              {filteredLogs.filter(l => l.status === 'CHECKED_IN').length}
            </p>
          </div>
          <div className="size-12 rounded-xl bg-[var(--color-info-bg,rgba(59,130,246,0.1))] flex items-center justify-center text-[var(--color-info,rgb(59,130,246))]">
            <ClockIcon className="size-6" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card-theme)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--color-surface-alt)]/50 border-b border-[var(--color-border)]">
              <tr className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.1em]">
                <th className="px-6 py-5">Nhân viên</th>
                <th className="px-6 py-5">Thời gian</th>
                <th className="px-6 py-5">Loại / Trạng thái</th>
                <th className="px-6 py-5">Vị trí (GPS)</th>
                <th className="px-6 py-5">Ghi chú / Lý do</th>
                <th className="px-6 py-5">Minh chứng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-40">
                       <CalendarIcon className="size-12 text-[var(--color-text-disabled)] mb-4" />
                       <p className="text-sm font-bold text-[var(--color-text-disabled)] italic uppercase tracking-widest">
                         Không tìm thấy dữ liệu chấm công cho bộ lọc này
                       </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[var(--color-bg)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform duration-300">
                          {log.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-[var(--color-text-primary)] tracking-tight">{log.fullName}</p>
                          <p className="text-[11px] font-bold text-[var(--color-text-muted)]">@{log.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-black tracking-tighter">
                          <ClockIcon className="size-4 text-[var(--color-primary)]" />
                          <span className="bg-[var(--color-surface-alt)] px-2 py-0.5 rounded text-xs">
                            {log.checkInAt ? new Date(log.checkInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                          {log.checkOutAt && (
                            <>
                              <span className="mx-0.5 opacity-30">→</span>
                              <span className="bg-[var(--color-surface-alt)] px-2 py-0.5 rounded text-xs">
                                {new Date(log.checkOutAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-tighter">
                          <CalendarIcon className="size-3.5" />
                          {new Date(log.checkInAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                          <MapPinIcon className="size-3.5 text-[var(--color-primary)]" />
                          <span className="text-[11px] font-black font-mono tracking-tighter leading-none opacity-80">{log.gpsLatIn?.toFixed(5)}, {log.gpsLongIn?.toFixed(5)}</span>
                        </div>
                        {log.distanceInMeters != null && (
                           <p className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 inline-block rounded ${log.status === 'FAILED' ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-disabled)]'}`}>
                             {log.distanceInMeters > 0 ? `Cách tâm: ${log.distanceInMeters.toFixed(1)}m` : 'Tại tâm dự án'}
                           </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      {log.remarks ? (
                        <div className="flex items-start gap-2 text-[var(--color-danger)] bg-[var(--color-danger-bg)] p-2.5 rounded-xl border border-[var(--color-danger)]/10">
                          <ExclamationCircleIcon className="size-4 shrink-0 mt-0.5 opacity-70" />
                          <span className="text-[11px] font-bold leading-tight tracking-tight">{log.remarks}</span>
                        </div>
                      ) : (
                        log.status === 'COMPLETED' ? (
                          <div className="flex items-center gap-2 text-[var(--color-success,rgb(16,185,129))] font-bold">
                             <CheckCircleIcon className="size-4 shrink-0 opacity-70" />
                             <span className="text-[11px] uppercase tracking-tighter">Hợp lệ</span>
                          </div>
                        ) : <span className="text-[11px] text-[var(--color-text-disabled)] italic opacity-50">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {log.selfieUrlIn && (
                          <a href={log.selfieUrlIn} target="_blank" rel="noreferrer" className="group/img relative size-11 rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm bg-[var(--color-surface-alt)] ring-2 ring-transparent hover:ring-[var(--color-primary)] transition-all">
                            <img src={log.selfieUrlIn} alt="In" className="size-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity">
                               <PhotoIcon className="size-4 text-white" />
                            </div>
                            <span className="absolute bottom-0 right-0 bg-[var(--color-primary)] text-white text-[7px] font-black px-1.5 py-0.5 rounded-tl-lg shadow-sm">IN</span>
                          </a>
                        )}
                        {log.selfieUrlOut && (
                          <a href={log.selfieUrlOut} target="_blank" rel="noreferrer" className="group/img relative size-11 rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm bg-[var(--color-surface-alt)] ring-2 ring-transparent hover:ring-orange-500 transition-all">
                            <img src={log.selfieUrlOut} alt="Out" className="size-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity">
                               <PhotoIcon className="size-4 text-white" />
                            </div>
                            <span className="absolute bottom-0 right-0 bg-orange-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-tl-lg shadow-sm">OUT</span>
                          </a>
                        )}
                        {!log.selfieUrlIn && !log.selfieUrlOut && (
                          <div className="size-9 rounded-xl bg-[var(--color-surface-alt)] flex items-center justify-center text-[var(--color-text-disabled)] opacity-40">
                            <PhotoIcon className="size-4" />
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
