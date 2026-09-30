import { useEffect, useState } from 'react';
import {
  CheckIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import { useUpdateContract } from '../api/contractApi';
import type { Contract } from '../types/contract.types';

const MAX_GUARANTEE_LENGTH = 5000;

interface GuaranteeInfoTabProps {
  contract: Contract;
  canManage: boolean;
}

export function GuaranteeInfoTab({ contract, canManage }: GuaranteeInfoTabProps) {
  const { confirm } = useActionDialog();
  const updateMutation = useUpdateContract();
  const [currentValue, setCurrentValue] = useState(contract.guaranteeInfo?.trim() || '');
  const [draft, setDraft] = useState(currentValue);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const nextValue = contract.guaranteeInfo?.trim() || '';
    setCurrentValue(nextValue);
    setDraft(nextValue);
    setIsEditing(false);
  }, [contract.id, contract.guaranteeInfo]);

  const persist = async (nextValue: string) => {
    const normalizedValue = nextValue.trim();
    if (normalizedValue.length > MAX_GUARANTEE_LENGTH) {
      toast.error(`Thông tin bảo lãnh không được vượt quá ${MAX_GUARANTEE_LENGTH} ký tự.`);
      return false;
    }

    const formData = new FormData();
    formData.append(
      'data',
      new Blob([
        JSON.stringify({
          projectId: contract.projectId,
          guaranteeInfo: normalizedValue,
        }),
      ], { type: 'application/json' }),
    );

    try {
      const updatedContract = await updateMutation.mutateAsync({ id: contract.id, formData });
      const savedValue = updatedContract.guaranteeInfo?.trim() || normalizedValue;
      setCurrentValue(savedValue);
      setDraft(savedValue);
      setIsEditing(false);
      toast.success(savedValue ? 'Đã lưu thông tin bảo lãnh.' : 'Đã xóa thông tin bảo lãnh.');
      return true;
    } catch {
      toast.error('Không thể cập nhật thông tin bảo lãnh. Vui lòng thử lại.');
      return false;
    }
  };

  const handleDelete = async () => {
    if (!currentValue) return;
    const confirmed = await confirm({
      title: 'Xóa thông tin bảo lãnh',
      description: 'Thông tin bảo lãnh sẽ bị xóa khỏi hợp đồng. Bạn có chắc muốn tiếp tục?',
      confirmLabel: 'Xóa thông tin',
      variant: 'danger',
    });
    if (!confirmed) return;

    await persist('');
  };

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-6 py-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Thông tin bảo lãnh hợp đồng</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Bổ sung hoặc cập nhật sau khi hợp đồng đã được tạo.
          </p>
        </div>
        {canManage && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setDraft(currentValue);
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {currentValue ? <PencilSquareIcon className="size-4" /> : <PlusIcon className="size-4" />}
            {currentValue ? 'Chỉnh sửa' : 'Thêm thông tin'}
          </button>
        )}
      </div>

      <div className="p-6">
        {isEditing ? (
          <div className="space-y-3">
            <label htmlFor="contract-guarantee-info" className="block text-sm font-semibold text-[var(--color-text-secondary)]">
              Nội dung bảo lãnh <span className="font-normal text-[var(--color-text-muted)]">(có thể để trống để xóa)</span>
            </label>
            <textarea
              id="contract-guarantee-info"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={MAX_GUARANTEE_LENGTH}
              rows={5}
              placeholder="Ví dụ: Bảo lãnh thực hiện hợp đồng 10%, ngân hàng..., hiệu lực đến..."
              className="w-full resize-y rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-3 text-sm leading-6 text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-primary-500/10"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[var(--color-text-muted)]">
                {draft.length.toLocaleString('vi-VN')}/{MAX_GUARANTEE_LENGTH.toLocaleString('vi-VN')} ký tự
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(currentValue);
                    setIsEditing(false);
                  }}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3.5 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
                >
                  <XMarkIcon className="size-4" /> Hủy
                </button>
                <button
                  type="button"
                  onClick={() => persist(draft)}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckIcon className="size-4" />
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </div>
          </div>
        ) : currentValue ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/60 px-4 py-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">{currentValue}</p>
            </div>
            {canManage && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3.5 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                >
                  <TrashIcon className="size-4" /> Xóa thông tin
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 px-4 py-8 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">Chưa có thông tin bảo lãnh được thiết lập cho hợp đồng này.</p>
            {canManage && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--color-primary)] px-3.5 py-2 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]"
              >
                <PlusIcon className="size-4" /> Thêm thông tin bảo lãnh
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
