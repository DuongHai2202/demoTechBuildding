import { useBoqItems } from '../api/contractApi';
import { formatCurrency } from '../../../utils/formatCurrency';

interface VatSummaryTabProps {
  contractId: number;
}

export function VatSummaryTab({ contractId }: VatSummaryTabProps) {
  const { data: items, isLoading } = useBoqItems(contractId);

  const summary = (items || []).reduce(
    (acc, item) => {
      acc.totalBeforeVat += item.totalPrice || 0;
      acc.totalVat += item.vatAmount || 0;
      acc.totalAfterVat += item.totalWithVat || 0;
      return acc;
    },
    { totalBeforeVat: 0, totalVat: 0, totalAfterVat: 0 }
  );

  if (isLoading) return <div className="py-10 text-center text-[var(--color-text-muted)]">Đang tính toán thuế...</div>;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="bg-[var(--color-surface-alt)] px-6 py-4 border-b border-[var(--color-border)]">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Tổng hợp Thuế VAT</h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-dashed border-[var(--color-border)]">
          <span className="text-[var(--color-text-secondary)]">Tổng giá trị TRƯỚC thuế (BOQ)</span>
          <span className="text-lg font-medium">{formatCurrency(summary.totalBeforeVat)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed border-[var(--color-border)]">
          <span className="text-[var(--color-text-secondary)]">Tổng tiền thuế VAT</span>
          <span className="text-lg font-bold text-orange-600">
            {formatCurrency(summary.totalVat)}
          </span>
        </div>
        <div className="flex justify-between items-center py-4">
          <span className="text-lg font-bold text-[var(--color-text-primary)]">TỔNG CỘNG (SAU THUẾ)</span>
          <span className="text-2xl font-black text-[var(--color-primary)]">
            {formatCurrency(summary.totalAfterVat)}
          </span>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm italic">
          <p>Lưu ý: Tiền thuế được tính toán tự động dựa trên mức thuế suất (VAT %) thiết lập riêng cho từng hạng mục công việc trong bảng BOQ.</p>
        </div>
      </div>
    </div>
  );
}
