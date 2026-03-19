import React from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  CurrencyDollarIcon, 
  InformationCircleIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { BidComparisonTable } from './BidComparisonTable';
import type { BiddingPackage } from '../types/bidding.types';
import { formatCurrency } from '../../../utils/formatCurrency';
import { formatDate } from '../../../utils/formatDate';

interface BiddingPackageDetailProps {
  biddingPackage: BiddingPackage;
  onClose: () => void;
}

export function BiddingPackageDetail({ biddingPackage, onClose }: BiddingPackageDetailProps) {
  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)] overflow-hidden rounded-3xl shadow-[var(--shadow-modal-theme)] animate-in zoom-in-95 duration-300 border border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-primary-light)] rounded-2xl">
            <ClipboardDocumentCheckIcon className="size-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[var(--color-text-primary)] uppercase tracking-tight">
              Chi tiết gói thầu: {biddingPackage.packageName}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-2 py-0.5 rounded">
                #{biddingPackage.packageCode}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                biddingPackage.status === 'PUBLISHED' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
                biddingPackage.status === 'CLOSED' ? 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]' :
                'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
              }`}>
                {biddingPackage.status}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] text-[var(--color-text-muted)] transition-all active:scale-90"
        >
          <XMarkIcon className="size-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Basic Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 flex items-start gap-4">
            <div className="p-2.5 bg-[var(--color-info-bg)] rounded-xl">
              <CurrencyDollarIcon className="size-5 text-[var(--color-info)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Ngân sách dự toán</p>
              <p className="text-lg font-black text-[var(--color-text-primary)]">
                {biddingPackage.budget ? formatCurrency(biddingPackage.budget) : 'N/A'}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 flex items-start gap-4">
            <div className="p-2.5 bg-[var(--color-danger-bg)] rounded-xl">
              <CalendarIcon className="size-5 text-[var(--color-danger)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Hạn nộp hồ sơ</p>
              <p className="text-lg font-black text-[var(--color-text-primary)]">
                {formatDate(biddingPackage.deadline)}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/50 flex items-start gap-4">
            <div className="p-2.5 bg-[var(--color-warning-bg)] rounded-xl">
              <InformationCircleIcon className="size-5 text-[var(--color-warning)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">Dự án</p>
              <p className="text-lg font-black text-[var(--color-text-primary)]">
                Dự án ID: {biddingPackage.projectId}
              </p>
            </div>
          </div>
        </div>

        {/* Description & Criteria */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <div className="w-1 h-4 bg-[var(--color-primary)] rounded-full"></div>
              Mô tả chi tiết
            </h3>
            <div className="p-4 rounded-2xl bg-[var(--color-surface-alt)]/50 border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
              {biddingPackage.description || 'Chưa có mô tả chi tiết cho gói thầu này.'}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <div className="w-1 h-4 bg-[var(--color-success)] rounded-full"></div>
              Tiêu chí lựa chọn
            </h3>
            <div className="p-4 rounded-2xl bg-[var(--color-surface-alt)]/50 border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {(() => {
                if (!biddingPackage.criteria) return 'Chưa định nghĩa tiêu chí cụ thể.';
                try {
                  const criteriaList = JSON.parse(biddingPackage.criteria);
                  if (Array.isArray(criteriaList)) {
                    return (
                      <div className="space-y-3">
                        {criteriaList.map((c: any, i: number) => (
                          <div key={i} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-[var(--color-text-primary)]">{c.name}</span>
                              <span className="font-mono text-[var(--color-primary)] font-black">{c.weight}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${c.weight}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                } catch (e) {
                  // Fallback to plain text if not JSON
                  return biddingPackage.criteria;
                }
                return biddingPackage.criteria;
              })()}
            </div>
          </div>
        </div>

        {/* Submissions Comparison Table */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2 uppercase tracking-wide">
              Bảng so sánh báo giá & Hồ sơ năng lực
            </h3>
          </div>
          <BidComparisonTable 
            packageId={biddingPackage.id} 
            budget={biddingPackage.budget} 
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 flex justify-end gap-3">
        <button 
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm hover:bg-[var(--color-surface-alt)] transition-all cursor-pointer active:scale-95"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
