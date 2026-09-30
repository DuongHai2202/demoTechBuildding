import { useState } from 'react';
import {
  useProjectMaterialRequests,
  useCheckMaterialRequest,
  useApproveMaterialRequest,
  useRejectMaterialRequest,
  useDeleteMaterialRequest,
} from '../api/materialApi';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import type { MaterialRequest } from '../types/material.types';
import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon, EyeIcon, PencilSquareIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { MaterialRequestForm } from './MaterialRequestForm';
import { MaterialRequestDetailModal } from './MaterialRequestDetailModal';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import { useAuthStore } from '../../auth/stores/authStore';
import { hasPermission } from '../../auth/authorization';

interface MaterialRequestListProps {
  projectId: number;
}

export function MaterialRequestList({ projectId }: MaterialRequestListProps) {
  const { confirm } = useActionDialog();
  const user = useAuthStore(state => state.user);
  const canManageMaterials = hasPermission(user, 'MATERIAL_MANAGE');
  const canRequestMaterials = hasPermission(user, 'MATERIAL_REQUEST');
  const [formState, setFormState] = useState<{ isOpen: boolean; request: MaterialRequest | null }>({ isOpen: false, request: null });
  const [viewingRequest, setViewingRequest] = useState<MaterialRequest | null>(null);
  const { data: requests, isLoading } = useProjectMaterialRequests(projectId, { enabled: canRequestMaterials });
  const checkMutation = useCheckMaterialRequest();
  const approveMutation = useApproveMaterialRequest();
  const rejectMutation = useRejectMaterialRequest();
  const deleteMutation = useDeleteMaterialRequest();

  const handleUpdateStatus = async (id: number, status: 'CHECKED' | 'APPROVED' | 'REJECTED') => {
    if (await confirm({
      title: status === 'CHECKED' ? 'Kiểm tra yêu cầu vật tư' : status === 'APPROVED' ? 'Duyệt yêu cầu vật tư' : 'Từ chối yêu cầu vật tư',
      description: `Yêu cầu sẽ chuyển sang trạng thái ${status === 'CHECKED' ? 'đã kiểm tra' : status === 'APPROVED' ? 'đã duyệt' : 'từ chối'}. Bạn có chắc muốn tiếp tục?`,
      confirmLabel: status === 'CHECKED' ? 'Kiểm tra' : status === 'APPROVED' ? 'Duyệt yêu cầu' : 'Từ chối',
      variant: status === 'REJECTED' ? 'danger' : 'success',
    })) {
      const payload = { id, userId: Number(user?.id), notes: undefined };
      try {
        if (status === 'CHECKED') await checkMutation.mutateAsync(payload);
        if (status === 'APPROVED') await approveMutation.mutateAsync(payload);
        if (status === 'REJECTED') await rejectMutation.mutateAsync(payload);
      } catch {
        // The mutation hooks already surface the backend error as a toast.
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (await confirm({
      title: 'Xóa yêu cầu vật tư',
      description: 'Yêu cầu vật tư này sẽ bị xóa khỏi dự án. Bạn có chắc muốn tiếp tục?',
      confirmLabel: 'Xóa yêu cầu',
      variant: 'danger',
    })) {
      deleteMutation.mutate({ id, projectId });
    }
  };

  if (!canRequestMaterials) return null;

  const columns: ColumnDef<MaterialRequest>[] = [
    {
      key: 'material',
      header: 'Vật liệu',
      render: (req: MaterialRequest) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{req.materialName || '—'}</div>
            <div className="text-xs text-slate-500">{req.materialUnit || ''}</div>
          </div>
        </div>
      )
    },
    {
      key: 'requestedQuantity',
      header: 'Số lượng',
      render: (req: MaterialRequest) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          {req.requestedQuantity} {req.materialUnit || ''}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (req: MaterialRequest) => <StatusBadge status={req.status} />
    },
    {
      key: 'createdAt',
      header: 'Ngày yêu cầu',
      render: (req: MaterialRequest) => new Date(req.createdAt).toLocaleDateString('vi-VN')
    },
    {
      key: 'actions',
      header: '',
      render: (req: MaterialRequest) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setViewingRequest(req)}
            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
            title="Xem chi tiết"
            aria-label={`Xem chi tiết MR-${req.id.toString().padStart(4, '0')}`}
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          {canManageMaterials && req.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleUpdateStatus(req.id, 'CHECKED')}
                disabled={checkMutation.isPending}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                title="Kiểm tra kỹ thuật"
              >
                <ShieldCheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                disabled={rejectMutation.isPending}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Từ chối"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </>
          )}
          {canManageMaterials && req.status === 'CHECKED' && (
            <>
              <button
                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                disabled={approveMutation.isPending}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                title="Duyệt"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                disabled={rejectMutation.isPending}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Từ chối"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </>
          )}
          {canRequestMaterials && req.status === 'PENDING' && (
            <button
              onClick={() => setFormState({ isOpen: true, request: req })}
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-full transition-colors"
              title="Chỉnh sửa yêu cầu"
              aria-label={`Chỉnh sửa MR-${req.id.toString().padStart(4, '0')}`}
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          )}
          {canManageMaterials && req.status === 'PENDING' && (
            <button
              onClick={() => handleDelete(req.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
              title="Xóa yêu cầu đang chờ duyệt"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dự trù vật tư</h3>
        <button
          onClick={() => setFormState({ isOpen: true, request: null })}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Tạo yêu cầu
        </button>
      </div>

      <DataTable<MaterialRequest>
        items={requests ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có yêu cầu vật tư nào cho dự án này."
      />

      {formState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6">
            <MaterialRequestForm 
              projectId={projectId} 
              initialData={formState.request}
              onClose={() => setFormState({ isOpen: false, request: null })}
            />
          </div>
        </div>
      )}

      {viewingRequest && (
        <MaterialRequestDetailModal
          request={viewingRequest}
          canEdit={viewingRequest.status === 'PENDING'}
          onClose={() => setViewingRequest(null)}
          onEdit={() => {
            setFormState({ isOpen: true, request: viewingRequest });
            setViewingRequest(null);
          }}
        />
      )}
    </div>
  );
}
