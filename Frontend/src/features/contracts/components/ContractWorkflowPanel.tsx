import { useMemo } from 'react';
import {
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import { formatDateTime } from '../../../utils/formatDate';
import {
  useContractWorkflowHistory,
  useTransitionContractWorkflow,
} from '../api/contractApi';
import { CONTRACT_WORKFLOW_STEPS } from './StepProgressBar';
import type { Contract } from '../types/contract.types';

interface ContractWorkflowPanelProps {
  contract: Contract;
}

export function ContractWorkflowPanel({ contract }: ContractWorkflowPanelProps) {
  const { prompt } = useActionDialog();
  const { data: history = [], isLoading: isHistoryLoading } = useContractWorkflowHistory(contract.id);
  const transitionMutation = useTransitionContractWorkflow();
  const currentStep = Math.min(Math.max(contract.workflowStep || 1, 1), CONTRACT_WORKFLOW_STEPS.length);
  const currentDefinition = CONTRACT_WORKFLOW_STEPS[currentStep - 1];
  const nextDefinition = CONTRACT_WORKFLOW_STEPS[currentStep];
  const canAdvance = Boolean(nextDefinition) && !transitionMutation.isPending;
  const canReturn = currentStep > 1 && !transitionMutation.isPending;

  const recentHistory = useMemo(() => history.slice(0, 5), [history]);

  const moveWorkflow = async (targetStep: number, returning = false) => {
    const note = await prompt({
      title: returning ? 'Trả lại bước xử lý' : 'Chuyển bước quy trình',
      description: returning
        ? `Hợp đồng sẽ quay lại bước ${targetStep}. Hãy ghi rõ lý do để người phụ trách biết phần cần bổ sung.`
        : `Xác nhận chuyển hợp đồng sang bước ${targetStep}: ${CONTRACT_WORKFLOW_STEPS[targetStep - 1].label}.`,
      inputLabel: returning ? 'Lý do trả lại' : 'Ghi chú xử lý',
      placeholder: returning ? 'Ví dụ: Bổ sung biên bản thương thảo...' : 'Có thể ghi chú người phụ trách hoặc hồ sơ cần theo dõi...',
      required: returning,
      multiline: true,
      confirmLabel: returning ? 'Trả lại bước' : 'Chuyển bước',
      variant: returning ? 'warning' : 'success',
    });

    if (note === null) return;
    transitionMutation.mutate({ contractId: contract.id, targetStep, note: note || undefined });
  };

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-theme)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Điều phối quy trình hợp đồng</h2>
          </div>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
            Mỗi lần chuyển bước đều được ghi lịch sử. Hệ thống không cho bỏ qua bước; khi trả lại phải có lý do.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-bold text-[var(--color-primary)]">
          <ClockIcon className="h-4 w-4" /> Bước {currentStep}/{CONTRACT_WORKFLOW_STEPS.length}
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Đang xử lý</p>
          <h3 className="mt-1 text-base font-bold text-[var(--color-text-primary)]">{currentDefinition.label}</h3>
          <p className="mt-1 text-sm leading-5 text-[var(--color-text-secondary)]">{currentDefinition.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1">Phụ trách: {currentDefinition.owner}</span>
            <span className="rounded-full bg-[var(--color-surface)] px-2.5 py-1">Điều kiện: {currentDefinition.requirement}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {canAdvance && (
              <button
                type="button"
                onClick={() => moveWorkflow(currentStep + 1)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                disabled={transitionMutation.isPending}
              >
                <ArrowPathIcon className="h-4 w-4" />
                Sang bước {currentStep + 1}: {nextDefinition.label}
              </button>
            )}
            {canReturn && (
              <button
                type="button"
                onClick={() => moveWorkflow(currentStep - 1, true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-amber-300 hover:text-amber-700 disabled:opacity-50"
                disabled={transitionMutation.isPending}
              >
                <ArrowUturnLeftIcon className="h-4 w-4" /> Trả lại bước trước
              </button>
            )}
            {!nextDefinition && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
                <LockClosedIcon className="h-4 w-4" /> Đã hoàn tất quy trình
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Các bước tiếp theo</p>
          <div className="mt-3 space-y-2">
            {CONTRACT_WORKFLOW_STEPS.slice(currentStep).map((step) => (
              <div key={step.step} className="flex items-start gap-3 rounded-lg bg-[var(--color-surface)] px-3 py-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-muted)]">{step.step}</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{step.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{step.requirement}</p>
                </div>
              </div>
            ))}
            {!nextDefinition && <p className="text-sm text-[var(--color-text-muted)]">Không còn bước nào cần xử lý.</p>}
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--color-border)] pt-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Lịch sử chuyển bước</h3>
          <span className="text-xs text-[var(--color-text-muted)]">{history.length} lần ghi nhận</span>
        </div>
        {isHistoryLoading ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">Đang tải lịch sử...</p>
        ) : recentHistory.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">Chưa có lịch sử.</p>
        ) : (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {recentHistory.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 p-3">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {item.action === 'INITIAL' ? 'Khởi tạo' : item.action === 'RETURN' ? 'Trả lại bước' : 'Chuyển bước'}
                    {item.fromStep ? ` · ${item.fromStep} → ${item.toStep}` : ` · Bước ${item.toStep}`}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{item.changedBy} · {formatDateTime(item.createdAt)}</p>
                  {item.note && <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
