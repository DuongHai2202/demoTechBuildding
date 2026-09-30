import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  ariaLabel?: string;
}
function getPageItems(page: number, totalPages: number): Array<number | 'ellipsis-left' | 'ellipsis-right'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-right', totalPages];
  }

  if (page >= totalPages - 3) {
    return [1, 'ellipsis-left', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis-left', page - 1, page, page + 1, 'ellipsis-right', totalPages];
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = 'bản ghi',
  ariaLabel = 'Phân trang',
}: PaginationProps) {
  if (total <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-[var(--color-text-muted)]">
        Hiển thị <span className="font-semibold text-[var(--color-text-secondary)]">{firstItem}–{lastItem}</span>{' '}
        trong tổng số <span className="font-semibold text-[var(--color-text-secondary)]">{total}</span> {itemLabel}
      </p>

      <nav aria-label={ariaLabel} className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-alt)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeftIcon className="size-4" />
        </button>

        <div className="flex items-center gap-1" role="list" aria-label="Các trang">
          {getPageItems(currentPage, totalPages).map((item) => {
            if (typeof item !== 'number') {
              return (
                <span key={item} className="inline-flex size-9 items-center justify-center text-xs text-[var(--color-text-muted)]" aria-hidden="true">
                  …
                </span>
              );
            }

            return (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? 'page' : undefined}
                aria-label={`Trang ${item}`}
                className={`inline-flex size-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                  item === currentPage
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'border border-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex size-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-alt)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRightIcon className="size-4" />
        </button>
      </nav>
    </div>
  );
}
