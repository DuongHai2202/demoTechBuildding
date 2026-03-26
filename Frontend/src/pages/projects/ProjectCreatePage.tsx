import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateProject } from '../../features/projects/api/projectApi';
import { ProjectForm } from '../../features/projects/components/ProjectForm';
import type { ProjectFormData } from '../../features/projects/types/project.schemas';

export default function ProjectCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreateProject();

  const handleSubmit = (data: ProjectFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Dự án đã được tạo thành công!');
        navigate('/projects');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo dự án';
        toast.error(message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Tạo dự án mới</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Thiết lập thông tin cơ bản và vị trí công trình</p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)] lg:p-8">
        <ProjectForm 
          onSubmit={handleSubmit} 
          isLoading={createMutation.isPending} 
        />
      </div>
    </div>
  );
}
