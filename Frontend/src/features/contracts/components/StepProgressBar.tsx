import { CheckCircleIcon } from '@heroicons/react/24/solid';
import type { ContractWorkflowStepDefinition } from '../types/contract.types';

export const CONTRACT_WORKFLOW_STEPS: ContractWorkflowStepDefinition[] = [
  { step: 1, label: 'Lập kế hoạch', description: 'Chuẩn bị phạm vi, ngân sách và hồ sơ đầu vào.', owner: 'Chủ đầu tư / PM', requirement: 'Có dự án và phạm vi công việc.' },
  { step: 2, label: 'Mời báo giá', description: 'Phát hành hồ sơ và tiếp nhận báo giá từ nhà thầu.', owner: 'Bộ phận đấu thầu', requirement: 'Có ngân sách, tiêu chí và hạn nộp hồ sơ.' },
  { step: 3, label: 'Đánh giá & thương thảo', description: 'So sánh giá, năng lực, kỹ thuật và điều kiện thương mại.', owner: 'Tổ đánh giá', requirement: 'Có hồ sơ dự thầu để so sánh.' },
  { step: 4, label: 'Ký hợp đồng', description: 'Chốt điều khoản, phê duyệt và ký kết hợp đồng.', owner: 'Pháp chế / Người có thẩm quyền', requirement: 'Điều khoản cuối cùng đã được duyệt.' },
  { step: 5, label: 'Tạm ứng / Khởi công', description: 'Kiểm tra bảo lãnh và kích hoạt thực hiện hợp đồng.', owner: 'PM / Tài chính', requirement: 'Có ngày ký và hồ sơ bảo lãnh phù hợp.' },
  { step: 6, label: 'Thanh toán giai đoạn', description: 'Theo dõi nghiệm thu, khối lượng và từng đợt thanh toán.', owner: 'PM / Tài chính', requirement: 'Có ngày bắt đầu và hồ sơ nghiệm thu.' },
  { step: 7, label: 'Quyết toán & đóng', description: 'Đối chiếu giá trị cuối cùng, bảo hành và đóng hợp đồng.', owner: 'PM / Tài chính / Pháp chế', requirement: 'Có ngày kết thúc và biên bản quyết toán.' },
];

interface StepProgressBarProps {
  currentStep: number; // 1-7
}

export function StepProgressBar({ currentStep }: StepProgressBarProps) {
  return (
    <div className="flex items-center justify-between w-full py-4 px-2">
      {CONTRACT_WORKFLOW_STEPS.map((ws, idx) => {
        const isCompleted = ws.step < currentStep;
        const isCurrent = ws.step === currentStep;
        const isLast = idx === CONTRACT_WORKFLOW_STEPS.length - 1;

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
