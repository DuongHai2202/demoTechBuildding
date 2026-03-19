import { useState } from 'react';
import { useDesignSheets } from '../api/designApi';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  EyeIcon,
  AdjustmentsHorizontalIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { DesignSheetForm } from './index';
import { useDeleteDesignSheet } from '../api/designApi';
import { StatusBadge } from '../../../components/StatusBadge';
import type { DesignDiscipline } from '../types/design.types';

const DISCIPLINE_MAP: Record<DesignDiscipline, string> = {
  ARCH: 'Kiến trúc',
  STRUC: 'Kết cấu',
  MEP: 'Cơ điện (MEP)',
  LANDSCAPE: 'Cảnh quan',
  INTERIOR: 'Nội thất'
};



export function DesignSheetList({ projectId, zoneId }: { projectId: number, zoneId?: number }) {
  const { data: sheets, isLoading } = useDesignSheets(projectId, zoneId);
  const deleteSheet = useDeleteDesignSheet();
  const [showForm, setShowForm] = useState(false);
  const [editingSheet, setEditingSheet] = useState<any>(null);
  const [filterDiscipline, setFilterDiscipline] = useState<string>('ALL');

  const filtered = (sheets || []).filter(s => 
    filterDiscipline === 'ALL' || s.discipline === filterDiscipline
  );

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* List Header */}
      <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
        <div className="flex items-center gap-6">
          <h3 className="text-base font-black text-[var(--color-text-primary)]">
            Danh mục bản vẽ {zoneId ? `(Khu vực đang chọn)` : '(Tất cả)'}
          </h3>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-1.5 focus-within:border-[var(--color-primary)] transition-colors">
            <AdjustmentsHorizontalIcon className="size-4 text-[var(--color-text-muted)]" />
            <select 
              value={filterDiscipline} 
              onChange={e => setFilterDiscipline(e.target.value)}
              className="bg-transparent text-[11px] font-bold uppercase tracking-wider outline-none text-[var(--color-text-primary)] cursor-pointer"
            >
              <option value="ALL">Tất cả bộ môn</option>
              {Object.entries(DISCIPLINE_MAP).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingSheet(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
        >
          <PlusIcon className="size-4 stroke-[3px]" />
          Phát hành bản vẽ
        </button>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">Đang tải danh sách hồ sơ...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="size-20 bg-[var(--color-surface-alt)] rounded-full flex items-center justify-center mb-6">
              <DocumentIcon className="size-10 text-[var(--color-text-muted)] opacity-20" />
            </div>
            <p className="text-sm font-medium text-[var(--color-text-muted)] max-w-[280px]">
              Chưa có hồ sơ thiết kế nào cho khu vực này.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-[var(--color-border)]">
            {filtered.map(sheet => (
              <div key={sheet.id} className="group flex items-center gap-4 p-4 hover:bg-[var(--color-bg)] transition-colors">
                <div className="size-12 rounded-lg bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                  {sheet.fileUrl?.toLowerCase().endsWith('.pdf') ? (
                    <span className="text-[10px] font-bold text-rose-500">PDF</span>
                  ) : (
                    <DocumentIcon className="size-6 text-[var(--color-text-muted)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-1.5 py-0.5 rounded">
                      {sheet.sheetNumber}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{sheet.title}</h4>
                    <StatusBadge status={sheet.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-[10px] font-medium text-[var(--color-text-muted)]">
                    <span>Bộ môn: <span className="text-[var(--color-text-secondary)]">{DISCIPLINE_MAP[sheet.discipline] || sheet.discipline}</span></span>
                    <span>Khu vực: <span className="text-[var(--color-text-secondary)]">{sheet.zoneName || '—'}</span></span>
                    <span>Revision: <span className="text-[var(--color-text-secondary)] font-bold">{sheet.revision}</span></span>
                    <span>Ngày: <span className="text-[var(--color-text-secondary)]">{new Date(sheet.issuedAt).toLocaleDateString('vi-VN')}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => window.open(sheet.fileUrl, '_blank')}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors" 
                    title="Xem"
                  >
                    <EyeIcon className="size-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setEditingSheet(sheet);
                      setShowForm(true);
                    }}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-amber-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Bạn có chắc chắn muốn xóa bản vẽ này?')) {
                        deleteSheet.mutate(sheet.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-rose-600 transition-colors"
                    title="Xóa"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                  <button 
                    className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
                    title="Tải xuống"
                  >
                    <ArrowDownTrayIcon className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <DesignSheetForm 
          projectId={projectId} 
          zoneId={zoneId}
          initialData={editingSheet}
          onClose={() => {
            setShowForm(false);
            setEditingSheet(null);
          }} 
        />
      )}
    </div>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}
