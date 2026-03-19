import { useState, useMemo } from 'react';
import { BoqForm } from './BoqForm';
import { useBoqItems, useDeleteBoqItem } from '../api/contractApi';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon, CubeIcon } from '@heroicons/react/24/outline';
import type { BoqItem } from '../types/contract.types';

interface BoqTreeTableProps {
  contractId: number;
}

function formatCurrency(value: number | undefined) {
  if (value == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function BoqTreeTable({ contractId }: BoqTreeTableProps) {
  const { data: items, isLoading } = useBoqItems(contractId);
  const deleteMutation = useDeleteBoqItem(contractId);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showForm, setShowForm] = useState(false);

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa hạng mục này? Mọi hạng mục con cũng sẽ bị xóa.')) {
      deleteMutation.mutate(id);
    }
  };

  // Build tree structure
  const boqTree = useMemo(() => {
    if (!items) return [];
    
    const itemMap = new Map<number, BoqItem & { children: any[] }>();
    items.forEach(item => itemMap.set(item.id, { ...item, children: [] }));
    
    const tree: any[] = [];
    itemMap.forEach(item => {
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId)!.children.push(item);
      } else {
        tree.push(item);
      }
    });
    
    return tree;
  }, [items]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderRow = (item: any, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const hidden = search && !item.description?.toLowerCase().includes(search.toLowerCase()) && !item.itemCode?.toLowerCase().includes(search.toLowerCase());

    if (hidden && !hasChildren) return null;

    return (
      <React.Fragment key={item.id}>
        <tr 
          className={`border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]/50 transition-colors group ${level > 0 ? 'bg-slate-50/30' : ''}`}
        >
          <td className="px-4 py-3">
            <div className="flex items-center gap-1" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren ? (
                <button onClick={() => toggleExpand(item.id)} className="p-0.5 hover:bg-[var(--color-border)] rounded">
                  {isExpanded ? <ChevronDownIcon className="size-3" /> : <ChevronRightIcon className="size-3" />}
                </button>
              ) : <span className="w-5" />}
              <span className={`text-xs font-mono ${level === 0 ? 'font-bold' : ''}`}>{item.itemCode}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex flex-col">
              <span className={`${level === 0 ? 'font-bold text-[var(--color-text-primary)]' : 'text-sm text-[var(--color-text-secondary)]'}`}>
                {item.description}
              </span>
              {item.bimId && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-500 font-medium mt-0.5">
                  <CubeIcon className="size-3" /> BIM: {item.bimId}
                </span>
              )}
            </div>
          </td>
          <td className="px-4 py-3 text-center text-[var(--color-text-muted)]">{item.unit || '—'}</td>
          <td className="px-4 py-3 text-right">{new Intl.NumberFormat('vi-VN').format(item.quantity || 0)}</td>
          <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
          <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.totalPrice)}</td>
          <td className="px-4 py-3 text-right">
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-rose-50"
            >
              <TrashIcon className="size-4" />
            </button>
          </td>
        </tr>
        {isExpanded && item.children.map((child: any) => renderRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên hạng mục..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="size-4" />
          {showForm ? 'Hủy' : 'Thêm Hạng mục'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
          <BoqForm contractId={contractId} onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
              <th className="px-6 py-4 text-left font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">Mã hạng mục</th>
              <th className="px-6 py-4 text-left font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">Nội dung công việc</th>
              <th className="px-6 py-4 text-center font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">ĐVT</th>
              <th className="px-6 py-4 text-right font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">Khối lượng</th>
              <th className="px-6 py-4 text-right font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">Đơn giá</th>
              <th className="px-6 py-4 text-right font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-[10px]">Thành tiền</th>
              <th className="px-6 py-4 text-right font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-[10px] w-12"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[var(--color-text-muted)]">Đang tải dữ liệu BOQ...</td></tr>
            ) : boqTree.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[var(--color-text-muted)]">Chưa có hạng mục công việc.</td></tr>
            ) : (
              boqTree.map(item => renderRow(item))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from 'react';
