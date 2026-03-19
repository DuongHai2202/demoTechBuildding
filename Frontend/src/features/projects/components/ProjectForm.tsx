import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectFormData } from '../types/project.schemas';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ProjectLeafletMap } from './ProjectLeafletMap';
import type { Project } from '../types/project.types';

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      projectCode: initialData.projectCode || '',
      description: initialData.description || '',
      address: initialData.address || '',
      latitude: initialData.latitude,
      longitude: initialData.longitude,
      radiusMeters: initialData.radiusMeters ?? 100,
      startDate: initialData.startDate?.split('T')[0] || '',
      endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
      status: initialData.status || 'PLANNING',
    } as any : {
      radiusMeters: 100,
      status: 'PLANNING',
      latitude: 21.028511,
      longitude: 105.854167,
    } as any,
  });

  const lat = watch('latitude') ?? 21.028511;
  const lng = watch('longitude') ?? 105.854167;
  const radius = watch('radiusMeters');

  const onFormSubmit = (data: ProjectFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Basic Info */}
        <div className="space-y-4">
          <Input
            label="Tên dự án"
            placeholder="Nhập tên dự án"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Mã dự án"
            placeholder="VD: DA-2024-001"
            error={errors.projectCode?.message}
            {...register('projectCode')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text-secondary)]">
              Mô tả dự án
            </label>
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Nhập mô tả cho dự án..."
              {...register('description')}
            />
          </div>

          <Input
            label="Địa chỉ cụ thể"
            placeholder="Số nhà, Tên đường, Phường, Huyện, Thành phố..."
            error={errors.address?.message}
            {...register('address')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="Ngày kết thúc (Dự kiến)"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text-secondary)]">
                Trạng thái
              </label>
              <select
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-primary-500/20"
                {...register('status')}
              >
                <option value="PLANNING">Hoạch định</option>
                <option value="IN_PROGRESS">Đang thi công</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="SUSPENDED">Tạm dừng</option>
              </select>
            </div>
            <Input
              label="Bán kính Check-in (mét)"
              type="number"
              error={errors.radiusMeters?.message}
              {...register('radiusMeters', { valueAsNumber: true })}
            />
          </div>
        </div>

        {/* Right: Map Integration */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-[var(--color-text-secondary)]">
            Vị trí dự án & Geofencing (Tìm kiếm hoặc Click bản đồ)
          </label>
          <div className="h-[450px]">
            <ProjectLeafletMap
              lat={lat}
              lng={lng}
              radius={radius}
              onLocationChange={(newLat, newLng, address) => {
                setValue('latitude', newLat);
                setValue('longitude', newLng, { shouldValidate: true });
                if (address) {
                  setValue('address', address, { shouldValidate: true });
                }
              }}
            />
          </div>
          {(errors.latitude || errors.longitude) && (
            <p className="text-xs text-[var(--color-danger)]">Vui lòng chọn tọa độ trên bản đồ</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-xs text-[var(--color-text-muted)]">Vĩ độ: {lat?.toFixed(6) || '—'}</div>
            <div className="text-xs text-[var(--color-text-muted)]">Kinh độ: {lng?.toFixed(6) || '—'}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-[var(--color-border)]">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Hủy bỏ
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Cập nhật dự án' : 'Tạo dự án mới'}
        </Button>
      </div>
    </form>
  );
}
