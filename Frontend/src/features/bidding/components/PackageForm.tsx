import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCreateBiddingPackage } from '../api/biddingApi';
import { useProjects } from '../../projects/api/projectApi';

import type { BiddingStatus } from '../types/bidding.types';
import { optionalCode, optionalText, requiredText } from '../../../utils/validation';

const schema = z.object({
  projectId: z.number().min(1, 'Vui lòng chọn dự án'),
  packageCode: optionalCode(),
  packageName: requiredText('Tên gói thầu phải có ít nhất 3 ký tự', 3),
  description: optionalText(),
  budget: z.preprocess((val) => (val === '' || val === undefined ? undefined : Number(val)), z.number().finite('Ngân sách phải là số hợp lệ').min(0, 'Ngân sách không được âm').optional()),
  deadline: z.string().min(1, 'Hạn nộp là bắt buộc').refine((value) => !Number.isNaN(new Date(value).getTime()), 'Hạn nộp không đúng định dạng'),
  criteria: z.array(z.object({
    name: requiredText('Tên tiêu chí phải có ít nhất 2 ký tự', 2),
    weight: z.number().finite('Trọng số phải là số').min(0, 'Trọng số từ 0 đến 100').max(100, 'Trọng số từ 0 đến 100')
  })).min(1, 'Vui lòng thêm ít nhất một tiêu chí'),
}).superRefine((data, context) => {
  const totalWeight = data.criteria.reduce((total, criterion) => total + criterion.weight, 0);
  if (totalWeight !== 100) {
    context.addIssue({ code: 'custom', path: ['criteria'], message: 'Tổng trọng số của các tiêu chí phải bằng 100%' });
  }
});

type FormValues = z.infer<typeof schema>;

export function PackageForm({ 
  projectId: initialProjectId, 
  onClose 
}: { 
  projectId?: number, 
  onClose: () => void 
}) {
  const createPackage = useCreateBiddingPackage();
  const { data: projects } = useProjects();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      projectId: initialProjectId || undefined,
      packageCode: '',
      packageName: '',
      description: '',
      budget: undefined,
      deadline: '',
      criteria: [
        { name: 'Giá chào thầu', weight: 60 },
        { name: 'Năng lực kỹ thuật', weight: 40 }
      ]
    }
  });

  const { register, handleSubmit, control, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'criteria'
  });

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      criteria: JSON.stringify(data.criteria),
      status: 'PUBLISHED' as BiddingStatus
    };
    
    createPackage.mutate(payload as any, {
      onSuccess: () => onClose()
    });
  };

  const totalWeight = fields.reduce((sum, _, i) => sum + (form.getValues(`criteria.${i}.weight` as any) || 0), 0);

  return (
    <div className="animate-in fade-in duration-500">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Project Selection (only if not provided) */}
        {!initialProjectId && (
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block ml-1">Dự án áp dụng <span className="text-rose-500">*</span></label>
            <select 
              {...register('projectId', { valueAsNumber: true })}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Chọn dự án --</option>
              {projects?.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.projectCode})</option>
              ))}
            </select>
            {errors.projectId && <p className="text-[10px] text-[var(--color-danger)] font-bold ml-1">{errors.projectId.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block ml-1">Mã gói thầu <span className="font-normal normal-case">(để trống để tự sinh)</span></label>
            <input 
              {...register('packageCode')}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
              placeholder="Tự động: GTH-2026-0001 hoặc nhập mã riêng"
            />
            {errors.packageCode && <p className="text-[10px] text-[var(--color-danger)] font-bold ml-1">{errors.packageCode.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block ml-1">Tên gói thầu <span className="text-rose-500">*</span></label>
            <input 
              {...register('packageName')}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border(--color-primary)] transition-all"
              placeholder="Vd: Thi công móng & hầm"
            />
            {errors.packageName && <p className="text-[10px] text-[var(--color-danger)] font-bold ml-1">{errors.packageName.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block ml-1">Mô tả công việc</label>
          <textarea 
            {...register('description')}
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none"
            placeholder="Nội dung, phạm vi chi tiết..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block ml-1">Ngân sách dự toán (VNĐ)</label>
            <input 
              {...register('budget')}
              type="number"
              min="0"
              step="1"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all font-mono font-bold"
              placeholder="0"
            />
            {errors.budget && <p className="text-[10px] text-[var(--color-danger)] font-bold ml-1">{errors.budget.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block ml-1">Hạn nộp hồ sơ <span className="text-rose-500">*</span></label>
            <input 
              {...register('deadline')}
              type="datetime-local"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
            />
            {errors.deadline && <p className="text-[10px] text-[var(--color-danger)] font-bold ml-1">{errors.deadline.message}</p>}
          </div>
        </div>

        <div className="space-y-4 border-t border-[var(--color-border)] pt-5 text-left">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block ml-1">Tiêu chí đánh giá & Trọng số</label>
            <button 
              type="button"
              onClick={() => append({ name: '', weight: 0 })}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <PlusIcon className="size-3.5" /> Thêm tiêu chí
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                <div className="flex-1">
                  <input 
                    {...register(`criteria.${index}.name`)}
                    placeholder="Tên tiêu chí (vd: Giá, Tiến độ...)"
                    className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                  {errors.criteria?.[index]?.name && <p className="text-[10px] text-[var(--color-danger)] font-bold mt-1">{errors.criteria[index]?.name?.message}</p>}
                </div>
                <div className="w-24">
                  <div className="relative">
                    <input 
                      {...register(`criteria.${index}.weight`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="%"
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-3 pr-7 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all text-right font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--color-text-muted)] font-bold">%</span>
                  </div>
                  {errors.criteria?.[index]?.weight && <p className="text-[10px] text-[var(--color-danger)] font-bold mt-1">{errors.criteria[index]?.weight?.message}</p>}
                </div>
                <button 
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded-xl transition-all active:scale-90"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <div className={`mt-2 text-[10px] font-bold px-3 py-1.5 rounded-lg w-fit ${totalWeight === 100 ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`}>
            Tổng trọng số: {totalWeight}% {totalWeight !== 100 && '(Phải bằng 100%)'}
          </div>
          {errors.criteria && <p className="text-[10px] text-[var(--color-danger)] font-bold">{errors.criteria.message}</p>}
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
            disabled={createPackage.isPending || totalWeight !== 100}
            className="btn-primary px-8"
          >
            {createPackage.isPending ? 'Đang xử lý...' : 'Xác nhận tạo gói thầu'}
          </button>
        </div>
      </form>
    </div>
  );
}
