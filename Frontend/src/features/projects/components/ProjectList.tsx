import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useProjects, useDeleteProject } from '../api/projectApi';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import type { Project } from '../types/project.types';

const ProjectActions = ({ project }: { project: Project }) => {
  const deleteMutation = useDeleteProject();

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc muốn xóa dự án "${project.name}"?`)) {
      deleteMutation.mutate(project.id);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        to={`/projects/${project.id}`}
        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-md transition-all cursor-pointer"
        title="Xem chi tiết"
      >
        <EyeIcon className="size-4.5" />
      </Link>
      <Link
        to={`/projects/${project.id}/edit`}
        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-warning)] hover:bg-[var(--color-warning-bg)] rounded-md transition-all cursor-pointer"
        title="Chỉnh sửa"
      >
        <PencilIcon className="size-4.5" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-md transition-all cursor-pointer disabled:opacity-50"
        title="Xóa dự án"
      >
        <TrashIcon className="size-4.5" />
      </button>
    </div>
  );
};

const PROJECT_COLUMNS: ColumnDef<Project>[] = [
  {
    key: 'name',
    header: 'Tên dự án',
    render: (p) => (
      <Link
        to={`/projects/${p.id}`}
        className="font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
      >
        {p.name}
      </Link>
    )
  },
  { key: 'address', header: 'Địa chỉ' },
  {
    key: 'status',
    header: 'Trạng thái',
    align: 'center',
    render: (p) => (
      <StatusBadge
        label={p.status === 'PLANNING' ? 'Khởi tạo' : p.status === 'IN_PROGRESS' ? 'Đang thi công' : p.status === 'COMPLETED' ? 'Hoàn thành' : 'Tạm dừng'}
        variant={p.status === 'COMPLETED' ? 'success' : p.status === 'IN_PROGRESS' ? 'info' : p.status === 'PLANNING' ? 'warning' : 'danger'}
      />
    )
  },
  {
    key: 'startDate',
    header: 'Bắt đầu',
    render: (p) => new Date(p.startDate).toLocaleDateString('vi-VN')
  },
  {
    key: 'endDate',
    header: 'Dự kiến hoàn thành',
    render: (p) => new Date(p.endDate).toLocaleDateString('vi-VN')
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    render: (p) => <ProjectActions project={p} />
  }
];

export function ProjectList() {
  const { data: projects, isLoading } = useProjects();

  return (
    <DataTable<Project>
      items={projects ?? []}
      columns={PROJECT_COLUMNS}
      isLoading={isLoading}
      emptyMessage="Chưa có dự án nào được tạo."
    />
  );
}
