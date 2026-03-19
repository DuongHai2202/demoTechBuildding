import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import { useDeleteContract } from '../api/contractApi';
import type { Contract } from '../types/contract.types';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useMyProjectPermission } from '../../projects/api/projectApi';

interface ContractListProps {
  contracts: Contract[];
  isLoading?: boolean;
  projectId: number;
}

export function ContractList({ contracts, isLoading, projectId }: ContractListProps) {
  const deleteMutation = useDeleteContract();
  const permissions = useMyProjectPermission(projectId);

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa hợp đồng này?')) {
      deleteMutation.mutate({ id });
    }
  };

  const columns = useMemo<ColumnDef<Contract>[]>(() => [
    {
      key: 'contractNumber',
      header: 'Số hiệu',
      render: (c) => <span className="font-medium text-[var(--color-text-primary)]">{c.contractNumber}</span>
    },
    {
      key: 'contractName',
      header: 'Tên hợp đồng',
      render: (c) => (
        <div>
          <Link
            to={`/projects/${c.projectId}/contracts/${c.id}`}
            className="font-medium text-[var(--color-primary)] hover:underline"
          >
            {c.contractName}
          </Link>
          <div className="text-xs text-[var(--color-text-muted)]">{c.partnerName}</div>
        </div>
      )
    },
    {
      key: 'contractValue',
      header: 'Giá trị',
      render: (c) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.contractValue)}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (c) => <StatusBadge status={c.status} />
    },
    {
      key: 'actions',
      header: '',
      render: (c) => (
        <div className="flex justify-end gap-2">
          {c.fileUrl && (
            <a 
              href={c.fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-full transition-colors"
              title="Tải xuống tài liệu"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </a>
          )}
          {permissions.canManageContracts && (
            <button
              onClick={() => handleDelete(c.id)}
              disabled={deleteMutation.isPending}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
              title="Xóa"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      )
    }
  ], [deleteMutation]);

  return (
    <DataTable<Contract>
      items={contracts}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Chưa có hợp đồng nào được ghi nhận."
    />
  );
}
