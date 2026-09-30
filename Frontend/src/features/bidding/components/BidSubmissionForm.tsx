import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { LinkIcon, PaperClipIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { usePartners } from '../../partners/api/partnerApi';
import { useSubmitBid } from '../api/biddingApi';
import { useAuthStore } from '../../auth/stores/authStore';

const schema = z.object({
  partnerId: z.coerce.number().int().min(1, 'Vui lòng chọn nhà thầu'),
  bidPrice: z.coerce.number().finite('Giá phải là số hợp lệ').min(0, 'Giá không được âm'),
  proposalFileUrl: z.string().trim().url('Liên kết hồ sơ không đúng định dạng').optional().or(z.literal('')),
  notes: z.string().trim().max(1000, 'Ghi chú tối đa 1.000 ký tự').optional(),
});

type FormValues = z.infer<typeof schema>;

interface BidSubmissionFormProps {
  packageId: number;
  onClose: () => void;
}

export function BidSubmissionForm({ packageId, onClose }: BidSubmissionFormProps) {
  const user = useAuthStore((state) => state.user);
  const isPartnerAccount = user?.roles?.includes('PARTNER') ?? false;
  const { data: partners = [], isLoading: isPartnersLoading } = usePartners({ enabled: !isPartnerAccount });
  const submitMutation = useSubmitBid();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      partnerId: user?.partnerId || 0,
      bidPrice: 0,
      proposalFileUrl: '',
      notes: '',
    },
  });

  const partnerOptions = isPartnerAccount
    ? (user?.partnerId
      ? [{ id: user.partnerId, name: user.fullName || user.username, partnerCode: 'Hồ sơ liên kết', status: 'ACTIVE' }]
      : [])
    : partners.filter((partner) => partner.status === 'ACTIVE');

  const onSubmit = (values: FormValues) => {
    submitMutation.mutate({
      packageId,
      partnerId: values.partnerId,
      bidPrice: values.bidPrice,
      proposalFileUrl: values.proposalFileUrl || undefined,
      notes: values.notes || undefined,
    }, { onSuccess: onClose });
  };

  return (
    <div className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/30 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--color-primary-light)] p-2.5 text-[var(--color-primary)]">
          <UserGroupIcon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-[var(--color-text-primary)]">Thêm hồ sơ dự thầu</h4>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Nhập dữ liệu để hệ thống đưa nhà thầu vào bảng so sánh. Điểm kỹ thuật vẫn cần tổ đánh giá xác nhận.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">Nhà thầu / đối tác <span className="text-rose-500">*</span></label>
          <select
            {...register('partnerId')}
            disabled={isPartnerAccount || isPartnersLoading || submitMutation.isPending}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
          >
            <option value={0}>-- Chọn nhà thầu --</option>
            {partnerOptions.map((partner) => (
              <option key={partner.id} value={partner.id}>{partner.name} · {partner.partnerCode}</option>
            ))}
          </select>
          {isPartnerAccount && !user?.partnerId && (
            <p className="mt-1 text-xs font-medium text-rose-600">Tài khoản chưa được liên kết với hồ sơ đối tác nên chưa thể nộp thầu.</p>
          )}
          {errors.partnerId && <p className="mt-1 text-xs font-medium text-rose-600">{errors.partnerId.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">Giá dự thầu (VNĐ) <span className="text-rose-500">*</span></label>
          <input
            {...register('bidPrice')}
            type="number"
            min="0"
            step="1"
            disabled={submitMutation.isPending}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
            placeholder="Nhập giá chào thầu"
          />
          {errors.bidPrice && <p className="mt-1 text-xs font-medium text-rose-600">{errors.bidPrice.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><LinkIcon className="h-4 w-4" /> Liên kết hồ sơ năng lực (tùy chọn)</label>
          <input
            {...register('proposalFileUrl')}
            type="url"
            disabled={submitMutation.isPending}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
            placeholder="https://..."
          />
          {errors.proposalFileUrl && <p className="mt-1 text-xs font-medium text-rose-600">{errors.proposalFileUrl.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-[var(--color-text-secondary)]"><PaperClipIcon className="h-4 w-4" /> Ghi chú / điều kiện thương mại</label>
          <textarea
            {...register('notes')}
            rows={3}
            disabled={submitMutation.isPending}
            className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
            placeholder="Tiến độ cung ứng, bảo hành, điều kiện thanh toán..."
          />
          {errors.notes && <p className="mt-1 text-xs font-medium text-rose-600">{errors.notes.message}</p>}
        </div>

        <div className="flex justify-end gap-3 md:col-span-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]">Hủy</button>
          <button type="submit" disabled={submitMutation.isPending || (isPartnerAccount && !user?.partnerId)} className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50">
            {submitMutation.isPending ? 'Đang lưu...' : 'Thêm vào bảng so sánh'}
          </button>
        </div>
      </form>
    </div>
  );
}
