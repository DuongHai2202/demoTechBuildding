import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

import {
  useDeleteTechnicalStandard,
  useTechnicalStandards,
  useUploadTechnicalFile,
} from '../api/technicalStandardApi';
import type { TechnicalStandard } from '../types/technicalStandard.types';
import { TechnicalStandardForm } from './TechnicalStandardForm';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import { formatDate } from '../../../utils/formatDate';
import { Pagination } from '../../../components/ui/Pagination';

type CategoryFilter = 'ALL' | 'TCVN' | 'ASTM' | 'EUROCODE' | 'IEC' | 'INTERNAL';
type ScopeFilter = 'ALL' | 'SHARED' | 'PROJECT';

const CATEGORY_OPTIONS: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'ALL', label: 'Tất cả phân loại' },
  { value: 'TCVN', label: 'TCVN · Việt Nam' },
  { value: 'ASTM', label: 'ASTM · Hoa Kỳ' },
  { value: 'EUROCODE', label: 'EUROCODE · Châu Âu' },
  { value: 'IEC', label: 'IEC · Điện' },
  { value: 'INTERNAL', label: 'Tiêu chuẩn nội bộ' },
];

const STANDARD_CATEGORY_TONE = 'border-[var(--color-primary)]/20 bg-[var(--color-primary-light)] text-[var(--color-primary)]';
const STANDARD_CATEGORY_ICON_TONE = 'bg-[var(--color-primary-light)] text-[var(--color-primary)]';

const CATEGORY_META: Record<Exclude<CategoryFilter, 'ALL'>, { label: string; tone: string; iconTone: string }> = {
  TCVN: {
    label: 'TCVN',
    tone: STANDARD_CATEGORY_TONE,
    iconTone: STANDARD_CATEGORY_ICON_TONE,
  },
  ASTM: {
    label: 'ASTM',
    tone: STANDARD_CATEGORY_TONE,
    iconTone: STANDARD_CATEGORY_ICON_TONE,
  },
  EUROCODE: {
    label: 'EUROCODE',
    tone: STANDARD_CATEGORY_TONE,
    iconTone: STANDARD_CATEGORY_ICON_TONE,
  },
  IEC: {
    label: 'IEC',
    tone: STANDARD_CATEGORY_TONE,
    iconTone: STANDARD_CATEGORY_ICON_TONE,
  },
  INTERNAL: {
    label: 'NỘI BỘ',
    tone: STANDARD_CATEGORY_TONE,
    iconTone: STANDARD_CATEGORY_ICON_TONE,
  },
};

const ACCEPTED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const PAGE_SIZE = 6;

function getCategoryMeta(category?: string) {
  return CATEGORY_META[category as Exclude<CategoryFilter, 'ALL'>] || {
    label: category || 'KHÁC',
    tone: 'border-[var(--color-primary)]/20 bg-[var(--color-primary-light)] text-[var(--color-primary)]',
    iconTone: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
  };
}

function StatCard({ icon, label, value, hint, tone }: {
  icon: ReactNode;
  label: string;
  value: number;
  hint: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">{label}</p>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">{value}</p>
        </div>
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">{hint}</p>
    </div>
  );
}

export function TechnicalStandardList() {
  const { confirm } = useActionDialog();
  const { data: standards, isLoading, isError } = useTechnicalStandards();
  const deleteMutation = useDeleteTechnicalStandard();
  const uploadMutation = useUploadTechnicalFile();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<TechnicalStandard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('ALL');
  const [page, setPage] = useState(1);

  const standardList = standards ?? [];
  const filteredStandards = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi-VN');

    return standardList.filter((standard) => {
      const matchesSearch = !query || [
        standard.name,
        standard.code,
        standard.category,
        standard.description,
        standard.projectName,
      ].some((value) => value?.toLocaleLowerCase('vi-VN').includes(query));

      const matchesCategory = categoryFilter === 'ALL' || standard.category === categoryFilter;
      const isShared = !standard.projectId && !standard.projectName;
      const matchesScope = scopeFilter === 'ALL'
        || (scopeFilter === 'SHARED' && isShared)
        || (scopeFilter === 'PROJECT' && !isShared);

      return matchesSearch && matchesCategory && matchesScope;
    });
  }, [categoryFilter, scopeFilter, searchTerm, standardList]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, scopeFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredStandards.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleStandards = filteredStandards.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const stats = useMemo(() => {
    const categories = new Set(standardList.map((standard) => standard.category).filter(Boolean));
    const withFile = standardList.filter((standard) => Boolean(standard.fileUrl)).length;
    const shared = standardList.filter((standard) => !standard.projectId && !standard.projectName).length;

    return {
      total: standardList.length,
      withFile,
      shared,
      categories: categories.size,
    };
  }, [standardList]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('ALL');
    setScopeFilter('ALL');
  };

  const handleEdit = (standard: TechnicalStandard) => {
    setEditingStandard(standard);
    setIsFormOpen(true);
  };

  const handleDelete = async (standard: TechnicalStandard) => {
    if (await confirm({
      title: 'Xóa tiêu chuẩn kỹ thuật',
      description: `“${standard.name}” sẽ bị xóa khỏi thư viện. Bạn có chắc muốn tiếp tục?`,
      confirmLabel: 'Xóa tiêu chuẩn',
      variant: 'danger',
    })) {
      deleteMutation.mutate(standard.id, {
        onSuccess: () => toast.success('Đã xóa tiêu chuẩn kỹ thuật.'),
        onError: () => toast.error('Xóa tiêu chuẩn thất bại. Vui lòng thử lại.'),
      });
    }
  };

  const handleFileUpload = (id: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ACCEPTED_FILE_EXTENSIONS.includes(extension)) {
      toast.error('Chỉ hỗ trợ tài liệu PDF, DOC hoặc DOCX.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Tài liệu không được vượt quá 20 MB.');
      return;
    }

    uploadMutation.mutate({ id, file }, {
      onSuccess: () => toast.success('Đã cập nhật tài liệu tiêu chuẩn.'),
      onError: () => toast.error('Tải tài liệu thất bại. Vui lòng thử lại.'),
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="h-10 w-2/3 rounded-lg bg-[var(--color-surface-alt)]" />
            <div className="mt-6 h-4 w-full rounded bg-[var(--color-surface-alt)]" />
            <div className="mt-3 h-4 w-4/5 rounded bg-[var(--color-surface-alt)]" />
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="h-16 rounded-xl bg-[var(--color-surface-alt)]" />
              <div className="h-16 rounded-xl bg-[var(--color-surface-alt)]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] p-8 text-center">
        <DocumentTextIcon className="mx-auto size-12 text-[var(--color-danger)]" />
        <h2 className="mt-4 text-lg font-bold text-[var(--color-text-primary)]">Không tải được thư viện tiêu chuẩn</h2>
        <p className="mt-1 text-base text-[var(--color-text-muted)]">Vui lòng tải lại trang hoặc thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          icon={<DocumentTextIcon className="size-5" />}
          label="Tổng tiêu chuẩn"
          value={stats.total}
          hint="Trong thư viện hiện tại"
          tone="bg-[var(--color-primary-light)] text-[var(--color-primary)]"
        />
        <StatCard
          icon={<CheckCircleIcon className="size-5" />}
          label="Đã có tài liệu"
          value={stats.withFile}
          hint="Có file để xem hoặc tải"
          tone="bg-[var(--color-success-bg)] text-[var(--color-success)]"
        />
        <StatCard
          icon={<BuildingOffice2Icon className="size-5" />}
          label="Dùng chung"
          value={stats.shared}
          hint="Áp dụng toàn công ty"
          tone="bg-[var(--color-info-bg)] text-[var(--color-info)]"
        />
        <StatCard
          icon={<TagIcon className="size-5" />}
          label="Phân loại"
          value={stats.categories}
          hint="TCVN, ASTM, IEC..."
          tone="bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]"
        />
      </div>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)] sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <label className="relative min-w-0 flex-1">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">Tìm trong thư viện</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-[2.55rem] size-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="search"
              aria-label="Tìm tiêu chuẩn kỹ thuật"
              placeholder="Tìm theo mã, tên, mô tả hoặc dự án..."
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-4 text-base text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="w-full xl:w-56">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">Phân loại</span>
            <select
              aria-label="Lọc theo phân loại"
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-base text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label className="w-full xl:w-56">
            <span className="mb-1.5 block text-sm font-semibold text-[var(--color-text-secondary)]">Phạm vi áp dụng</span>
            <select
              aria-label="Lọc theo phạm vi áp dụng"
              className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-base text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value as ScopeFilter)}
            >
              <option value="ALL">Tất cả phạm vi</option>
              <option value="SHARED">Dùng chung công ty</option>
              <option value="PROJECT">Theo dự án</option>
            </select>
          </label>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!searchTerm && categoryFilter === 'ALL' && scopeFilter === 'ALL'}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 text-base font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-alt)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowPathIcon className="size-4" />
            Đặt lại
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="size-4" />
            <span>Hiển thị <strong className="text-[var(--color-text-primary)]">{filteredStandards.length}</strong> / {standardList.length} tiêu chuẩn</span>
          </div>
          <button
            type="button"
            onClick={() => { setEditingStandard(null); setIsFormOpen(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-base font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20"
          >
            <PlusIcon className="size-5" />
            Thêm tiêu chuẩn
          </button>
        </div>
      </section>

      <section aria-labelledby="standards-list-title">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 id="standards-list-title" className="text-lg font-extrabold text-[var(--color-text-primary)] sm:text-xl">Danh mục tiêu chuẩn</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">Mỗi thẻ hiển thị đủ mã hiệu, phiên bản, phạm vi và tình trạng tài liệu.</p>
          </div>
        </div>

        {filteredStandards.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {visibleStandards.map((standard) => {
              const category = getCategoryMeta(standard.category);
              const hasFile = Boolean(standard.fileUrl);
              const isShared = !standard.projectId && !standard.projectName;

              return (
                <article
                  key={standard.id}
                  className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/40 hover:shadow-lg"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${category.iconTone}`}>
                        <DocumentTextIcon className="size-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${category.tone}`}>
                            {category.label}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${hasFile ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                            <span className={`size-1.5 rounded-full ${hasFile ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
                            {hasFile ? 'Có tài liệu' : 'Thiếu tài liệu'}
                          </span>
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-lg font-extrabold leading-snug text-[var(--color-text-primary)]">
                          {standard.name}
                        </h3>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(standard)}
                          aria-label={`Chỉnh sửa ${standard.name}`}
                          title="Chỉnh sửa"
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                        >
                          <PencilSquareIcon className="size-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(standard)}
                          aria-label={`Xóa ${standard.name}`}
                          title="Xóa tiêu chuẩn"
                          className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
                        >
                          <TrashIcon className="size-5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 min-h-12 line-clamp-2 text-base leading-6 text-[var(--color-text-muted)]">
                      {standard.description || 'Chưa có mô tả chi tiết cho tiêu chuẩn này.'}
                    </p>

                    <dl className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[var(--color-surface-alt)] px-3 py-2.5">
                        <dt className="text-sm font-semibold text-[var(--color-text-muted)]">Mã hiệu</dt>
                        <dd className="mt-1 truncate font-mono text-base font-bold text-[var(--color-text-primary)]">{standard.code || 'Tự sinh khi lưu'}</dd>
                      </div>
                      <div className="rounded-xl bg-[var(--color-surface-alt)] px-3 py-2.5">
                        <dt className="text-sm font-semibold text-[var(--color-text-muted)]">Phiên bản</dt>
                        <dd className="mt-1 truncate text-base font-bold text-[var(--color-text-primary)]">{standard.version || 'Chưa cập nhật'}</dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm">
                      {isShared ? <BuildingOffice2Icon className="size-5 shrink-0 text-[var(--color-info)]" /> : <FolderOpenIcon className="size-5 shrink-0 text-[var(--color-primary)]" />}
                      <span className="truncate text-[var(--color-text-muted)]">
                        {isShared ? 'Dùng chung toàn công ty' : 'Dự án áp dụng:'}
                        {!isShared && <strong className="ml-1 font-semibold text-[var(--color-text-primary)]">{standard.projectName || 'Chưa xác định'}</strong>}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/45 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      {hasFile ? (
                        <a
                          href={standard.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-light)] px-3 py-2 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white"
                        >
                          <ArrowDownTrayIcon className="size-4" />
                          Mở tài liệu
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
                          <DocumentTextIcon className="size-4" />
                          Chưa có tài liệu đính kèm
                        </span>
                      )}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-bold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
                        <CloudArrowUpIcon className="size-4" />
                        {hasFile ? 'Thay tài liệu' : 'Tải tài liệu'}
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(event) => handleFileUpload(standard.id, event)} />
                      </label>
                    </div>
                    {standard.createdAt && (
                      <span className="text-sm text-[var(--color-text-muted)]">Cập nhật {formatDate(standard.createdAt)}</span>
                    )}
                  </div>
                </article>
              );
            })}
            </div>
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredStandards.length}
              onPageChange={setPage}
              itemLabel="tiêu chuẩn"
              ariaLabel="Phân trang tiêu chuẩn kỹ thuật"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <DocumentTextIcon className="mx-auto size-12 text-[var(--color-text-disabled)]" />
            <h3 className="mt-4 text-lg font-bold text-[var(--color-text-primary)]">Không tìm thấy tiêu chuẩn phù hợp</h3>
            <p className="mt-1 text-base text-[var(--color-text-muted)]">Thử đổi từ khóa hoặc bộ lọc để xem thêm kết quả.</p>
            <button type="button" onClick={resetFilters} className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-base font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]">
              <ArrowPathIcon className="size-4" />
              Xóa bộ lọc
            </button>
          </div>
        )}
      </section>

      {isFormOpen && (
        <TechnicalStandardForm
          standard={editingStandard}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
