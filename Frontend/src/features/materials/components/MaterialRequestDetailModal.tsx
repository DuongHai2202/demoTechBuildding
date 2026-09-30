import dayjs from 'dayjs';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  DocumentTextIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StatusBadge } from '../../../components/StatusBadge';
import type { MaterialRequest } from '../types/material.types';

interface MaterialRequestDetailModalProps {
  request: MaterialRequest;
  onClose: () => void;
  onEdit?: () => void;
  canEdit?: boolean;
}

function formatDateTime(value?: string) {
  return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : 'Chưa ghi nhận';
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CubeIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/55 p-3">
      <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
        <Icon className="h-4 w-4 text-[var(--color-primary)]" />
        <span>{label}</span>
      </div>
      <div className="break-words text-sm font-semibold text-[var(--color-text-primary)]">{value}</div>
    </div>
  );
}

export function MaterialRequestDetailModal({
  request,
  onClose,
  onEdit,
  canEdit = false,
}: MaterialRequestDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[min(760px,calc(100vh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-request-detail-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <ClipboardDocumentListIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                MR-{request.id.toString().padStart(4, '0')}
              </p>
              <h2 id="material-request-detail-title" className="mt-0.5 truncate text-lg font-extrabold text-[var(--color-text-primary)]">
                Chi tiết yêu cầu vật tư
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={request.status} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
              aria-label="Đóng chi tiết yêu cầu vật tư"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem icon={CubeIcon} label="Vật tư / thiết bị" value={request.materialName || 'Chưa có tên'} />
            <DetailItem
              icon={ClipboardDocumentListIcon}
              label="Số lượng yêu cầu"
              value={`${request.requestedQuantity} ${request.materialUnit || ''}`.trim()}
            />
            <DetailItem icon={DocumentTextIcon} label="Dự án áp dụng" value={request.projectName || `Dự án #${request.projectId}`} />
            <DetailItem icon={UserCircleIcon} label="Người yêu cầu" value={request.requesterName || `Tài khoản #${request.requesterId}`} />
            <DetailItem icon={CalendarDaysIcon} label="Ngày tạo" value={formatDateTime(request.createdAt)} />
            <DetailItem icon={DocumentTextIcon} label="Mã vật tư" value={`MAT-${request.materialId}`} />
          </div>

          <div className="mt-5 rounded-xl border border-[var(--color-border)] p-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Quy trình xử lý</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="border-l-2 border-blue-400 pl-3">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Đã gửi yêu cầu</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatDateTime(request.createdAt)}</p>
              </div>
              <div className="border-l-2 border-amber-400 pl-3">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Kiểm tra kỹ thuật</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {request.checkedByName ? `${request.checkedByName} · ${formatDateTime(request.checkedAt)}` : 'Chưa thực hiện'}
                </p>
              </div>
              <div className={`border-l-2 pl-3 ${request.status === 'REJECTED' ? 'border-rose-400' : 'border-emerald-400'}`}>
                <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  {request.status === 'REJECTED' ? 'Kết quả từ chối' : 'Phê duyệt PM'}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {request.status === 'REJECTED'
                    ? 'Yêu cầu đã bị từ chối'
                    : request.approvedByName
                      ? `${request.approvedByName} · ${formatDateTime(request.approvedAt)}`
                      : 'Chưa thực hiện'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/35 p-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Ghi chú</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
              {request.notes?.trim() || 'Không có ghi chú cho yêu cầu này.'}
            </p>
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline px-5"
          >
            Đóng
          </button>
          {canEdit && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn-primary px-5"
            >
              Chỉnh sửa yêu cầu
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
