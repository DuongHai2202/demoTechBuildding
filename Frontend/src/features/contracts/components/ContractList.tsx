import { Link } from 'react-router-dom';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import { useDeleteContract, useDownloadContract } from '../api/contractApi';
import type { Contract } from '../types/contract.types';
import { TrashIcon, ArrowDownTrayIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { useMyProjectPermission } from '../../projects/api/projectApi';
import { useActionDialog } from '../../../components/ui/ActionDialog';

interface ContractListProps {
  contracts: Contract[];
  isLoading?: boolean;
  projectId?: number;
  onEdit?: (contract: Contract) => void;
}

export function ContractList({ contracts, isLoading, projectId, onEdit }: ContractListProps) {
  const { confirm } = useActionDialog();
  const deleteMutation = useDeleteContract();
  const downloadMutation = useDownloadContract();
  const permissions = useMyProjectPermission(projectId ?? 0);

  const handleDelete = async (id: number) => {
    if (await confirm({
      title: 'Xóa hợp đồng',
      description: 'Hợp đồng này sẽ bị xóa khỏi danh sách. Bạn có chắc muốn tiếp tục?',
      confirmLabel: 'Xóa hợp đồng',
      variant: 'danger',
    })) {
      deleteMutation.mutate({ id });
    }
  };

  const columns: ColumnDef<Contract>[] = [
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
          <div className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
            Dự án: {c.projectName || `Dự án #${c.projectId}`}
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            Đối tác: {c.partnerName || 'Chưa cập nhật'}
          </div>
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
            <button
              type="button"
              onClick={() => downloadMutation.mutate({ id: c.id, fallbackFileName: `${c.contractNumber}.pdf` })}
              disabled={downloadMutation.isPending}
              className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-full transition-colors disabled:opacity-50"
              title="Tải xuống tài liệu hợp đồng"
              aria-label={`Tải xuống tài liệu ${c.contractNumber}`}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          )}
          {onEdit && permissions.canManageContracts && (
            <button
              onClick={() => onEdit(c)}
              className="p-1.5 text-slate-400 hover:text-[var(--color-primary)] rounded-full transition-colors"
              title="Chỉnh sửa"
            >
              <PencilSquareIcon className="w-5 h-5" />
            </button>
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
  ];

  return (
    <DataTable<Contract>
      items={contracts}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Chưa có hợp đồng nào được ghi nhận."
    />
  );
}
