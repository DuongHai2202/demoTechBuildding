import { useState } from 'react';
import { 
  useProjectWorkLogs, 
  useDeleteWorkLog,
  useCheckWorkLog,
  useApproveWorkLog,
  useRejectWorkLog
} from '../api/worklogApi';
import { useMyProjectPermission } from '../../projects/api/projectApi';
import { useAuthStore } from '../../auth/stores/authStore';
import { 
  CalendarIcon, 
  UserIcon, 
  CloudIcon, 
  UsersIcon, 
  PhotoIcon, 
  TrashIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  FaceFrownIcon
} from '@heroicons/react/24/outline';

interface WorkLogListProps {
  projectId: number;
}

export function WorkLogList({ projectId }: WorkLogListProps) {
  const { data: logs, isLoading } = useProjectWorkLogs(projectId);
  const deleteMutation = useDeleteWorkLog();
  const checkMutation = useCheckWorkLog();
  const approveMutation = useApproveWorkLog();
  const rejectMutation = useRejectWorkLog();
  
  const permissions = useMyProjectPermission(projectId);
  const user = useAuthStore(state => state.user);

  // Modal State
  const [actionModal, setActionModal] = useState<{ 
    isOpen: boolean; 
    logId: number | null; 
    actionType: 'check' | 'approve' | 'reject' | null 
  }>({
    isOpen: false,
    logId: null,
    actionType: null
  });
  const [actionNotes, setActionNotes] = useState('');

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa nhật ký này?')) {
      deleteMutation.mutate({ id, projectId });
    }
  };

  const openActionModal = (id: number, action: 'check' | 'approve' | 'reject') => {
    setActionModal({ isOpen: true, logId: id, actionType: action });
    setActionNotes('');
  };

  const confirmAction = async () => {
    if (!actionModal.logId || !actionModal.actionType) return;
    const userId = user?.id ? Number(user.id) : 0;
    
    try {
      const payload = { id: actionModal.logId, userId, notes: actionNotes };
      if (actionModal.actionType === 'check') await checkMutation.mutateAsync(payload);
      else if (actionModal.actionType === 'approve') await approveMutation.mutateAsync(payload);
      else if (actionModal.actionType === 'reject') await rejectMutation.mutateAsync(payload);
      
      setActionModal({ isOpen: false, logId: null, actionType: null });
    } catch (err) {
      // Errors are handled globally in API alerts
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status || 'PENDING';
    switch (s) {
      case 'PENDING':
      case 'DRAFT': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider">Chờ duyệt</span>;
      case 'CHECKED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 uppercase tracking-wider">Đã kiểm tra</span>;
      case 'APPROVED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 uppercase tracking-wider">Đã duyệt</span>;
      case 'REJECTED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 uppercase tracking-wider">Từ chối</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider">{s}</span>;
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-10 h-10 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
      <p className="text-[var(--color-text-muted)] font-medium animate-pulse">Đang tải nhật ký thi công...</p>
    </div>
  );

  if (!logs || logs.length === 0) {
    return (
      <div className="p-20 text-center bg-[var(--color-surface-alt)] rounded-3xl border-2 border-dashed border-[var(--color-border)]">
        <FaceFrownIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Chưa có nhật ký</h3>
        <p className="text-slate-500 max-w-xs mx-auto">Nhật ký hàng ngày giúp PM theo dõi tiến độ công việc tại công trường một cách chính xác nhất.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--color-primary)]/0 before:via-[var(--color-primary)]/20 before:to-[var(--color-primary)]/0">
      {logs.map((log) => (
        <div key={log.id} className="relative flex items-center justify-between md:justify-normal group">
          {/* Dot */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[var(--color-bg)] bg-[var(--color-surface)] group-hover:bg-[var(--color-primary)] text-[var(--color-primary)] group-hover:text-white shadow-xl shrink-0 z-10">
            <CalendarIcon className="w-5 h-5" />
          </div>

          {/* Card */}
          <div className="ml-6 flex-1 max-w-[1000px] bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] group-hover:border-[var(--color-primary)]/30 overflow-hidden transition-all duration-500 flex flex-col">
            {/* Card Header */}
            <div className="p-4 border-b border-[var(--color-border)]/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-[var(--color-primary)]/10 rounded-lg">
                  <UserIcon className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)] leading-tight">
                    {log.username || 'Kỹ thuật viên'}
                  </h4>
                  <time className="text-[11px] font-medium text-[var(--color-text-muted)]">
                    {new Date(log.logDate).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </time>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(log.status)}
                {permissions.canCreateWorkLog && (
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2.5 p-2.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                  <CloudIcon className="w-4 h-4 text-sky-500" />
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)]">Thời tiết</span>
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{log.weatherCondition}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                  <UsersIcon className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-[var(--color-text-muted)]">Nhân công</span>
                    <span className="text-xs font-bold text-[var(--color-text-primary)]">{log.workerCount} người</span>
                  </div>
                </div>
              </div>

              <div className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-4 bg-[var(--color-bg)] p-3 rounded-xl border-l-4 border-[var(--color-primary)]/50 whitespace-pre-wrap italic">
                "{log.content}"
              </div>

              {log.mediaUrls && log.mediaUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {log.mediaUrls.map((url, idx) => (
                    <a 
                      key={idx} 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="group/img relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <img 
                        src={url} 
                        alt="Site" 
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              )}
              
              {/* Approval Notes Display */}
              {log.notes && (
                <div className="mt-4 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                  <span className="block text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase mb-0.5">Ý kiến phản hồi</span>
                  <p className="text-[11px] text-amber-800 dark:text-amber-200 italic leading-tight">{log.notes}</p>
                </div>
              )}
            </div>

            {/* Card Footer - Dynamic Actions */}
            <div className="px-5 py-3 bg-[var(--color-bg)]/50 border-t border-[var(--color-border)]/50 flex justify-end gap-2">
              {(log.status === 'PENDING' || log.status === 'DRAFT' || !log.status) && (
                <>
                  <button 
                    onClick={() => openActionModal(log.id, 'reject')}
                    className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-95"
                  >
                    <XCircleIcon className="w-4 h-4" /> Từ chối
                  </button>
                  <button 
                    onClick={() => openActionModal(log.id, 'check')}
                    className="px-4 py-2 flex items-center gap-2 bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95"
                  >
                    <ShieldCheckIcon className="w-4 h-4" /> Kiểm tra
                  </button>
                </>
              )}
              {log.status === 'CHECKED' && (
                <>
                  <button 
                    onClick={() => openActionModal(log.id, 'reject')}
                    className="px-4 py-2 flex items-center gap-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all active:scale-95"
                  >
                    <XCircleIcon className="w-4 h-4" /> Từ chối
                  </button>
                  <button 
                    onClick={() => openActionModal(log.id, 'approve')}
                    className="px-4 py-2 flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    <CheckCircleIcon className="w-4 h-4" /> Phê duyệt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Action Modal (Same as Material Requests for consistency) */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[var(--color-border)] animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-0">
              <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] mb-2">
                {actionModal.actionType === 'check' ? 'Kiểm tra Nhật ký' : 
                 actionModal.actionType === 'approve' ? 'Phê duyệt Nhật ký' : 
                 'Từ chối Nhật ký'}
              </h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
                Vui lòng nhập ghi chú hoặc ý kiến cho hành động tiếp theo của bạn (không bắt buộc):
              </p>
              
              <textarea
                className="w-full h-32 p-4 text-sm bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all resize-none text-[var(--color-text-primary)]"
                placeholder="Nhập nội dung ghi chú..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
              />
            </div>
            
            <div className="p-8 flex justify-end gap-3">
              <button 
                className="px-6 py-3 text-sm font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] rounded-2xl transition-all cursor-pointer"
                onClick={() => setActionModal({ isOpen: false, logId: null, actionType: null })}
              >
                Hủy bỏ
              </button>
              <button 
                className={`px-8 py-3 text-sm font-bold text-white rounded-2xl transition-all cursor-pointer shadow-xl active:scale-95 disabled:opacity-50 ${
                  actionModal.actionType === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                  actionModal.actionType === 'reject' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                  'bg-[var(--color-primary)] hover:opacity-90 shadow-[var(--color-primary)]/20'
                }`}
                onClick={confirmAction}
                disabled={checkMutation.isPending || approveMutation.isPending || rejectMutation.isPending}
              >
                {checkMutation.isPending || approveMutation.isPending || rejectMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
