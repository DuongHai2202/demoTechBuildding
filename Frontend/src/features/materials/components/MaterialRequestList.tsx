import React, { useMemo, useState } from 'react';
import { useProjectMaterialRequests, useUpdateMaterialRequestStatus, useDeleteMaterialRequest } from '../api/materialApi';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import type { MaterialRequest } from '../types/material.types';
import { CheckIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { MaterialRequestForm } from './MaterialRequestForm';

interface MaterialRequestListProps {
  projectId: number;
}

export function MaterialRequestList({ projectId }: MaterialRequestListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: requests, isLoading } = useProjectMaterialRequests(projectId);
  const updateStatusMutation = useUpdateMaterialRequestStatus();
  const deleteMutation = useDeleteMaterialRequest();

  const handleUpdateStatus = (id: number, status: 'APPROVED' | 'REJECTED') => {
    if (window.confirm(`Bạn có chắc muốn ${status === 'APPROVED' ? 'duyệt' : 'từ chối'} yêu cầu này?`)) {
      updateStatusMutation.mutate({ id, status, projectId });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa yêu cầu này?')) {
      deleteMutation.mutate({ id, projectId });
    }
  };

  const columns = useMemo<ColumnDef<MaterialRequest>[]>(() => [
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
          {req.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                disabled={updateStatusMutation.isPending}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                title="Duyệt"
              >
                <CheckIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                disabled={updateStatusMutation.isPending}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                title="Từ chối"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => handleDelete(req.id)}
            disabled={deleteMutation.isPending}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
            title="Xóa"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ], [updateStatusMutation, projectId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Dự trù vật tư</h3>
        <button
          onClick={() => setIsFormOpen(true)}
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6">
            <MaterialRequestForm 
              projectId={projectId} 
              onClose={() => setIsFormOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
