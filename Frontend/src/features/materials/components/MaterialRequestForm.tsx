import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  useMaterials, 
  useCreateMaterialRequest, 
  useUpdateMaterialRequest 
} from '../api/materialApi';
import { useAuthStore } from '../../auth/stores/authStore';
import type { MaterialRequest } from '../types/material.types';
import { optionalText } from '../../../utils/validation';

const schema = z.object({
  materialId: z.coerce.number().finite().min(1, 'Vui lòng chọn vật tư'),
  requestedQuantity: z.coerce.number().finite('Số lượng phải là số hợp lệ').min(0.01, 'Số lượng phải lớn hơn 0'),
  notes: optionalText().refine(
    (value) => !value || value.length <= 2000,
    'Ghi chú không được vượt quá 2.000 ký tự'
  ),
});

type FormData = z.infer<typeof schema>;

interface MaterialRequestFormProps {
  projectId: number;
  onClose: () => void;
  initialData?: MaterialRequest | null;
}

export function MaterialRequestForm({ projectId, onClose, initialData }: MaterialRequestFormProps) {
  const user = useAuthStore(state => state.user);
  const { data: materials } = useMaterials();
  const createMutation = useCreateMaterialRequest();
  const updateMutation = useUpdateMaterialRequest();

  const isEdit = !!initialData;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      materialId: initialData?.materialId || 0,
      requestedQuantity: initialData?.requestedQuantity || 0,
      notes: initialData?.notes || '',
    }
  });

  useEffect(() => {
    // The material catalogue is loaded asynchronously. Resetting before the
    // options exist makes a native select fall back to its empty option, so
    // apply the edit value again after the catalogue has arrived.
    if (initialData && materials) {
      reset({
        materialId: initialData.materialId,
        requestedQuantity: initialData.requestedQuantity,
        notes: initialData.notes || '',
      });
    }
  }, [initialData, materials, reset]);

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }
    try {
      if (isEdit && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          payload: {
            projectId,
            materialId: data.materialId,
            requestedQuantity: data.requestedQuantity,
            notes: data.notes
          }
        });
      } else {
        await createMutation.mutateAsync({
          projectId,
          requesterId: user.id,
          materialId: data.materialId,
          requestedQuantity: data.requestedQuantity,
          notes: data.notes
        });
      }
      toast.success(isEdit ? 'Đã cập nhật yêu cầu vật tư.' : 'Đã tạo yêu cầu vật tư.');
      onClose();
    } catch (error: any) {
      console.error('Lỗi khi lưu yêu cầu:', error);
      toast.error(error?.response?.data?.message || 'Không thể lưu yêu cầu vật tư.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">
            Vật tư / Thiết bị <span className="text-[var(--color-danger)]">*</span>
          </label>
          <div className="relative group">
            <select
              {...register('materialId')}
              className={`w-full p-3.5 rounded-2xl border bg-[var(--color-bg)] text-[var(--color-text-primary)] text-sm outline-none transition-all appearance-none cursor-pointer ${
                errors.materialId 
                  ? 'border-[var(--color-danger)] ring-4 ring-[var(--color-danger)]/10' 
                  : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10'
              }`}
            >
              <option value="">-- Chọn loại vật tư --</option>
              {materials?.map(m => (
                <option key={m.id} value={m.id}>
                  {m.nameVi || 'Chưa có tên'} ({m.unit}) {m.managementCode ? `[${m.managementCode}]` : ''}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-primary)]/50 group-focus-within:text-[var(--color-primary)] transition-colors">
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {errors.materialId && (
            <p className="mt-1 text-xs text-[var(--color-danger)] font-medium ml-1">{errors.materialId.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">
            Số lượng yêu cầu <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register('requestedQuantity')}
            placeholder="0.00"
            className={`w-full p-3.5 rounded-2xl border bg-[var(--color-bg)] text-[var(--color-text-primary)] text-sm font-bold outline-none transition-all ${
              errors.requestedQuantity 
                ? 'border-[var(--color-danger)] ring-4 ring-[var(--color-danger)]/10' 
                : 'border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10'
            }`}
          />
          {errors.requestedQuantity && (
            <p className="mt-1 text-xs text-[var(--color-danger)] font-medium ml-1">{errors.requestedQuantity.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">
            Ghi chú / Yêu cầu thêm
          </label>
          <textarea
            {...register('notes')}
            placeholder="Nhập ghi chú chi tiết cho yêu cầu này..."
            rows={4}
            className="w-full p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] text-sm outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all resize-none shadow-inner"
          />
          {errors.notes && (
            <p className="mt-1 text-xs font-medium text-[var(--color-danger)] ml-1">{errors.notes.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[var(--color-border)] border-dashed mt-8">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline px-6"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="btn-primary px-8"
          >
            {createMutation.isPending || updateMutation.isPending ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Gửi yêu cầu'}
          </button>
        </div>
      </form>
    </div>
  );
}
