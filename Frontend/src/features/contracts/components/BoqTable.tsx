import { useState } from 'react';
import { BoqForm } from './BoqForm';
import { useBoqItems, useDeleteBoqItem } from '../api/contractApi';
import { 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  ChevronRightIcon, 
  PlusIcon, 
  TrashIcon, 
  CalculatorIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import type { BoqItem } from '../types/contract.types';
import { NormEditor } from '../../materials/components/NormEditor';

interface BoqTableProps {
  contractId: number;
}

function formatCurrency(value: number | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function BoqTable({ contractId }: BoqTableProps) {
  const { data: items, isLoading } = useBoqItems(contractId);
  const deleteMutation = useDeleteBoqItem(contractId);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [selectedBoqItem, setSelectedBoqItem] = useState<{ id: number; name: string } | null>(null);

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa hạng mục này? Mọi hạng mục con (nếu có) cũng sẽ bị xóa.')) {
      deleteMutation.mutate(id);
    }
  };

  // Build hierarchy: separate parents and children
  const allItems = items || [];
  const parents = allItems.filter(i => !i.parentId);
  const childrenMap = new Map<number, BoqItem[]>();
  allItems.filter(i => i.parentId).forEach(child => {
    const arr = childrenMap.get(child.parentId!) || [];
    arr.push(child);
    childrenMap.set(child.parentId!, arr);
  });

  const filteredParents = parents.filter(p =>
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.itemCode?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <PlusIcon className="size-4" />
          {showForm ? 'Hủy thêm' : 'Thêm BOQ'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-4">
          <BoqForm contractId={contractId} onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-alt)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)] w-12">Mã ↕</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Hạng mục công việc ↕</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Thành tiền (Chưa thuế) ↕</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Thành tiền (Có thuế) ↕</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Mô tả ↕</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">Đang tải...</td></tr>
            ) : filteredParents.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">Chưa có hạng mục công việc.</td></tr>
            ) : (
              filteredParents.map(parent => {
                const children = childrenMap.get(parent.id) || [];
                const hasChildren = children.length > 0;
                const isExpanded = expandedIds.has(parent.id);

                return (
                  <div key={parent.id} className="contents"> 
                    {/* Parent Row */}
                    <tr
                      className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors cursor-pointer"
                      onClick={() => hasChildren && toggleExpand(parent.id)}
                    >
                      <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">
                        <div className="flex items-center gap-1">
                          {hasChildren ? (
                            isExpanded ? <ChevronDownIcon className="size-4" /> : <ChevronRightIcon className="size-4" />
                          ) : <span className="w-4" />}
                          {parent.itemCode}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[var(--color-primary)]">{parent.description}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(parent.totalPrice)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(parent.totalWithVat)}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)] truncate max-w-[200px]">{parent.unit || '—'}</td>
                      <td className="px-4 py-3 text-right flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedBoqItem({ id: parent.id, name: parent.description }); }}
                          className="p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full transition-colors inline-flex"
                          title="Thiết lập định mức vật tư"
                        >
                          <CalculatorIcon className="size-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(parent.id); }}
                          disabled={deleteMutation.isPending}
                          className="p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 rounded-full transition-colors disabled:opacity-50 inline-flex"
                          title="Xóa BOQ"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </td>
                    </tr>

                    {/* Children Rows */}
                    {isExpanded && children.map(child => (
                      <tr
                        key={child.id}
                        className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/50"
                      >
                        <td className="px-4 py-2.5 pl-10 text-[var(--color-text-muted)] text-xs">{child.itemCode}</td>
                        <td className="px-4 py-2.5 text-[var(--color-text-secondary)] text-xs">{child.description}</td>
                        <td className="px-4 py-2.5 text-right text-xs">{formatCurrency(child.totalPrice)}</td>
                        <td className="px-4 py-2.5 text-right text-xs">{formatCurrency(child.totalWithVat)}</td>
                        <td className="px-4 py-2.5 text-[var(--color-text-muted)] text-xs">{child.unit || '—'}</td>
                        <td className="px-4 py-2.5 text-right flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedBoqItem({ id: child.id, name: child.description })}
                            className="p-1 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-full transition-colors inline-flex"
                            title="Định mức"
                          >
                            <CalculatorIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(child.id)}
                            disabled={deleteMutation.isPending}
                            className="p-1 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-500 rounded-full transition-colors disabled:opacity-50 inline-flex"
                            title="Xóa BOQ con"
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </div>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Norm Editor Modal */}
      {selectedBoqItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[var(--color-surface)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <h3 className="font-bold text-[var(--color-text-primary)]">Thiết lập định mức vật tư</h3>
              <button onClick={() => setSelectedBoqItem(null)} className="p-1 hover:bg-[var(--color-border)] rounded-full transition-colors">
                <XMarkIcon className="size-5 text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="p-6">
              <NormEditor boqItemId={selectedBoqItem.id} boqItemName={selectedBoqItem.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
