import { useState } from 'react';
import { 
  useProjectMaterialRequests, 
  useCheckMaterialRequest, 
  useApproveMaterialRequest, 
  useRejectMaterialRequest,
  useDeleteMaterialRequest,
} from '../api/materialApi';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { StatusBadge } from '../../../components/StatusBadge';
import { formatDate } from '../../../utils/formatDate';
import { 
  CheckCircleIcon, 
  ShieldCheckIcon, 
  XCircleIcon, 
  ChatBubbleBottomCenterTextIcon,
  ClockIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../auth/stores/authStore';
import { MaterialRequestForm } from './MaterialRequestForm';
import type { MaterialRequest } from '../types/material.types';

export function MaterialRequestBoard({ projectId }: { projectId: number }) {
  const { data: requests, isLoading } = useProjectMaterialRequests(projectId);
  const checkMutation = useCheckMaterialRequest();
  const approveMutation = useApproveMaterialRequest();
  const rejectMutation = useRejectMaterialRequest();
  const deleteMutation = useDeleteMaterialRequest();
  
  const user = useAuthStore(s => s.user);

  const [actionModal, setActionModal] = useState<{ isOpen: boolean, reqId: number | null, actionType: 'check' | 'approve' | 'reject' | null }>({ isOpen: false, reqId: null, actionType: null });
  const [actionNotes, setActionNotes] = useState('');

  const [formModal, setFormModal] = useState<{ isOpen: boolean, initialData: MaterialRequest | null }>({ isOpen: false, initialData: null });

  if (isLoading) return <LoadingSkeleton />;

  const openActionModal = (id: number, action: 'check' | 'approve' | 'reject') => {
    setActionModal({ isOpen: true, reqId: id, actionType: action });
    setActionNotes('');
  };

  const confirmAction = () => {
    if (!actionModal.reqId || !actionModal.actionType) return;
    const userId = Number(user?.id);
    
    if (actionModal.actionType === 'check') checkMutation.mutate({ id: actionModal.reqId, userId, notes: actionNotes });
    if (actionModal.actionType === 'approve') approveMutation.mutate({ id: actionModal.reqId, userId, notes: actionNotes });
    if (actionModal.actionType === 'reject') rejectMutation.mutate({ id: actionModal.reqId, userId, notes: actionNotes });
    
    setActionModal({ isOpen: false, reqId: null, actionType: null });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
      deleteMutation.mutate({ id, projectId });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm transition-colors">
        <div>
          <h3 className="font-bold text-[var(--color-text-primary)]">Danh sách Yêu cầu</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Quản lý và phê duyệt vật tư dự án</p>
        </div>
        <button 
          onClick={() => setFormModal({ isOpen: true, initialData: null })}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-sm shadow-[var(--color-primary)]/20 cursor-pointer"
        >
          <PlusIcon className="size-5" />
          Tạo Yêu cầu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests?.map(req => (
          <div 
            key={req.id}
            className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:border-[var(--color-primary)]/30 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={req.status} />
                <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                  <ClockIcon className="size-3" /> {formatDate(req.createdAt)}
                </span>
                
                {req.status === 'PENDING' && (
                  <div className="flex items-center gap-1 ml-auto md:ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setFormModal({ isOpen: true, initialData: req })}
                      className="p-1 px-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-all"
                      title="Sửa yêu cầu"
                    >
                      <PencilSquareIcon className="size-3.5" /> Sửa
                    </button>
                    <button 
                      onClick={() => handleDelete(req.id)}
                      className="p-1 px-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition-all"
                      title="Xóa yêu cầu"
                    >
                      <TrashIcon className="size-3.5" /> Xóa
                    </button>
                  </div>
                )}
              </div>
              <h3 className="font-extrabold text-[var(--color-text-primary)] mt-1">
                {req.requestedQuantity} {req.materialUnit} - {req.materialName}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                Yêu cầu bởi: <span className="font-semibold text-[var(--color-text-primary)]">{req.requesterName}</span>
              </p>
              
              {req.status !== 'PENDING' && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  {req.checkedByName && (
                    <div className="text-[10px]">
                      <span className="text-[var(--color-text-muted)] block">Kỹ thuật kiểm tra:</span>
                      <span className="font-medium">{req.checkedByName}</span>
                    </div>
                  )}
                  {req.approvedByName && (
                    <div className="text-[10px]">
                      <span className="text-[var(--color-text-muted)] block">PM Phê duyệt:</span>
                      <span className="font-medium">{req.approvedByName}</span>
                    </div>
                  )}
                  {req.notes && (
                    <div className="col-span-full pt-2 border-t border-[var(--color-border)] text-[10px] italic flex items-start gap-1 text-[var(--color-text-muted)]">
                      <ChatBubbleBottomCenterTextIcon className="size-3 mt-0.5 shrink-0" />
                      <span>{req.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 md:border-l md:pl-6 border-[var(--color-border)] pt-4 md:pt-0 border-t md:border-t-0 mt-4 md:mt-0 justify-end md:justify-start">
              {req.status === 'PENDING' && (
                <button 
                  onClick={() => openActionModal(req.id, 'check')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 hover:scale-105 transition-all shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  <ShieldCheckIcon className="size-4" /> Kiểm tra
                </button>
              )}
              {req.status === 'CHECKED' && (
                <button 
                  onClick={() => openActionModal(req.id, 'approve')}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-90 hover:scale-105 transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
                >
                  <CheckCircleIcon className="size-4" /> Phê duyệt
                </button>
              )}
              {(req.status === 'PENDING' || req.status === 'CHECKED') && (
                <button 
                  onClick={() => openActionModal(req.id, 'reject')}
                  className="px-4 py-2 rounded-xl border border-[var(--color-danger)]/50 text-[var(--color-danger)] text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--color-danger-bg)] hover:scale-105 transition-all cursor-pointer"
                >
                  <XCircleIcon className="size-4" /> Từ chối
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {requests?.length === 0 && (
        <div className="py-20 text-center text-[var(--color-text-muted)] dark:text-slate-500 border-2 border-dashed border-[var(--color-border)] dark:border-slate-700 rounded-3xl">
          Chưa có yêu cầu vật tư nào.
        </div>
      )}

      {/* Action Modal (Check/Approve/Reject) */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-md p-6 shadow-[var(--shadow-modal-theme)] animate-in zoom-in-95 duration-200 border border-[var(--color-border)]">
            <h3 className="text-lg font-extrabold text-[var(--color-text-primary)] mb-2">
              {actionModal.actionType === 'approve' ? 'Phê duyệt Yêu cầu' : actionModal.actionType === 'reject' ? 'Từ chối Yêu cầu' : 'Kiểm tra Yêu cầu'}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Vui lòng nhập ghi chú hoặc ý kiến cho hành động tiếp theo của bạn (không bắt buộc):
            </p>
            <textarea
              className="w-full border border-[var(--color-border)] rounded-xl p-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 min-h-[100px] transition-all bg-[var(--color-bg)] text-[var(--color-text-primary)]"
              placeholder="Nhập nội dung ghi chú..."
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-all cursor-pointer"
                onClick={() => setActionModal({ isOpen: false, reqId: null, actionType: null })}
              >
                Hủy bỏ
              </button>
              <button 
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all cursor-pointer shadow-lg ${
                  actionModal.actionType === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                  actionModal.actionType === 'reject' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                  'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                }`}
                onClick={confirmAction}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Create/Edit) */}
      {formModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[var(--color-surface)] rounded-3xl w-full max-w-lg p-8 shadow-[var(--shadow-modal-theme)] animate-in zoom-in-95 duration-200 border border-[var(--color-border)]">
            <MaterialRequestForm 
              projectId={projectId}
              initialData={formModal.initialData}
              onClose={() => setFormModal({ isOpen: false, initialData: null })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
