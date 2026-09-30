import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateBoqItem, useBoqItems } from '../api/contractApi';
import { InformationCircleIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { optionalCode, optionalText, requiredText } from '../../../utils/validation';

const schema = z.object({
  itemCode: optionalCode(),
  description: requiredText('Tên/Mô tả phải có ít nhất 2 ký tự', 2),
  unit: requiredText('Đơn vị tính là bắt buộc'),
  quantity: z.coerce.number().finite('Số lượng phải là số hợp lệ').min(0, 'Số lượng không được âm'),
  unitPrice: z.coerce.number().finite('Đơn giá phải là số hợp lệ').min(0, 'Đơn giá không được âm'),
  vatRate: z.coerce.number().finite('Thuế suất VAT phải là số').min(0, 'Thuế suất VAT từ 0 đến 100%').max(100, 'Thuế suất VAT từ 0 đến 100%'),
  parentId: z.preprocess(
    (value) => value === '' || value == null ? null : value,
    z.coerce.number().int().positive().nullable().optional(),
  ),
  bimId: optionalText(),
});

type FormData = z.infer<typeof schema>;

interface BoqFormProps {
  contractId: number;
  onClose: () => void;
}

export function BoqForm({ contractId, onClose }: BoqFormProps) {
  const createMutation = useCreateBoqItem(contractId);
  const { data: allItems } = useBoqItems(contractId);
  
  const parentCandidates = (allItems || []).filter(item => !item.parentId);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      vatRate: 10,
      parentId: null,
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        parentId: data.parentId ?? null,
        contractId
      });
      onClose();
    } catch (error) {
      console.error('Lỗi khi thêm BOQ:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <PlusIcon className="w-6 h-6 text-[var(--color-primary)]" />
          Thêm hạng mục công việc (BOQ)
        </h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Hạng mục cha (Tùy chọn)</label>
          <select
            {...register('parentId')}
            aria-describedby="boq-parent-help"
            className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
          >
            <option value="">Không có — tạo hạng mục gốc (cấp 1)</option>
            {parentCandidates.map(p => (
              <option key={p.id} value={p.id}>
                {p.itemCode} - {p.description}
              </option>
            ))}
          </select>
          <div id="boq-parent-help" className="mt-2 flex items-start gap-2 rounded-lg border border-[var(--color-primary)]/15 bg-[var(--color-primary-light)] px-3 py-2 text-xs leading-5 text-[var(--color-text-secondary)]">
            <InformationCircleIcon className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
            <p>{parentCandidates.length === 0
              ? 'Chưa có hạng mục cha. Giữ lựa chọn này để tạo hạng mục gốc đầu tiên; sau khi lưu, hạng mục đó sẽ xuất hiện để chọn làm cha.'
              : 'Nếu đây là hạng mục cấp 1, giữ lựa chọn “Không có”. Chỉ chọn hạng mục cha khi đang tạo công việc con.'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Mã hạng mục <span className="text-xs font-normal text-[var(--color-text-muted)]">(để trống để tự sinh)</span></label>
            <input 
              {...register('itemCode')}
              placeholder="Tự động: BOQ-2026-0001 hoặc nhập mã riêng"
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.itemCode && <p className="text-xs text-red-500 mt-1">{errors.itemCode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tên công việc / Mô tả <span className="text-red-500">*</span></label>
            <input 
              {...register('description')}
              placeholder="Tên hạng mục..."
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
            <input 
              {...register('unit')}
              placeholder="VD: m2, md, m3, cái, bộ..."
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Số lượng <span className="text-red-500">*</span></label>
            <input 
              type="number"
              step="any"
              min="0"
              {...register('quantity')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Đơn giá (VND) <span className="text-red-500">*</span></label>
            <input 
              type="number"
              min="0"
              step="1"
              {...register('unitPrice')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.unitPrice && <p className="text-xs text-red-500 mt-1">{errors.unitPrice.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Thuế VAT (%) <span className="text-red-500">*</span></label>
            <input 
              type="number"
              min="0"
              max="100"
              step="0.01"
              {...register('vatRate')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.vatRate && <p className="text-xs text-red-500 mt-1">{errors.vatRate.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Mã BIM (BIM ID - Liên kết mô hình 3D)</label>
          <input 
            {...register('bimId')}
            placeholder="VD: GUID-123-ABC"
            className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90 shadow-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {createMutation.isPending && (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            )}
            {createMutation.isPending ? "Đang lưu..." : "Lưu hạng mục"}
          </button>
        </div>
      </form>
    </div>
  );
}
