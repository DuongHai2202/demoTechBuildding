import { useEffect, useState, type ReactNode } from 'react';

import { LoadingSkeleton } from '../LoadingSkeleton';
import { Pagination } from './Pagination';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  items: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  itemLabel?: string;
  paginationLabel?: string;
}

export function DataTable<T>({
  items,
  columns,
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
  pageSize = 10,
  itemLabel = 'bản ghi',
  paginationLabel = 'Phân trang bảng dữ liệu',
}: DataTableProps<T>): React.ReactNode {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [items, pageSize]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
      <div role="region" aria-label="Bảng dữ liệu" className="overflow-x-auto" tabIndex={items.length > 0 ? 0 : undefined}>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/70 text-[var(--color-text-muted)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3.5 font-semibold whitespace-nowrap sm:px-6 ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {items.length > 0 ? (
              visibleItems.map((item, index) => (
                <tr
                  key={(item as { id?: string | number }).id ?? index}
                  className="transition-colors hover:bg-[var(--color-surface-alt)]/60"
                >
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(item)
                      : (item as Record<string, ReactNode>)[col.key];

                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 text-[var(--color-text-secondary)] sm:px-6 ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : ''
                        }`}
                      >
                        {content ?? '—'}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-14 text-center text-[var(--color-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={currentPage}
        pageSize={pageSize}
        total={items.length}
        onPageChange={setPage}
        itemLabel={itemLabel}
        ariaLabel={paginationLabel}
      />
    </div>
  );
}
