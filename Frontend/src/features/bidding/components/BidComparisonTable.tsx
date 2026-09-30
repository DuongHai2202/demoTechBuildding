import { useMemo } from 'react';
import { CheckCircleIcon, ClockIcon, DocumentIcon, InformationCircleIcon, TrophyIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useBidSubmissions, useUpdateSubmissionStatus } from '../api/biddingApi';
import { formatCurrency } from '../../../utils/formatCurrency';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import type { BidSubmission } from '../types/bidding.types';

interface Criterion {
  name: string;
  weight: number;
}

interface BidComparisonTableProps {
  packageId: number;
  budget?: number;
  criteria?: string;
  onAddSubmission?: () => void;
  canManage?: boolean;
}

function parseCriteria(criteria?: string): Criterion[] {
  if (!criteria) return [];
  try {
    const parsed = JSON.parse(criteria);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is Criterion => Boolean(item?.name) && Number.isFinite(Number(item?.weight))).map((item) => ({
          name: String(item.name),
          weight: Number(item.weight),
        }))
      : [];
  } catch {
    return [];
  }
}

function statusLabel(status: BidSubmission['status']) {
  if (status === 'ACCEPTED') return 'Được chọn';
  if (status === 'REJECTED') return 'Bị loại';
  return 'Chờ đánh giá';
}

function StatusPill({ status }: { status: BidSubmission['status'] }) {
  const config = status === 'ACCEPTED'
    ? { icon: CheckCircleIcon, className: 'bg-emerald-50 text-emerald-700', label: statusLabel(status) }
    : status === 'REJECTED'
      ? { icon: XCircleIcon, className: 'bg-rose-50 text-rose-700', label: statusLabel(status) }
      : { icon: ClockIcon, className: 'bg-amber-50 text-amber-700', label: statusLabel(status) };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${config.className}`}>
      <Icon className="h-3.5 w-3.5" /> {config.label}
    </span>
  );
}

export function BidComparisonTable({ packageId, budget, criteria: criteriaJson, onAddSubmission, canManage = false }: BidComparisonTableProps) {
  const { confirm } = useActionDialog();
  const { data: submissions = [], isLoading } = useBidSubmissions(packageId);
  const updateStatusMutation = useUpdateSubmissionStatus();
  const criteria = useMemo(() => parseCriteria(criteriaJson), [criteriaJson]);
  const priceWeight = criteria.find((criterion) => /giá|price/i.test(criterion.name))?.weight || 0;
  const sortedSubmissions = useMemo(() => [...submissions].sort((a, b) => a.bidPrice - b.bidPrice), [submissions]);
  const lowestPrice = sortedSubmissions[0]?.bidPrice || 0;
  const withinBudgetCount = budget && budget > 0 ? submissions.filter((submission) => submission.bidPrice <= budget).length : 0;

  const getPriceScore = (submission: BidSubmission) => {
    if (!lowestPrice || !priceWeight) return null;
    return Math.min(100, (lowestPrice / submission.bidPrice) * 100);
  };

  const handleSelectWinner = async (submission: BidSubmission) => {
    if (await confirm({
      title: 'Chọn nhà thầu trúng thầu',
      description: `Bạn có chắc muốn chọn ${submission.partnerName} làm nhà thầu trúng thầu? Các hồ sơ còn lại sẽ chuyển sang trạng thái bị loại và gói thầu sẽ đóng.`,
      confirmLabel: 'Xác nhận chọn',
      variant: 'warning',
    })) {
      updateStatusMutation.mutate({
        id: submission.id,
        status: 'ACCEPTED',
        notes: 'Được chọn làm nhà thầu trúng thầu sau khi đánh giá hồ sơ.',
      });
    }
  };

  if (isLoading) {
    return <div className="rounded-2xl border border-[var(--color-border)] p-10 text-center text-sm font-medium text-[var(--color-text-muted)]">Đang tải hồ sơ dự thầu...</div>;
  }

  if (sortedSubmissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--color-primary)]/30 bg-[var(--color-primary-light)]/20 p-10 text-center">
        <InformationCircleIcon className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
        <h4 className="mt-3 text-base font-bold text-[var(--color-text-primary)]">Chưa có hồ sơ dự thầu</h4>
        <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-[var(--color-text-muted)]">Bảng này dùng để đặt các nhà thầu cạnh nhau, so sánh giá với ngân sách, kiểm tra hồ sơ năng lực và ghi nhận quyết định lựa chọn.</p>
        {onAddSubmission && <button type="button" onClick={onAddSubmission} className="mt-5 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-white hover:opacity-90">Thêm hồ sơ đầu tiên</button>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 p-4">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">Số hồ sơ nhận được</p>
          <p className="mt-1 text-2xl font-black text-[var(--color-text-primary)]">{submissions.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 p-4">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">Giá thấp nhất</p>
          <p className="mt-1 text-lg font-black text-[var(--color-primary)]">{lowestPrice ? formatCurrency(lowestPrice) : '—'}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 p-4">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">Trong ngân sách</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{budget && budget > 0 ? `${withinBudgetCount}/${submissions.length}` : '—'}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 p-4">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">Cách chấm giá</p>
          <p className="mt-1 text-sm font-bold text-[var(--color-text-primary)]">{priceWeight ? `Giá chiếm ${priceWeight}%` : 'Chưa cấu hình'}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-5 text-sky-800">
        <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
        <p><strong>Điểm giá tham khảo</strong> chỉ phản ánh tương quan giá thấp nhất trong các hồ sơ. Điểm kỹ thuật, năng lực và tiến độ phải được tổ đánh giá xác nhận trước khi chọn trúng thầu.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/70">
              <tr>
                <th className="sticky left-0 z-10 min-w-[210px] bg-[var(--color-surface-alt)] px-5 py-4 text-xs font-black uppercase tracking-wider text-[var(--color-text-secondary)]">Tiêu chí so sánh</th>
                {sortedSubmissions.map((submission, index) => (
                  <th key={submission.id} className="min-w-[220px] px-5 py-4 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{submission.partnerName}</p>
                        <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">Xếp hạng giá #{index + 1}</p>
                      </div>
                      <StatusPill status={submission.status} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              <tr>
                <td className="sticky left-0 z-10 bg-[var(--color-surface-alt)]/80 px-5 py-4 font-semibold text-[var(--color-text-secondary)]">Giá chào thầu</td>
                {sortedSubmissions.map((submission) => {
                  const overBudget = Boolean(budget && budget > 0 && submission.bidPrice > budget);
                  return (
                    <td key={submission.id} className="px-5 py-4">
                      <p className="text-base font-black text-[var(--color-text-primary)]">{formatCurrency(submission.bidPrice)}</p>
                      <p className={`mt-1 text-xs font-bold ${overBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {budget && budget > 0 ? overBudget ? `Vượt ${formatCurrency(submission.bidPrice - budget)}` : `Thấp hơn ${formatCurrency(budget - submission.bidPrice)}` : 'Chưa có dự toán'}
                      </p>
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="sticky left-0 z-10 bg-[var(--color-surface-alt)]/80 px-5 py-4 font-semibold text-[var(--color-text-secondary)]">Điểm giá tham khảo</td>
                {sortedSubmissions.map((submission) => {
                  const score = getPriceScore(submission);
                  return <td key={submission.id} className="px-5 py-4 text-lg font-black text-[var(--color-primary)]">{score === null ? '—' : `${score.toFixed(1)}/100`}<span className="ml-1 text-xs font-medium text-[var(--color-text-muted)]">× {priceWeight}%</span></td>;
                })}
              </tr>
              {(criteria.filter((criterion) => !/giá|price/i.test(criterion.name)).length > 0
                ? criteria.filter((criterion) => !/giá|price/i.test(criterion.name))
                : [{ name: 'Kỹ thuật & năng lực', weight: 0 }]
              ).map((criterion) => (
                <tr key={criterion.name}>
                  <td className="sticky left-0 z-10 bg-[var(--color-surface-alt)]/80 px-5 py-4 font-semibold text-[var(--color-text-secondary)]">
                    <span>{criterion.name}</span>
                    {criterion.weight > 0 && <span className="ml-2 text-xs font-medium text-[var(--color-primary)]">{criterion.weight}%</span>}
                  </td>
                  {sortedSubmissions.map((submission) => (
                    <td key={submission.id} className="px-5 py-4 text-sm text-[var(--color-text-muted)]">
                      Chưa chấm điểm riêng
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="sticky left-0 z-10 bg-[var(--color-surface-alt)]/80 px-5 py-4 font-semibold text-[var(--color-text-secondary)]">Ghi chú / điều kiện</td>
                {sortedSubmissions.map((submission) => <td key={submission.id} className="px-5 py-4 text-sm leading-5 text-[var(--color-text-secondary)]">{submission.notes || 'Chưa ghi nhận điều kiện.'}</td>)}
              </tr>
              <tr>
                <td className="sticky left-0 z-10 bg-[var(--color-surface-alt)]/80 px-5 py-4 font-semibold text-[var(--color-text-secondary)]">Hồ sơ năng lực</td>
                {sortedSubmissions.map((submission) => (
                  <td key={submission.id} className="px-5 py-4">
                    {submission.proposalFileUrl ? <a href={submission.proposalFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-[var(--color-primary)] hover:underline"><DocumentIcon className="h-4 w-4" /> Mở hồ sơ</a> : <span className="text-sm text-amber-700">Thiếu hồ sơ</span>}
                  </td>
                ))}
              </tr>
            </tbody>
            <tfoot className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/50">
              <tr>
                <td className="sticky left-0 z-10 bg-[var(--color-surface-alt)]/80 px-5 py-5 font-bold text-[var(--color-text-primary)]">Quyết định</td>
                {sortedSubmissions.map((submission) => (
                  <td key={submission.id} className="px-5 py-5">
                    {submission.status === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"><TrophyIcon className="h-4 w-4" /> Đã trúng thầu</span>
                    ) : submission.status === 'REJECTED' ? (
                      <span className="text-xs font-semibold text-rose-700">Đã loại</span>
                    ) : canManage ? (
                      <button type="button" onClick={() => handleSelectWinner(submission)} disabled={updateStatusMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"><TrophyIcon className="h-4 w-4" /> Chọn trúng thầu</button>
                    ) : <span className="text-xs font-semibold text-[var(--color-text-muted)]">Chờ bên mời thầu đánh giá</span>}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
