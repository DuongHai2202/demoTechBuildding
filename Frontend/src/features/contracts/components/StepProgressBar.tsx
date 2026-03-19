import { CheckCircleIcon } from '@heroicons/react/24/solid';

const WORKFLOW_STEPS = [
  { step: 1, label: 'Lập kế hoạch' },
  { step: 2, label: 'Gửi báo giá' },
  { step: 3, label: 'Thương thảo hợp đồng' },
  { step: 4, label: 'Ký hợp đồng' },
  { step: 5, label: 'Tạm ứng thực hiện hợp đồng' },
  { step: 6, label: 'Thanh toán giai đoạn' },
  { step: 7, label: 'Quyết toán' },
];

interface StepProgressBarProps {
  currentStep: number; // 1-7
}

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
    <div className="flex items-center justify-between w-full py-4 px-2">
      {WORKFLOW_STEPS.map((ws, idx) => {
        const isCompleted = ws.step < currentStep;
        const isCurrent = ws.step === currentStep;
        const isLast = idx === WORKFLOW_STEPS.length - 1;

        return (
          <div key={ws.step} className="flex items-center flex-1 last:flex-none">
            {/* Step Circle */}
            <div className="flex flex-col items-center relative">
              <div
                className={`flex items-center justify-center size-8 rounded-full border-2 text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                    : isCurrent
                    ? 'bg-white border-[var(--color-primary)] text-[var(--color-primary)] ring-4 ring-[var(--color-primary-light)]'
                    : 'bg-[var(--color-surface-alt)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircleIcon className="size-5" />
                ) : (
                  ws.step
                )}
              </div>
              <span
                className={`mt-2 text-[10px] text-center leading-tight max-w-[80px] ${
                  isCompleted || isCurrent
                    ? 'text-[var(--color-primary)] font-medium'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                {ws.label}
              </span>
            </div>

            {/* Line connector */}
            {!isLast && (
              <div className="flex-1 mx-1">
                <div
                  className={`h-0.5 w-full ${
                    isCompleted
                      ? 'bg-[var(--color-primary)]'
                      : 'bg-[var(--color-border)]'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
