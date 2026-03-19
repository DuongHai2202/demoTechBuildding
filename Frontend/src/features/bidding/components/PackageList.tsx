import { PlusIcon, EyeIcon, ChartBarIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { useBiddingPackages } from '../api/biddingApi';
import type { BiddingPackage } from '../types/bidding.types';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';

interface PackageListProps {
  projectId: number;
  onSelect: (pkg: BiddingPackage) => void;
  onCompare: (pkg: BiddingPackage) => void;
  onCreate: () => void;
}

export function PackageList({ projectId, onSelect, onCompare, onCreate }: PackageListProps) {
  const { data: packages, isLoading } = useBiddingPackages(projectId);

  if (isLoading) return <div className="p-8 text-center text-[var(--color-text-muted)]">Đang tải danh sách...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Gói thầu & Mời thầu</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Quản lý quy trình đấu thầu và lựa chọn nhà thầu</p>
        </div>
        <button 
          onClick={onCreate}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-all active:scale-95"
        >
          <PlusIcon className="size-5" />
          Tạo gói thầu mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages?.map((pkg) => (
          <div 
            key={pkg.id} 
            onClick={() => onSelect(pkg)}
            className="group relative flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition-all hover:border-[var(--color-primary)] hover:shadow-md cursor-pointer active:scale-[0.99]"
          >
            <div className="mb-4 flex items-start justify-between">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${getStatusStyles(pkg.status)}`}>
                {pkg.status}
              </span>
              <span className="text-[10px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-tight">#{pkg.packageCode}</span>
            </div>

            <h3 className="mb-2 line-clamp-1 text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
              {pkg.packageName}
            </h3>
            
            <p className="mb-4 line-clamp-2 text-xs text-[var(--color-text-muted)] min-h-[2.5rem]">
              {pkg.description || 'Không có mô tả cho gói thầu này.'}
            </p>

            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <TagIcon className="size-3.5" />
                  <span>Ngân sách:</span>
                </div>
                <span className="font-bold text-[var(--color-text-primary)]">{pkg.budget ? formatCurrency(pkg.budget) : 'Chưa định mức'}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                  <CalendarIcon className="size-3.5" />
                  <span>Hạn nộp:</span>
                </div>
                <span className="font-medium text-[var(--color-danger)]">{formatDate(pkg.deadline)}</span>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-[var(--color-border)] mt-4">
                <button 
                  onClick={() => onSelect(pkg)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-2.5 text-xs font-black text-white hover:bg-[var(--color-primary-hover)] shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <EyeIcon className="size-4" />
                  Chi tiết
                </button>
                <button 
                  onClick={() => onCompare(pkg)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-light)] py-2.5 text-xs font-black text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all active:scale-95 cursor-pointer border border-[var(--color-primary)]/10"
                >
                  <ChartBarIcon className="size-4" />
                  So sánh thầu
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {packages?.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg)] py-20">
          <div className="mb-4 rounded-full bg-[var(--color-surface)] p-4 shadow-sm">
            <PlusIcon className="size-8 text-[var(--color-text-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--color-text-muted)]">Chưa có gói thầu nào được tạo cho dự án này.</p>
        </div>
      )}
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'PUBLISHED': return 'bg-[var(--color-success-bg)] text-[var(--color-success)] ring-[var(--color-success)]/20';
    case 'INVITING': return 'bg-[var(--color-info-bg)] text-[var(--color-info)] ring-[var(--color-info)]/20';
    case 'EVALUATING': return 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-[var(--color-warning)]/20';
    case 'CLOSED': return 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] ring-[var(--color-border)]/20';
    case 'CANCELLED': return 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] ring-[var(--color-danger)]/20';
    default: return 'bg-[var(--color-surface-alt)] text-[var(--color-text-disabled)] ring-[var(--color-border)]/20';
  }
}
