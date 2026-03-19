import React, { useState, useMemo } from 'react';
import { useAllBiddingPackages } from '../features/bidding/api/biddingApi';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  TicketIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { BiddingPackageDetail } from '../features/bidding/components/BiddingPackageDetail';
import { PackageForm } from '../features/bidding/components/PackageForm';
import type { BiddingPackage } from '../features/bidding/types/bidding.types';
import { DataTable, type ColumnDef } from '../components/ui/DataTable';

const BiddingPage: React.FC = () => {
  const { data: allPackages, isLoading } = useAllBiddingPackages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [viewingPackage, setViewingPackage] = useState<BiddingPackage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredPackages = useMemo(() => {
    return allPackages?.filter(pkg => {
      const matchesSearch = pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           pkg.packageCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProjectId ? pkg.projectId === selectedProjectId : true;
      return matchesSearch && matchesProject;
    }) || [];
  }, [allPackages, searchTerm, selectedProjectId]);

  const projects = useMemo(() => {
    return Array.from(new Set(allPackages?.map(p => ({ id: p.projectId, name: `Dự án ID: ${p.projectId}` })) || []));
  }, [allPackages]);

  const BIDDING_COLUMNS: ColumnDef<BiddingPackage>[] = [
    {
      key: 'packageCode',
      header: 'Số hiệu',
      render: (pkg) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          {pkg.packageCode}
        </span>
      )
    },
    {
      key: 'packageName',
      header: 'Tên gói thầu',
      render: (pkg) => (
        <div>
          <div className="font-medium text-[var(--color-primary)] hover:underline cursor-pointer">{pkg.packageName}</div>
          <div className="text-xs text-[var(--color-text-muted)]">Dự án ID: {pkg.projectId}</div>
        </div>
      )
    },
    {
      key: 'budget',
      header: 'Ngân sách',
      render: (pkg) => (
        <span className="font-medium text-[var(--color-text-primary)]">
          {pkg.budget ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pkg.budget) : 'N/A'}
        </span>
      )
    },
    {
      key: 'deadline',
      header: 'Hạn nộp thầu',
      render: (pkg) => (
        <span className="text-[var(--color-danger)] text-xs italic font-medium">
          {dayjs(pkg.deadline).format('DD/MM/YYYY HH:mm')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      align: 'center',
      render: (pkg) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          pkg.status === 'PUBLISHED' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' :
          pkg.status === 'CLOSED' ? 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]' :
          'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
        }`}>
          {pkg.status}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (pkg) => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => setViewingPackage(pkg)}
            className="p-1.5 text-slate-400 hover:text-[var(--color-primary)] rounded-full transition-colors"
            title="Chi tiết"
          >
            <InformationCircleIcon className="w-5 h-5" />
          </button>
          <button 
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors"
            title="Xóa"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Hệ Thống Đấu Thầu
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1 font-semibold">
            Quản lý tập trung các gói thầu và lựa chọn nhà thầu toàn bộ dự án.
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-success-bg)] border border-[var(--color-success)]/10 rounded-2xl shadow-sm">
          <ShieldCheckIcon className="size-5 text-[var(--color-success)]" />
          <span className="text-sm font-bold text-[var(--color-success)]">Hệ thống bảo mật</span>
        </div>
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div className="relative group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
          <input 
            type="text"
            placeholder="Tìm kiếm gói thầu theo mã hoặc tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] outline-none transition-all"
          />
        </div>
        
        <div className="relative">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[var(--color-text-muted)]" />
          <select 
            className="w-full pl-10 pr-10 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-sm focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none appearance-none cursor-pointer"
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : null)}
            value={selectedProjectId || ''}
          >
            <option value="">Tất cả dự án đang đấu thầu</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
            <FunnelIcon className="size-4 opacity-50" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 text-sm text-[var(--color-text-muted)] font-medium pr-2">
            <div className="px-3 py-1 bg-[var(--color-bg)] rounded-lg border border-[var(--color-border)]">
              <span className="text-[var(--color-text-primary)] font-bold">{filteredPackages.length}</span> / <span className="text-[var(--color-text-muted)]">{allPackages?.length || 0}</span> gói thầu
            </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card-theme)] border border-[var(--color-border)] overflow-hidden transition-all duration-300">
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-white dark:bg-[var(--color-surface)]">
          <h2 className="font-bold flex items-center gap-2 text-[var(--color-text-primary)] text-lg">
            <TicketIcon className="w-5 h-5 text-[var(--color-primary)]" />
            Danh sách các gói thầu dự án
          </h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2 px-6 py-2.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            {showForm ? 'Đóng biểu mẫu' : (
              <>
                <PlusIcon className="size-4 stroke-[3px]" />
                Tạo gói thầu mới
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 animate-in slide-in-from-top-2">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
              <PackageForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}

        <div className="p-0">
          <DataTable
            items={filteredPackages}
            columns={BIDDING_COLUMNS}
            isLoading={isLoading}
            emptyMessage="Không tìm thấy gói thầu nào phù hợp."
          />
        </div>
      </div>

      {/* Package Detail Modal (Keep as Modal for complex detail) */}
      {viewingPackage && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
          onClick={() => setViewingPackage(null)}
        >
          <div 
            className="w-full max-w-6xl h-[90vh] max-h-[90vh] bg-[var(--color-surface)] rounded-3xl overflow-hidden cursor-default shadow-2xl border border-[var(--color-border)] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <BiddingPackageDetail 
              biddingPackage={viewingPackage} 
              onClose={() => setViewingPackage(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingPage;
