import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateContract, useContracts } from '../api/contractApi';
import { useProjects } from '../../projects/api/projectApi';
import { usePartners } from '../../partners/api/partnerApi';
import { DocumentPlusIcon, XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  projectId: z.coerce.number().min(1, 'Vui lòng chọn dự án'),
  contractNumber: z.string().min(3, 'Số hiệu quá ngắn'),
  contractName: z.string().min(5, 'Tên hợp đồng phải trên 5 ký tự'),
  partnerId: z.coerce.number().optional(),
  partnerName: z.string().optional(),
  contractValue: z.coerce.number().min(0, 'Giá trị không hợp lệ'),
  status: z.string().default('ACTIVE'),
  type: z.enum(['MAIN', 'ADDENDUM']).default('MAIN'),
  parentId: z.coerce.number().optional(),
  workflowStep: z.coerce.number().min(1).max(7).default(1),
  guaranteeInfo: z.string().optional(),
  signedDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ContractFormProps {
  initialProjectId?: number;
  onClose: () => void;
}

export function ContractForm({ initialProjectId, onClose }: ContractFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const createMutation = useCreateContract();
  const { data: projects } = useProjects();
  const { data: partners } = usePartners();
  const { data: allContracts } = useContracts();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      projectId: initialProjectId,
      type: 'MAIN',
      status: 'ACTIVE',
      workflowStep: 1,
    }
  });

  const selectedType = watch('type');
  const selectedProjectId = watch('projectId');
  const contractsFiltered = allContracts?.filter(c => c.projectId === Number(selectedProjectId) && c.type === 'MAIN');

  const onSubmit = async (data: any) => {
    const validatedData = data as FormData;
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(validatedData)], { type: 'application/json' }));
    
    if (file) {
      formData.append('file', file);
    }

    try {
      await createMutation.mutateAsync({ formData });
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu hợp đồng:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <DocumentPlusIcon className="w-6 h-6 text-[var(--color-primary)]" />
          Thêm hợp đồng mới
        </h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!initialProjectId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Dự án <span className="text-red-500">*</span></label>
            <select
              {...register('projectId')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            >
              <option value="">-- Chọn dự án --</option>
              {projects?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.projectId && <p className="text-xs text-red-500 mt-1">{errors.projectId.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Loại hợp đồng</label>
            <select
              {...register('type')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            >
              <option value="MAIN">Hợp đồng gốc</option>
              <option value="ADDENDUM">Phụ lục hợp đồng</option>
            </select>
          </div>
          {selectedType === 'ADDENDUM' && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Thuộc hợp đồng gốc <span className="text-red-500">*</span></label>
              <select
                {...register('parentId')}
                className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
              >
                <option value="">-- Chọn hợp đồng gốc --</option>
                {contractsFiltered?.map(c => (
                  <option key={c.id} value={c.id}>{c.contractNumber} - {c.contractName}</option>
                ))}
              </select>
              {errors.parentId && <p className="text-xs text-red-500 mt-1">{errors.parentId.message}</p>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Số hiệu <span className="text-red-500">*</span></label>
            <input 
              {...register('contractNumber')}
              placeholder="ví dụ: HD-2024-001"
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.contractNumber && <p className="text-xs text-red-500 mt-1">{errors.contractNumber.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Trạng thái</label>
            <select
              {...register('status')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            >
              <option value="ACTIVE">Đang hiệu lực</option>
              <option value="PENDING">Đang chờ</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="TERMINATED">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tên hợp đồng <span className="text-red-500">*</span></label>
            <input 
              {...register('contractName')}
              placeholder="Tên đầy đủ của hợp đồng..."
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.contractName && <p className="text-xs text-red-500 mt-1">{errors.contractName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Đối tác / Nhà cung cấp <span className="text-red-500">*</span></label>
            <select
              {...register('partnerId')}
              onChange={(e) => {
                const partner = partners?.find(p => p.id === Number(e.target.value));
                if (partner) setValue('partnerName', partner.name);
              }}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            >
              <option value="">-- Chọn đối tác --</option>
              {partners?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.partnerId && <p className="text-xs text-red-500 mt-1">{errors.partnerId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Ngày ký</label>
            <input 
              type="date"
              {...register('signedDate')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Ngày bắt đầu</label>
            <input 
              type="date"
              {...register('startDate')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Ngày kết thúc</label>
            <input 
              type="date"
              {...register('endDate')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Giá trị hợp đồng (VND)</label>
            <input 
              type="number"
              {...register('contractValue')}
              placeholder="0"
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
            {errors.contractValue && <p className="text-xs text-red-500 mt-1">{errors.contractValue.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Bước quy trình</label>
            <select
              {...register('workflowStep')}
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            >
              <option value={1}>1. Lập kế hoạch</option>
              <option value={2}>2. Gửi báo giá</option>
              <option value={3}>3. Thương thảo hợp đồng</option>
              <option value={4}>4. Ký hợp đồng</option>
              <option value={5}>5. Tạm ứng thực hiện</option>
              <option value={6}>6. Thanh toán giai đoạn</option>
              <option value={7}>7. Quyết toán</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Thông tin bảo lãnh</label>
          <textarea
            {...register('guaranteeInfo')}
            placeholder="Nhập thông tin bảo lãnh (nếu có)..."
            rows={2}
            className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all resize-none"
          />
        </div>

        <div className="p-6 border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-bg)] transition-colors group">
          <label className="flex flex-col items-center justify-center cursor-pointer text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
            <PaperClipIcon className="w-8 h-8 mb-3" />
            <span className="text-sm font-medium text-[var(--color-text-primary)] text-center">
              {file ? file.name : "Tải lên bản scan hợp đồng (PDF, Image)"}
            </span>
            <span className="text-xs mt-1">Hỗ trợ .pdf, .jpg, .png</span>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </label>
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
            {createMutation.isPending ? "Đang lưu..." : "Lưu Hợp đồng"}
          </button>
        </div>
      </form>
    </div>
  );
}
