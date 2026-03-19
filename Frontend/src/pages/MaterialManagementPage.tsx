import { useState, useMemo } from 'react';
import { 
  useAllMaterialRequests,
  useCheckMaterialRequest,
  useApproveMaterialRequest,
  useRejectMaterialRequest,
  useDeleteMaterialRequest,
} from '../features/materials/api/materialApi';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { StatusBadge } from '../components/StatusBadge';
import { MaterialRequestForm } from '../features/materials/components/MaterialRequestForm';
import type { MaterialRequest } from '../features/materials/types/material.types';
import { useAuthStore } from '../features/auth/stores/authStore';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';

const MaterialManagementPage: React.FC = () => {
  const { data: requests, isLoading } = useAllMaterialRequests();
  const checkMutation = useCheckMaterialRequest();
  const approveMutation = useApproveMaterialRequest();
  const rejectMutation = useRejectMaterialRequest();
  const deleteMutation = useDeleteMaterialRequest();

  const user = useAuthStore(state => state.user);

  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<MaterialRequest | null>(null);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean, reqId: number | null, actionType: 'check' | 'approve' | 'reject' | null }>({ isOpen: false, reqId: null, actionType: null });
  const [actionNotes, setActionNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const openActionModal = (id: number, action: 'check' | 'approve' | 'reject') => {
    setActionModal({ isOpen: true, reqId: id, actionType: action });
    setActionNotes('');
  };

  const confirmAction = async () => {
    if (!actionModal.reqId || !actionModal.actionType) return;
    
    // Ensure we have a valid userId, fallback to 0 if not (backend will use SecurityContext anyway)
    const userId = user?.id ? Number(user.id) : 0;
    
    try {
      console.log(`Executing ${actionModal.actionType} for MR-${actionModal.reqId} by User ${userId}`);
      
      const payload = { id: actionModal.reqId, userId, notes: actionNotes };
      
      if (actionModal.actionType === 'check') {
        await checkMutation.mutateAsync(payload);
      } else if (actionModal.actionType === 'approve') {
        await approveMutation.mutateAsync(payload);
      } else if (actionModal.actionType === 'reject') {
        await rejectMutation.mutateAsync(payload);
      }
      
      console.log(`${actionModal.actionType} successful`);
      setActionModal({ isOpen: false, reqId: null, actionType: null });
      toast.success('Thao tác thành công');
    } catch (err: any) {
      console.error(`Error during ${actionModal.actionType}:`, err);
      toast.error(`Lỗi khi thực hiện: ${err?.response?.data?.message || err.message}`);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests?.filter((req: MaterialRequest) => {
      const matchesSearch = req.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           req.id.toString().includes(searchTerm);
      const matchesProject = selectedProjectId ? req.projectId === selectedProjectId : true;
      return matchesSearch && matchesProject;
    }) || [];
  }, [requests, searchTerm, selectedProjectId]);

  const projects = useMemo(() => {
    return Array.from(new Set(requests?.map((r: MaterialRequest) => ({ id: r.projectId, name: r.projectName || `Dự án ID: ${r.projectId}` })) || []));
  }, [requests]);

  const MATERIAL_COLUMNS: ColumnDef<MaterialRequest>[] = [
    {
      key: 'id',
      header: 'Số hiệu',
      render: (req) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          MR-{req.id.toString().padStart(4, '0')}
        </span>
      )
    },
    {
      key: 'materialName',
      header: 'Tên vật tư / thiết bị',
      render: (req) => (
        <div>
          <div className="font-medium text-[var(--color-primary)] hover:underline cursor-pointer">{req.materialName}</div>
          <div className="text-xs text-[var(--color-text-muted)]">{req.notes || 'Không có ghi chú'}</div>
        </div>
      )
    },
    {
      key: 'projectName',
      header: 'Dự án áp dụng',
      render: (req) => (
        <div className="font-medium text-[var(--color-text-primary)]">
          {req.projectName || `Project ID: ${req.projectId}`}
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Ngày yêu cầu',
      align: 'center',
      render: (req) => (
        <span className="text-[var(--color-text-muted)] text-[13px]">
          {dayjs(req.createdAt).format('DD/MM/YYYY')}
        </span>
      )
    },
    {
      key: 'requestedQuantity',
      header: 'Số lượng',
      render: (req) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          {req.requestedQuantity} <span className="text-[var(--color-text-muted)] font-normal text-xs">{req.materialUnit}</span>
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      align: 'center',
      render: (req) => <StatusBadge status={req.status} />
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (req) => (
        <div className="flex justify-end gap-1">
          {req.status === 'PENDING' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openActionModal(req.id, 'check');
              }}
              disabled={checkMutation.isPending}
              className="p-1.5 text-amber-500 hover:bg-amber-100/50 rounded-lg transition-all active:scale-90"
              title="Kiểm tra kỹ thuật"
            >
              <ShieldCheckIcon className="w-5 h-5 shadow-sm" />
            </button>
          )}
          {req.status === 'CHECKED' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openActionModal(req.id, 'approve');
              }}
              disabled={approveMutation.isPending}
              className="p-1.5 text-emerald-500 hover:bg-emerald-100/50 rounded-lg transition-all active:scale-90"
              title="Phê duyệt PM"
            >
              <CheckCircleIcon className="w-5 h-5" />
            </button>
          )}
          {(req.status === 'PENDING' || req.status === 'CHECKED') && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openActionModal(req.id, 'reject');
              }}
              disabled={rejectMutation.isPending}
              className="p-1.5 text-rose-500 hover:bg-rose-100/50 rounded-lg transition-all active:scale-90"
              title="Từ chối"
            >
              <XCircleIcon className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setEditingRequest(req);
              setShowForm(true);
            }}
            className="p-1.5 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/50 rounded-lg transition-all active:scale-90"
            title="Chi tiết"
          >
            <PlusIcon className="w-5 h-5 rotate-45" />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Xóa yêu cầu vật tư này?')) {
                deleteMutation.mutate({ id: req.id, projectId: req.projectId });
              }
            }}
            disabled={deleteMutation.isPending}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100/50 rounded-lg transition-all active:scale-90"
            title="Xóa"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Quản Lý Vật Tư & Thiết Bị
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1 font-semibold">
            Tổng hợp yêu cầu vật tư (MR) từ tất cả các dự án trong hệ thống.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-success-bg)] border border-[var(--color-success)]/10 rounded-2xl shadow-sm">
          <ShieldCheckIcon className="size-5 text-[var(--color-success)]" />
          <span className="text-sm font-bold text-[var(--color-success)]">Hệ thống bảo mật</span>
        </div>
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input 
            type="text"
            placeholder="Tìm kiếm vật tư theo tên hoặc mã..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] outline-none transition-all"
          />
        </div>
        
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[var(--color-text-muted)]" />
          <select 
            className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none appearance-none cursor-pointer"
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            value={selectedProjectId || ''}
          >
            <option value="">Tất cả dự án áp dụng</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
            <FunnelIcon className="size-4 opacity-50" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 text-sm text-[var(--color-text-muted)] font-medium pr-2">
            <div className="px-3 py-1 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
              <span className="text-[var(--color-text-primary)] font-bold">{filteredRequests.length}</span> / <span className="text-[var(--color-text-muted)]">{requests?.length || 0}</span> yêu cầu
            </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card-theme)] border border-[var(--color-border)] overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white dark:bg-[var(--color-surface)]">
          <h2 className="font-bold flex items-center gap-2 text-[var(--color-text-primary)] text-lg">
            <ShoppingBagIcon className="w-5 h-5 text-[var(--color-primary)]" />
            Danh sách tất cả yêu cầu vật tư
          </h2>
          <button 
            onClick={() => {
              setEditingRequest(null);
              setShowForm(!showForm);
            }}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {showForm ? 'Đóng biểu mẫu' : (
              <>
                <PlusIcon className="size-4 stroke-[3px]" />
                Tạo yêu cầu mới
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 animate-in slide-in-from-top-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <MaterialRequestForm 
                projectId={editingRequest?.projectId || projects[0]?.id || 1}
                initialData={editingRequest}
                onClose={() => {
                  setShowForm(false);
                  setEditingRequest(null);
                }}
              />
            </div>
          </div>
        )}

        <div className="p-0">
          <DataTable
            items={filteredRequests}
            columns={MATERIAL_COLUMNS}
            isLoading={isLoading}
            emptyMessage="Không tìm thấy yêu cầu vật tư nào phù hợp."
          />
        </div>
      </div>

      {/* Action Modal (Check/Approve/Reject) */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
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
                className="px-5 py-2.5 text-sm font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] hover:bg-[var(--color-border)] rounded-xl transition-all cursor-pointer"
                onClick={() => setActionModal({ isOpen: false, reqId: null, actionType: null })}
              >
                Hủy bỏ
              </button>
              <button 
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionModal.actionType === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' :
                  actionModal.actionType === 'reject' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' :
                  'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
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
};

export default MaterialManagementPage;
