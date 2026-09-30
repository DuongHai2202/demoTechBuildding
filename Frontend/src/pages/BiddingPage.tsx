import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  FunnelIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  TicketIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

import { useAllBiddingPackages } from '../features/bidding/api/biddingApi';
import { useProjects } from '../features/projects/api/projectApi';
import { BiddingPackageDetail } from '../features/bidding/components/BiddingPackageDetail';
import { PackageForm } from '../features/bidding/components/PackageForm';
import type { BiddingPackage, BiddingStatus } from '../features/bidding/types/bidding.types';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';
import { useAuthStore } from '../features/auth/stores/authStore';
import { hasPermission } from '../features/auth/authorization';
import { formatCurrency } from '../utils/formatCurrency';

type StatusMeta = {
  label: string;
  className: string;
  dotClass: string;
};

const BIDDING_STATUS_META: Record<BiddingStatus, StatusMeta> = {
  DRAFT: { label: 'Bản nháp', className: 'bg-slate-100 text-slate-700', dotClass: 'bg-slate-400' },
  PENDING: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' },
  PUBLISHED: { label: 'Đã công bố', className: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' },
  OPEN: { label: 'Đang nhận hồ sơ', className: 'bg-sky-50 text-sky-700', dotClass: 'bg-sky-500' },
  BIDDING: { label: 'Đang đấu thầu', className: 'bg-sky-50 text-sky-700', dotClass: 'bg-sky-500' },
  INVITING: { label: 'Đang mời thầu', className: 'bg-sky-50 text-sky-700', dotClass: 'bg-sky-500' },
  EVALUATING: { label: 'Đang đánh giá', className: 'bg-amber-50 text-amber-700', dotClass: 'bg-amber-500' },
  AWARDED: { label: 'Đã chọn nhà thầu', className: 'bg-emerald-50 text-emerald-700', dotClass: 'bg-emerald-500' },
  CLOSED: { label: 'Đã đóng', className: 'bg-slate-100 text-slate-600', dotClass: 'bg-slate-400' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700', dotClass: 'bg-rose-500' },
};

const ACTIVE_STATUSES: BiddingStatus[] = ['PUBLISHED', 'OPEN', 'BIDDING', 'INVITING'];

const BiddingPage: React.FC = () => {
  const { data: allPackages = [], isLoading } = useAllBiddingPackages();
  const { data: projects = [] } = useProjects();
  const user = useAuthStore((state) => state.user);
  const canManageBidding = hasPermission(user, 'BIDDING_MANAGE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<BiddingStatus | ''>('');
  const [viewingPackage, setViewingPackage] = useState<BiddingPackage | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!viewingPackage) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewingPackage(null);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [viewingPackage]);

  const projectLabels = useMemo(() => {
    return new Map(
      projects.map((project) => [
        project.id,
        project.projectCode ? `${project.name} · ${project.projectCode}` : project.name,
      ]),
    );
  }, [projects]);

  const biddingProjects = useMemo(() => {
    const projectIds = Array.from(new Set(allPackages.map((pkg) => pkg.projectId)));

    return projectIds
      .map((id) => ({ id, name: projectLabels.get(id) || `Dự án #${id}` }))
      .sort((first, second) => first.name.localeCompare(second.name, 'vi'));
  }, [allPackages, projectLabels]);

  const filteredPackages = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLocaleLowerCase('vi-VN');

    return allPackages.filter((pkg) => {
      const searchableText = `${pkg.packageName || ''} ${pkg.packageCode || ''}`.toLocaleLowerCase('vi-VN');
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
      const matchesProject = selectedProjectId === null || pkg.projectId === selectedProjectId;
      const matchesStatus = !selectedStatus || pkg.status === selectedStatus;
      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [allPackages, searchTerm, selectedProjectId, selectedStatus]);

  const stats = useMemo(() => [
    {
      label: 'Tổng gói thầu',
      value: allPackages.length,
      caption: 'Trong toàn hệ thống',
      icon: TicketIcon,
      iconClass: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Đang nhận hồ sơ',
      value: allPackages.filter((pkg) => ACTIVE_STATUSES.includes(pkg.status)).length,
      caption: 'Có thể tiếp nhận báo giá',
      icon: ClockIcon,
      iconClass: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Đang đánh giá',
      value: allPackages.filter((pkg) => pkg.status === 'EVALUATING').length,
      caption: 'Cần xử lý tiếp theo',
      icon: AdjustmentsHorizontalIcon,
      iconClass: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Đã chọn nhà thầu',
      value: allPackages.filter((pkg) => pkg.status === 'AWARDED').length,
      caption: 'Đã hoàn tất lựa chọn',
      icon: CheckCircleIcon,
      iconClass: 'bg-emerald-50 text-emerald-600',
    },
  ], [allPackages]);

  const hasFilters = Boolean(searchTerm || selectedProjectId !== null || selectedStatus);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProjectId(null);
    setSelectedStatus('');
  };

  const columns: ColumnDef<BiddingPackage>[] = [
    {
      key: 'packageCode',
      header: 'Số hiệu',
      className: 'w-[150px]',
      render: (pkg) => (
        <div>
          <span className="font-mono text-sm font-bold text-[var(--color-text-primary)]">{pkg.packageCode || '—'}</span>
          <span className="mt-1 block text-xs text-[var(--color-text-muted)]">ID hệ thống #{pkg.id}</span>
        </div>
      ),
    },
    {
      key: 'packageName',
      header: 'Gói thầu & dự án',
      className: 'min-w-[300px]',
      render: (pkg) => (
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => setViewingPackage(pkg)}
            className="block max-w-[420px] truncate text-left text-sm font-bold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)] hover:underline"
          >
            {pkg.packageName}
          </button>
          <span className="mt-1 block max-w-[420px] truncate text-xs text-[var(--color-text-muted)]">
            {projectLabels.get(pkg.projectId) || `Dự án #${pkg.projectId}`}
          </span>
        </div>
      ),
    },
    {
      key: 'budget',
      header: 'Ngân sách',
      className: 'min-w-[170px]',
      render: (pkg) => (
        <span className="whitespace-nowrap text-sm font-bold text-[var(--color-text-primary)]">
          {pkg.budget ? formatCurrency(pkg.budget) : 'Chưa xác định'}
        </span>
      ),
    },
    {
      key: 'deadline',
      header: 'Hạn nộp hồ sơ',
      className: 'min-w-[165px]',
      render: (pkg) => {
        const deadline = dayjs(pkg.deadline);
        const isExpired = deadline.isValid() && deadline.isBefore(dayjs());

        return (
          <div className="whitespace-nowrap">
            <div className={`text-sm font-semibold ${isExpired ? 'text-rose-600' : 'text-[var(--color-text-primary)]'}`}>
              {deadline.isValid() ? deadline.format('DD/MM/YYYY') : 'Chưa xác định'}
            </div>
            <div className={`mt-1 flex items-center gap-1 text-xs ${isExpired ? 'text-rose-600' : 'text-[var(--color-text-muted)]'}`}>
              <CalendarDaysIcon className="size-3.5" />
              {deadline.isValid() ? deadline.format('HH:mm') : '—'}
              <span aria-hidden="true">·</span>
              {isExpired ? 'Đã hết hạn' : 'Còn hiệu lực'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      className: 'min-w-[160px]',
      render: (pkg) => <StatusBadge status={pkg.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      className: 'w-[150px]',
      render: (pkg) => (
        <button
          type="button"
          onClick={() => setViewingPackage(pkg)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
          title={`Xem chi tiết ${pkg.packageName}`}
        >
          <InformationCircleIcon className="size-4" />
          Xem chi tiết
        </button>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 animate-in fade-in duration-300">
      <section className="flex flex-col gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-theme)] sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            <TicketIcon className="size-4" />
            Mua sắm & lựa chọn nhà thầu
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">Quản lý đấu thầu</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Theo dõi gói thầu, hạn nộp hồ sơ và kết quả lựa chọn nhà thầu theo từng dự án.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <ShieldCheckIcon className="size-4" />
            Quy trình có kiểm soát
          </div>
          {canManageBidding && (
            <button
              type="button"
              onClick={() => setShowForm((visible) => !visible)}
              className="btn-primary justify-center px-4 py-2.5 shadow-sm"
            >
              {showForm ? <XMarkIcon className="size-5" /> : <PlusIcon className="size-5" />}
              {showForm ? 'Đóng biểu mẫu' : 'Tạo gói thầu'}
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-start justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)] sm:p-5">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-muted)]">{stat.label}</p>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">{stat.value}</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">{stat.caption}</p>
              </div>
              <div className={`rounded-xl p-2.5 ${stat.iconClass}`}>
                <Icon className="size-5" />
              </div>
            </div>
          );
        })}
      </section>

      {showForm && canManageBidding && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">Tạo mới</p>
              <h2 className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">Thông tin gói thầu</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Nhập thông tin cơ bản và thiết lập tiêu chí đánh giá trước khi công bố.</p>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-[var(--color-text-muted)] transition hover:bg-white hover:text-[var(--color-text-primary)]" aria-label="Đóng biểu mẫu">
              <XMarkIcon className="size-5" />
            </button>
          </div>
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-6">
            <PackageForm onClose={() => setShowForm(false)} />
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)] sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="size-5 text-[var(--color-primary)]" />
            <div>
              <h2 className="font-bold text-[var(--color-text-primary)]">Danh sách gói thầu</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Lọc theo dự án hoặc trạng thái để tìm nhanh hồ sơ cần xử lý.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text-primary)]">{filteredPackages.length}</span>
            <span>/ {allPackages.length} gói thầu</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(280px,1.7fr)_minmax(220px,1fr)_minmax(180px,0.75fr)_auto]">
          <label className="relative block">
            <span className="sr-only">Tìm kiếm gói thầu</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="search"
              placeholder="Tìm theo số hiệu hoặc tên gói thầu..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Lọc theo dự án</span>
            <FunnelIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <select
              value={selectedProjectId ?? ''}
              onChange={(event) => setSelectedProjectId(event.target.value ? Number(event.target.value) : null)}
              className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Tất cả dự án</option>
              {biddingProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          </label>

          <label className="relative block">
            <span className="sr-only">Lọc theo trạng thái</span>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as BiddingStatus | '')}
              className="w-full appearance-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] py-2.5 pl-3 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Tất cả trạng thái</option>
              {(Object.keys(BIDDING_STATUS_META) as BiddingStatus[]).map((status) => <option key={status} value={status}>{BIDDING_STATUS_META[status].label}</option>)}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
          </label>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-alt)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowPathIcon className="size-4" />
            Đặt lại
          </button>
        </div>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">
            <span className="font-semibold text-[var(--color-text-secondary)]">Đang áp dụng bộ lọc:</span>
            {searchTerm && <FilterChip label={`Từ khóa: ${searchTerm}`} onRemove={() => setSearchTerm('')} />}
            {selectedProjectId !== null && <FilterChip label={`Dự án: ${projectLabels.get(selectedProjectId) || `#${selectedProjectId}`}`} onRemove={() => setSelectedProjectId(null)} />}
            {selectedStatus && <FilterChip label={`Trạng thái: ${BIDDING_STATUS_META[selectedStatus].label}`} onRemove={() => setSelectedStatus('')} />}
          </div>
        )}

        <DataTable
          items={filteredPackages}
          columns={columns}
          isLoading={isLoading}
          pageSize={10}
          itemLabel="gói thầu"
          emptyMessage={hasFilters ? 'Không có gói thầu nào khớp bộ lọc hiện tại.' : 'Chưa có gói thầu nào được tạo.'}
        />
      </section>

      {viewingPackage && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-4"
          role="presentation"
          onClick={() => setViewingPackage(null)}
        >
          <div
            className="h-[min(920px,calc(100vh-1rem))] w-full max-w-[1280px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl sm:h-[min(920px,calc(100vh-2rem))] sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Chi tiết gói thầu ${viewingPackage.packageName}`}
            onClick={(event) => event.stopPropagation()}
          >
            <BiddingPackageDetail biddingPackage={viewingPackage} onClose={() => setViewingPackage(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: BiddingStatus }) {
  const meta = BIDDING_STATUS_META[status] || {
    label: status || 'Chưa xác định',
    className: 'bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${meta.className}`}>
      <span className={`size-1.5 rounded-full ${meta.dotClass}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 font-medium text-blue-700">
      {label}
      <button type="button" onClick={onRemove} className="rounded p-0.5 hover:bg-blue-100" aria-label={`Bỏ bộ lọc ${label}`}>
        <XMarkIcon className="size-3.5" />
      </button>
    </span>
  );
}

export default BiddingPage;
