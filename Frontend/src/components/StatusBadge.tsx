type BadgeVariant = 'success' | 'warning' | 'danger' | 'info';

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-[var(--color-success-bg)]/80 text-[var(--color-success)] border-[var(--color-success)]/30',
  warning: 'bg-[var(--color-warning-bg)]/80 text-[var(--color-warning)] border-[var(--color-warning)]/30',
  danger:  'bg-[var(--color-danger-bg)]/80 text-[var(--color-danger)] border-[var(--color-danger)]/30',
  info:    'bg-[var(--color-info-bg)]/80 text-[var(--color-info)] border-[var(--color-info)]/30',
};

const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  // Projects
  PLANNING: { label: 'Khởi tạo', variant: 'warning' },
  IN_PROGRESS: { label: 'Đang thi công', variant: 'info' },
  COMPLETED: { label: 'Hoàn thành', variant: 'success' },
  SUSPENDED: { label: 'Tạm dừng', variant: 'danger' },
  // Material Requests
  PENDING: { label: 'Chờ duyệt', variant: 'warning' },
  APPROVED: { label: 'Đã duyệt', variant: 'success' },
  REJECTED: { label: 'Từ chối', variant: 'danger' },
  // Attendance
  CHECKED_IN: { label: 'Đang làm việc', variant: 'info' },
  FAILED: { label: 'Thất bại', variant: 'danger' },
  // General
  ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
  INACTIVE: { label: 'Tạm ngưng', variant: 'danger' },
  // Partners
  CLIENT: { label: 'Chủ đầu tư', variant: 'info' },
  CONTRACTOR: { label: 'Nhà thầu', variant: 'warning' },
  SUPPLIER: { label: 'Nhà cung cấp', variant: 'success' },
  // Design / BIM
  IFC: { label: 'Thi công (IFC)', variant: 'success' },
  FOR_REVIEW: { label: 'Thẩm tra', variant: 'info' },
  PRELIMINARY: { label: 'Sơ bộ', variant: 'warning' },
  AS_BUILT: { label: 'Hoàn công', variant: 'info' },
};

interface StatusBadgeProps {
  label?: string;
  variant?: BadgeVariant;
  status?: string;
}

export function StatusBadge({ label, variant, status }: StatusBadgeProps) {
  const displayLabel = label || (status ? STATUS_MAP[status]?.label : '') || status;
  const displayVariant = variant || (status ? STATUS_MAP[status]?.variant : 'info') || 'info';

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider border ${VARIANT_STYLES[displayVariant]}`}>
      {displayLabel}
    </span>
  );
}
