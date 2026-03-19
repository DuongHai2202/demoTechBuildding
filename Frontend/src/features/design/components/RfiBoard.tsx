import { useState } from 'react';
import { useRfis } from '../api/rfiApi';
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { StatusBadge } from '../../../components/StatusBadge';
import type { Rfi, RfiStatus } from '../types/design.types';
import { RfiDetailModal, RfiForm } from './index';
import { useDeleteRfi } from '../api/rfiApi';

const STATUS_MAP: Record<RfiStatus, { label: string; variant: 'success' | 'info' | 'warning' | 'danger', icon: any }> = {
  OPEN: { label: 'Mở', variant: 'warning', icon: ChatBubbleLeftRightIcon },
  PENDING: { label: 'Đang xử lý', variant: 'info', icon: ClockIcon },
  RESOLVED: { label: 'Đã giải quyết', variant: 'success', icon: CheckCircleIcon },
  CLOSED: { label: 'Đã đóng', variant: 'danger', icon: XCircleIcon },
};

export function RfiBoard({ projectId, zoneId }: { projectId: number, zoneId?: number }) {
  const { data: rfis, isLoading } = useRfis(projectId, zoneId);
  const [selectedRfiId, setSelectedRfiId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Filter is handled by API hook now
  const filtered = rfis || [];

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* List Header */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-alt)]/30">
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          Yêu cầu làm rõ (RFI)
        </h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="size-4" />
          Tạo RFI mới
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">Đang tải danh sách RFI...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
             <ChatBubbleLeftRightIcon className="size-12 mx-auto text-[var(--color-text-muted)] opacity-20 mb-4" />
             <p className="text-sm font-medium text-[var(--color-text-muted)]">Chưa có yêu cầu làm rõ nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(rfi => (
              <RfiCard 
                key={rfi.id} 
                rfi={rfi} 
                onClick={() => setSelectedRfiId(rfi.id)} 
              />
            ))}
          </div>
        )}
      </div>

      {selectedRfiId && (
        <RfiDetailModal 
          rfiId={selectedRfiId} 
          onClose={() => setSelectedRfiId(null)} 
        />
      )}

      {showForm && (
        <RfiForm 
          projectId={projectId} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}

function RfiCard({ rfi, onClick }: { rfi: Rfi, onClick: () => void }) {
  const status = STATUS_MAP[rfi.status] || STATUS_MAP.OPEN;
  const deleteRfi = useDeleteRfi();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bạn có chắc chắn muốn xóa RFI này?')) {
      deleteRfi.mutate(rfi.id);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] hover:shadow-md transition-all cursor-pointer relative"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <StatusBadge label={status.label} variant={status.variant} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
            #{rfi.id}
          </span>
          <button 
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-rose-50 text-[var(--color-text-muted)] hover:text-rose-600 transition-all"
            title="Xóa RFI"
          >
            <TrashIcon className="size-3.5" />
          </button>
        </div>
      </div>
      
      <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-2 line-clamp-2 leading-tight">
        {rfi.title}
      </h4>
      
      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-4 h-8">
        {rfi.question}
      </p>
      
      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)]">
            {rfi.assigneeName?.charAt(0) || '?'}
          </div>
          <span className="text-[10px] font-medium text-[var(--color-text-secondary)] truncate max-w-[80px]">
            {rfi.assigneeName || 'Chưa gán'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
          <ClockIcon className="size-3" />
          {new Date(rfi.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </div>
    </div>
  );
}
