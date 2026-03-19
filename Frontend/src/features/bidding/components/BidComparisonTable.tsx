import { useBidSubmissions, useUpdateSubmissionStatus } from '../api/biddingApi';
import { formatCurrency } from '../../../utils/formatCurrency';
import { CheckCircleIcon, XCircleIcon, ClockIcon, DocumentIcon } from '@heroicons/react/24/outline';

export function BidComparisonTable({ packageId, budget }: { packageId: number, budget?: number }) {
  const { data: submissions, isLoading } = useBidSubmissions(packageId);
  const updateStatusMutation = useUpdateSubmissionStatus();

  const handleSelectWinner = (submissionId: number, partnerName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn chọn ${partnerName} làm nhà thầu trúng thầu? Hành động này sẽ đóng gói thầu.`)) {
      updateStatusMutation.mutate({
        id: submissionId,
        status: 'ACCEPTED',
        notes: 'Được chọn làm nhà thầu trúng thầu.'
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[var(--color-text-muted)] animate-pulse font-medium">Đang tải bảng so sánh...</div>;

  const sortedSubmissions = [...(submissions || [])].sort((a, b) => a.bidPrice - b.bidPrice);

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)] transition-all hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--color-surface-alt)]/50 border-b border-[var(--color-border)]">
            <tr>
              <th className="px-6 py-5 font-black text-[var(--color-text-secondary)] uppercase text-[10px] tracking-widest">Tiêu chí / Đối tác</th>
              {sortedSubmissions.map(sub => (
                <th key={sub.id} className="min-w-[220px] px-6 py-5 font-black text-[var(--color-text-primary)]">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm">{sub.partnerName}</span>
                    {sub.status === 'ACCEPTED' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--color-success)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full w-fit">
                        <CheckCircleIcon className="size-3.5" /> Được chọn
                      </span>
                    ) : sub.status === 'REJECTED' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-2 py-0.5 rounded-full w-fit">
                        <XCircleIcon className="size-3.5" /> Bị loại
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] text-[var(--color-warning)] bg-[var(--color-warning-bg)] px-2 py-0.5 rounded-full w-fit">
                        <ClockIcon className="size-3.5" /> Đang chờ
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            <tr className="hover:bg-[var(--color-surface-alt)]/30 transition-colors">
              <td className="px-6 py-4 font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)]/50">Giá chào thầu</td>
              {sortedSubmissions.map(sub => (
                <td key={sub.id} className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-base font-black text-[var(--color-text-primary)]">
                      {formatCurrency(sub.bidPrice)}
                    </span>
                    {budget && budget > 0 && (
                      <span className={`text-[10px] font-bold ${sub.bidPrice > budget ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                        {sub.bidPrice > budget ? 'Vượt dự toán' : 'Trong dự toán'}
                      </span>
                    )}
                  </div>
                </td>
              ))}
            </tr>
            <tr className="hover:bg-[var(--color-surface-alt)]/30 transition-colors">
              <td className="px-6 py-4 font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)]/50">Ghi chú / Điều kiện</td>
              {sortedSubmissions.map(sub => (
                <td key={sub.id} className="px-6 py-4 text-xs text-[var(--color-text-muted)] italic leading-relaxed">
                  {sub.notes || '---'}
                </td>
              ))}
            </tr>
            <tr className="hover:bg-[var(--color-surface-alt)]/30 transition-colors">
              <td className="px-6 py-4 font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)]/50">Hồ sơ năng lực</td>
              {sortedSubmissions.map(sub => (
                <td key={sub.id} className="px-6 py-4">
                  {sub.proposalFileUrl ? (
                    <a 
                      href={sub.proposalFileUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1.5 text-[var(--color-primary)] font-bold hover:underline cursor-pointer group/link transition-all"
                    >
                      <DocumentIcon className="size-4 group-hover/link:scale-110 transition-transform" />
                      Tải hồ sơ PDF
                    </a>
                  ) : '---'}
                </td>
              ))}
            </tr>
          </tbody>
          <tfoot className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/30">
            <tr>
              <td className="px-6 py-6 border-r border-[var(--color-border)]/50"></td>
              {sortedSubmissions.map(sub => {
                const isSelected = sub.status === 'ACCEPTED';
                const isRejected = sub.status === 'REJECTED';
                
                return (
                  <td key={sub.id} className="px-6 py-6">
                    <button 
                      onClick={() => handleSelectWinner(sub.id, sub.partnerName)}
                      disabled={isSelected || isRejected || updateStatusMutation.isPending}
                      className={`w-full rounded-2xl py-3 text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
                        isSelected 
                          ? 'bg-[var(--color-success)] text-white shadow-[var(--color-success)]/30' 
                          : 'bg-[var(--color-primary)] text-white shadow-[var(--color-primary)]/30 hover:opacity-90 hover:scale-[1.02]'
                      }`}
                    >
                      {updateStatusMutation.isPending ? 'Đang xử lý...' : isSelected ? 'Đã trúng thầu' : isRejected ? 'Bị loại' : 'Chọn trúng thầu'}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
