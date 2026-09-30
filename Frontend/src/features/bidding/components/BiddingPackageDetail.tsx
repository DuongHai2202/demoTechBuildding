import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PlusIcon,
  ScaleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { BidComparisonTable } from './BidComparisonTable';
import { BidSubmissionForm } from './BidSubmissionForm';
import type { BiddingPackage, BiddingStatus } from '../types/bidding.types';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';
import { useProject } from '../../projects/api/projectApi';
import { useAuthStore } from '../../auth/stores/authStore';
import { hasPermission } from '../../auth/authorization';

interface BiddingPackageDetailProps {
  biddingPackage: BiddingPackage;
  onClose: () => void;
}

type Criterion = { name: string; weight: number };

const STATUS_META: Record<BiddingStatus, { label: string; className: string; dotClass: string }> = {
  DRAFT: { label: 'Bản nháp', className: 'bg-slate-100 text-slate-700', dotClass: 'bg-slate-400' },
  PENDING: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' },
  PUBLISHED: { label: 'Đã công bố', className: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' },
  OPEN: { label: 'Đang nhận hồ sơ', className: 'bg-sky-50 text-sky-700', dotClass: 'bg-sky-500' },
  BIDDING: { label: 'Đang đấu thầu', className: 'bg-sky-50 text-sky-700', dotClass: 'bg-sky-500' },
  INVITING: { label: 'Đang mời thầu', className: 'bg-sky-50 text-sky-700', dotClass: 'bg-sky-500' },
  EVALUATING: { label: 'Đang đánh giá', className: 'bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' },
  AWARDED: { label: 'Đã chọn nhà thầu', className: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' },
  CLOSED: { label: 'Đã đóng', className: 'bg-slate-100 text-slate-600', dotClass: 'bg-slate-400' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700', dotClass: 'bg-rose-500' },
};

const WORKFLOW_STEPS = [
  { label: 'Chuẩn bị', description: 'Tạo gói & tiêu chí' },
  { label: 'Mời thầu', description: 'Nhận hồ sơ' },
  { label: 'Đánh giá', description: 'So sánh & chấm' },
  { label: 'Kết quả', description: 'Chọn nhà thầu' },
];

const OPEN_STATUSES: BiddingStatus[] = ['PUBLISHED', 'OPEN', 'BIDDING', 'INVITING'];

export function BiddingPackageDetail({ biddingPackage, onClose }: BiddingPackageDetailProps) {
  const { data: project } = useProject(biddingPackage.projectId);
  const user = useAuthStore((state) => state.user);
  const canManageBidding = hasPermission(user, 'BIDDING_MANAGE');
  const canSubmitBid = hasPermission(user, 'BIDDING_READ');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const criteria = useMemo(() => parseCriteria(biddingPackage.criteria), [biddingPackage.criteria]);
  const workflowIndex = getWorkflowIndex(biddingPackage.status);
  const canReceiveSubmissions = OPEN_STATUSES.includes(biddingPackage.status);
  const projectName = project?.name || `Dự án #${biddingPackage.projectId}`;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--color-surface)]">
      <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="hidden shrink-0 rounded-2xl bg-[var(--color-primary-light)] p-3 sm:block">
              <ClipboardDocumentCheckIcon className="size-6 text-[var(--color-primary)]" />
            </div>
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                <span className="uppercase tracking-[0.14em] text-[var(--color-primary)]">Chi tiết gói thầu</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[var(--color-text-secondary)]">#{biddingPackage.packageCode || 'Chưa có mã'}</span>
                <StatusBadge status={biddingPackage.status} />
              </div>
              <h2 className="max-w-4xl text-lg font-extrabold leading-7 text-[var(--color-text-primary)] sm:text-2xl">
                {biddingPackage.packageName}
              </h2>
              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[var(--color-text-muted)] sm:text-sm">
                <BuildingOffice2Icon className="size-4 shrink-0" />
                {projectName}
                {project?.projectCode && <span>· {project.projectCode}</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-[var(--color-text-muted)] transition hover:bg-rose-50 hover:text-rose-600"
            aria-label="Đóng chi tiết gói thầu"
            title="Đóng (Esc)"
          >
            <XMarkIcon className="size-6" />
          </button>
        </div>

        <div className="px-4 pb-4 sm:px-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">Tiến trình gói thầu</p>
              <span className="text-xs font-semibold text-[var(--color-primary)]">Bước {workflowIndex + 1}/4</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {WORKFLOW_STEPS.map((step, index) => {
                const isCurrent = index === workflowIndex;
                const isCompleted = index < workflowIndex;
                return (
                  <div
                    key={step.label}
                    className={`rounded-lg border px-3 py-2.5 ${isCurrent ? 'border-blue-300 bg-blue-50' : 'border-transparent bg-[var(--color-surface)]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {isCompleted ? <CheckCircleIcon className="size-3.5" /> : index + 1}
                      </span>
                      <span className={`text-xs font-bold ${isCurrent ? 'text-blue-700' : 'text-[var(--color-text-secondary)]'}`}>{step.label}</span>
                    </div>
                    <p className="mt-1 pl-7 text-[11px] text-[var(--color-text-muted)]">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--color-bg)] p-4 sm:p-6">
        <div className="mx-auto max-w-6xl space-y-5">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SummaryCard icon={CurrencyDollarIcon} label="Ngân sách dự toán" value={biddingPackage.budget ? formatCurrency(biddingPackage.budget) : 'Chưa xác định'} tone="info" />
            <SummaryCard icon={CalendarDaysIcon} label="Hạn nộp hồ sơ" value={formatDate(biddingPackage.deadline)} tone="danger" />
            <SummaryCard icon={BuildingOffice2Icon} label="Dự án áp dụng" value={projectName} detail={project?.projectCode || `Mã hệ thống #${biddingPackage.projectId}`} tone="warning" />
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <InfoSection title="Mô tả chi tiết" accent="blue">
              <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
                {biddingPackage.description || 'Chưa có mô tả chi tiết cho gói thầu này.'}
              </p>
            </InfoSection>

            <InfoSection title="Tiêu chí lựa chọn" accent="emerald" trailing={criteria.length ? `${criteria.reduce((sum, item) => sum + item.weight, 0)}% tổng trọng số` : undefined}>
              {criteria.length > 0 ? (
                <div className="space-y-3">
                  {criteria.map((criterion) => (
                    <div key={criterion.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="font-semibold text-[var(--color-text-secondary)]">{criterion.name}</span>
                        <span className="font-bold text-[var(--color-primary)]">{criterion.weight}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${Math.min(100, Math.max(0, criterion.weight))}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">Chưa định nghĩa tiêu chí cụ thể.</p>
              )}
            </InfoSection>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ScaleIcon className="size-5 text-[var(--color-primary)]" />
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">Hồ sơ dự thầu & đánh giá</h3>
                  </div>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">
                    So sánh báo giá với ngân sách, kiểm tra hồ sơ năng lực và ghi nhận quyết định lựa chọn minh bạch.
                  </p>
                </div>
                {canReceiveSubmissions && canSubmitBid && (
                  <button
                    type="button"
                    onClick={() => setShowSubmissionForm((visible) => !visible)}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)]"
                  >
                    {showSubmissionForm ? <XMarkIcon className="size-4" /> : <PlusIcon className="size-4" />}
                    {showSubmissionForm ? 'Đóng biểu mẫu' : 'Thêm hồ sơ dự thầu'}
                  </button>
                )}
              </div>
            </div>

            {showSubmissionForm && canReceiveSubmissions && (
              <div className="border-b border-[var(--color-border)] bg-blue-50/40 p-4 sm:p-5">
                <BidSubmissionForm packageId={biddingPackage.id} onClose={() => setShowSubmissionForm(false)} />
              </div>
            )}

            <div className="p-4 sm:p-5">
              <BidComparisonTable
                packageId={biddingPackage.id}
                budget={biddingPackage.budget}
                criteria={biddingPackage.criteria}
                onAddSubmission={() => setShowSubmissionForm(true)}
                canManage={canManageBidding}
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:px-6">
        <div className="hidden items-center gap-2 text-xs text-[var(--color-text-muted)] sm:flex">
          <InformationCircleIcon className="size-4" />
          Dùng phím Esc để đóng cửa sổ chi tiết
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-alt)]"
        >
          Đóng
          <ArrowRightIcon className="size-4 rotate-180" />
        </button>
      </footer>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof CurrencyDollarIcon;
  label: string;
  value: string;
  detail?: string;
  tone: 'info' | 'danger' | 'warning';
}) {
  const toneClass = tone === 'info' ? 'bg-sky-50 text-sky-600' : tone === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600';

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)]">
      <div className={`shrink-0 rounded-xl p-2.5 ${toneClass}`}><Icon className="size-5" /></div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</p>
        <p className="mt-1 truncate text-base font-extrabold text-[var(--color-text-primary)]" title={value}>{value}</p>
        {detail && <p className="mt-1 truncate text-xs text-[var(--color-text-muted)]">{detail}</p>}
      </div>
    </div>
  );
}

function InfoSection({
  title,
  accent,
  trailing,
  children,
}: {
  title: string;
  accent: 'blue' | 'emerald';
  trailing?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
          <span className={`h-5 w-1 rounded-full ${accent === 'blue' ? 'bg-blue-600' : 'bg-emerald-500'}`} />
          {title}
        </h3>
        {trailing && <span className="text-xs font-semibold text-[var(--color-text-muted)]">{trailing}</span>}
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">{children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: BiddingStatus }) {
  const meta = STATUS_META[status] || STATUS_META.DRAFT;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold ${meta.className}`}>
      <span className={`size-1.5 rounded-full ${meta.dotClass}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function parseCriteria(criteria?: string): Criterion[] {
  if (!criteria) return [];

  try {
    const parsed = JSON.parse(criteria);
    return Array.isArray(parsed)
      ? parsed
        .filter((item) => Boolean(item?.name) && Number.isFinite(Number(item?.weight)))
        .map((item) => ({ name: String(item.name), weight: Number(item.weight) }))
      : [];
  } catch {
    return [];
  }
}

function getWorkflowIndex(status: BiddingStatus) {
  if (status === 'DRAFT' || status === 'PENDING') return 0;
  if (OPEN_STATUSES.includes(status)) return 1;
  if (status === 'EVALUATING') return 2;
  return 3;
}
