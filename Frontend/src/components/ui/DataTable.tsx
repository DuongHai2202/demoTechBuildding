import { type ReactNode } from 'react';

import { LoadingSkeleton } from '../LoadingSkeleton';

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
}

export function DataTable<T>({
  items,
  columns,
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
}: DataTableProps<T>): React.ReactNode {
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

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 text-[var(--color-text-muted)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 font-medium whitespace-nowrap ${
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
              items.map((item, index) => (
                <tr
                  key={index}
                  className="transition-colors hover:bg-[var(--color-surface-alt)]/30"
                >
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(item)
                      : (item as any)[col.key];

                    return (
                      <td
                        key={col.key}
                        className={`px-6 py-4 text-[var(--color-text-secondary)] ${
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
                  className="px-6 py-12 text-center text-[var(--color-text-muted)]"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
