import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useProject, useUpdateProject } from '../../features/projects/api/projectApi';
import { ProjectForm } from '../../features/projects/components/ProjectForm';
import type { ProjectFormData } from '../../features/projects/types/project.schemas';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function ProjectEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);
  
  const { data: project, isLoading: isFetching } = useProject(projectId);
  const updateMutation = useUpdateProject(projectId);

  if (isFetching) {
    return <LoadingSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">Không tìm thấy dự án.</p>
        <Link to="/projects" className="mt-4 text-primary-500 hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  const handleSubmit = async (data: ProjectFormData) => {
    updateMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Dự án đã được cập nhật thành công!');
        navigate(`/projects/${projectId}`);
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật dự án';
        toast.error(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Link 
        to={`/projects/${projectId}`} 
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
      >
        <ChevronLeftIcon className="size-4" />
        Hủy và quay lại chi tiết
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Chỉnh sửa dự án</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Cập nhật thông tin và vị trí geofencing của dự án</p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)]">
        <ProjectForm 
          initialData={project} 
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending} 
        />
      </div>
    </div>
  );
}
