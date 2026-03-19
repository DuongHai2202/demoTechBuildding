import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateTechnicalStandard } from '../api/technicalStandardApi';
import { useProjects } from '../../projects/api/projectApi';
import { XMarkIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  code: z.string().min(1, 'Mã hiệu là bắt buộc'),
  name: z.string().min(1, 'Tên tiêu chuẩn là bắt buộc'),
  description: z.string().optional(),
  category: z.string().min(1, 'Phân loại là bắt buộc'),
  version: z.string().optional(),
  projectId: z.number().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  standard?: any;
  onClose: () => void;
}

export function TechnicalStandardForm({ standard, onClose }: Props) {
  const createMutation = useCreateTechnicalStandard();
  const { data: projects } = useProjects();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: standard ? {
      code: standard.code,
      name: standard.name,
      description: standard.description,
      category: standard.category,
      version: standard.version,
      projectId: standard.projectId,
    } : {
      category: 'TCVN',
      version: '1.0'
    }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[var(--color-surface)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-gray-50/50">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {standard ? 'Cập nhật Tiêu chuẩn' : 'Thêm Tiêu chuẩn Kỹ thuật'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <XMarkIcon className="size-6 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[var(--color-text-muted)]">Mã hiệu *</label>
              <input
                {...register('code')}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                placeholder="VD: TCVN 9386:2012"
              />
              {errors.code && <p className="text-xs text-red-500 font-medium">{errors.code.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[var(--color-text-muted)]">Phân loại *</label>
              <select
                {...register('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              >
                <option value="TCVN">TCVN (Việt Nam)</option>
                <option value="ASTM">ASTM (Mỹ)</option>
                <option value="EUROCODE">EUROCODE (Châu Âu)</option>
                <option value="IEC">IEC (Điện)</option>
                <option value="INTERNAL">Tiêu chuẩn Nội bộ</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[var(--color-text-muted)]">Tên tiêu chuẩn *</label>
            <input
              {...register('name')}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="VD: Thiết kế công trình chịu động đất"
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[var(--color-text-muted)]">Phiên bản</label>
              <input
                {...register('version')}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                placeholder="VD: 2024"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[var(--color-text-muted)]">Gán cho dự án</label>
              <select
                {...register('projectId', { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              >
                <option value="">-- Dùng chung toàn công ty --</option>
                {projects?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-[var(--color-text-muted)]">Mô tả chi tiết</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-none"
              placeholder="Nhập nội dung vắn tắt về tiêu chuẩn..."
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-[var(--color-border)] font-bold text-[var(--color-text-secondary)] hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:opacity-90 disabled:opacity-50 active:scale-[0.98] transition-all shadow-lg"
            >
              {createMutation.isPending ? 'Đang lưu...' : (standard ? 'Cập nhật' : 'Lưu tiêu chuẩn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
