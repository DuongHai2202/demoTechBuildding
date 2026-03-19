import { useParams, Link } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import { useProject, useProjectSlides, useCreateSlide, useDeleteSlide, useMyProjectPermission } from '../../features/projects/api/projectApi';
import { toast } from 'sonner';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { StatusBadge } from '../../components/StatusBadge';
import { MemberManager } from '../../features/projects/components/MemberManager';
import { WorkLogList } from '../../features/worklogs/components/WorkLogList';
import { WorkLogForm } from '../../features/worklogs/components/WorkLogForm';
import { ZoneList } from '../../features/projects/components/ZoneList';
import { MasterPlanList } from '../../features/projects/components/MasterPlanList';

import {
  PencilSquareIcon,
  PlusIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CameraIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { ContractList } from '../../features/contracts/components/ContractList';
import { ContractForm } from '../../features/contracts/components/ContractForm';
import { useProjectContracts } from '../../features/contracts/api/contractApi';
import { api } from '../../services/axiosInstance';
import type { ApiResponse } from '../../types/api.types';
import { DesignModule } from '../../features/design/components/DesignModule';
import { BiddingModule } from '../../features/bidding/components/BiddingModule';
import { MaterialModule } from '../../features/materials/components/MaterialModule';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' }> = {
  PLANNING: { label: 'Đang nghiên cứu', variant: 'warning' },
  IN_PROGRESS: { label: 'Đang thi công', variant: 'info' },
  COMPLETED: { label: 'Hoàn thành', variant: 'success' },
  SUSPENDED: { label: 'Tạm dừng', variant: 'danger' },
};

const TABS = [
  'Kế hoạch tổng thể',
  'Khu vực & Vị trí',
  'Hồ sơ & BIM',
  'Nhân sự tham gia',
  'Nhật ký thi công',
  'Hợp đồng dự án',
  'Đấu thầu & Chọn thầu',
  'Vật tư & Định mức',
  'Hình ảnh dự án',
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { data: project, isLoading } = useProject(projectId);
  const { data: slides } = useProjectSlides(projectId);
  const createSlide = useCreateSlide(projectId);
  const deleteSlide = useDeleteSlide(projectId);
  const [activeTab, setActiveTab] = useState(0);
  const [showWorkLogForm, setShowWorkLogForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);
  const { data: contracts, isLoading: isLoadingContracts } = useProjectContracts(projectId);
  const permissions = useMyProjectPermission(projectId);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const uploadAndCreateSlides = useCallback(async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setUploading(true);
    try {
      let urls: string[] = [];

      if (imageFiles.length === 1) {
        const fd = new FormData();
        fd.append('file', imageFiles[0]);
        fd.append('folder', 'projects');
        const { data } = await api.post<ApiResponse<string>>('/files/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        urls = [data.data];
      } else {
        const fd = new FormData();
        imageFiles.forEach(f => fd.append('files', f));
        fd.append('folder', 'projects');
        const { data } = await api.post<ApiResponse<string[]>>('/files/upload-multiple', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        urls = data.data;
      }

      // Create slides for each uploaded URL
      const existingCount = slides?.length || 0;
      for (let i = 0; i < urls.length; i++) {
        await createSlide.mutateAsync({
          imageUrl: urls[i],
          caption: imageFiles[i].name.replace(/\.[^/.]+$/, ''),
          displayOrder: existingCount + i + 1,
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  }, [createSlide, slides]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    uploadAndCreateSlides(e.dataTransfer.files);
  }, [uploadAndCreateSlides]);

  const handleDeleteSlide = (slideId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      deleteSlide.mutate(slideId);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">Không tìm thấy thông tin dự án.</p>
        <Link to="/projects" className="mt-4 text-[var(--color-primary)] hover:underline">Quay lại danh sách</Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[project.status] || STATUS_MAP.PLANNING;
  const firstSlide = slides?.[0];

  return (
    <div className="space-y-8">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Link to="/projects" className="hover:text-[var(--color-primary)] transition-colors">Dự án</Link>
          <span>/</span>
          <span className="text-[var(--color-text-primary)] font-medium">Thông tin dự án</span>
        </div>
        {permissions.canEditProject && (
          <Link
            to={`/projects/${projectId}/edit`}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            <PencilSquareIcon className="size-4" />
            Cập nhật
          </Link>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
        Dự án: {project.name}
      </h1>

      {/* Project Avatar & Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col items-center justify-center shadow-sm">
          <div
            className="w-full max-w-[240px] aspect-square rounded-full overflow-hidden border-4 border-[var(--color-border)] bg-[var(--color-surface-alt)] relative group cursor-pointer shadow-md"
            onClick={(e) => {
              if (!permissions.canEditProject) return;
              e.stopPropagation();
              avatarInputRef.current?.click();
            }}
          >
            {firstSlide ? (
              <img
                src={firstSlide.imageUrl}
                alt={project.name}
                className="size-full object-cover relative z-0"
                onError={(e) => {
                  // Fallback khi ảnh từ minIO bị lỗi
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(project.name)}&background=random&size=512`;
                }}
              />
            ) : (
              <div className="size-full flex items-center justify-center text-[var(--color-text-muted)] text-6xl font-bold relative z-0">
                {project.name.charAt(0)}
              </div>
            )}
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10 pointer-events-none">
              <CameraIcon className="h-8 w-8 text-white" />
              <span className="text-white text-sm font-medium">Thay đổi ảnh dự án</span>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files?.length) {
                  uploadAndCreateSlides(e.target.files);
                  e.target.value = '';
                }
              }}
            />
          </div>
          <p className="mt-4 text-sm text-[var(--color-text-muted)] text-center">
            Nhấn vào ảnh để cập nhật hình ảnh đại diện cho dự án
          </p>
        </div>

        {/* Info Grid Card */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:col-span-2 shadow-sm">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 border-b border-[var(--color-border)] pb-4">
            Thông tin chung
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Tên dự án</p>
              <p className="font-medium text-[var(--color-text-primary)] text-base">{project.name}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Mã dự án</p>
              <p className="font-medium text-[var(--color-text-primary)] text-base">{project.projectCode || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[var(--color-text-muted)] mb-1">Địa chỉ / Quận Huyện</p>
              <p className="font-medium text-[var(--color-text-primary)] text-base leading-relaxed">{project.address || '—'}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Trạng thái</p>
              <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
            </div>
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Ngày cập nhật</p>
              <p className="font-medium text-[var(--color-text-primary)] text-base">
                {project.startDate ? new Date(project.startDate).toLocaleDateString('vi-VN') : '—'}
              </p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)] mb-1">Ngày khởi tạo</p>
              <p className="font-[var(--color-text-secondary)]">
                {project.createdAt ? new Date(project.createdAt).toLocaleString('vi-VN') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)]">
        <nav className="flex gap-0">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-6 pb-3 text-sm font-medium transition-colors border-b-2 ${idx === activeTab
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 0 ? (
        <MasterPlanList projectId={projectId} />
      ) : activeTab === 1 ? (
        <ZoneList projectId={projectId} />
      ) : activeTab === 2 ? (
        <DesignModule projectId={projectId} />
      ) : activeTab === 3 ? (
        <MemberManager projectId={projectId} />
      ) : activeTab === 4 ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-blue-500">
                 Hạng mục công việc & Nhật ký
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1 font-semibold">
                Theo dõi tiến độ thi công hàng ngày và quản lý phê duyệt báo cáo hiện trường.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl text-xs font-bold border border-[var(--color-primary)]/20">
                <ShieldCheckIcon className="w-4 h-4" />
                Workflow Đảm bảo
              </div>
              {permissions.canCreateWorkLog && (
                <button
                  onClick={() => setShowWorkLogForm(!showWorkLogForm)}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-2xl shadow-xl shadow-[var(--color-primary)]/20 active:scale-95 transition-all"
                >
                  <PencilSquareIcon className="size-4 stroke-2" />
                  {showWorkLogForm ? 'Đóng biểu mẫu' : 'Ghi nhật ký mới'}
                </button>
              )}
            </div>
          </div>
          {showWorkLogForm && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <WorkLogForm projectId={projectId} onSuccess={() => setShowWorkLogForm(false)} />
            </div>
          )}
          <WorkLogList projectId={projectId} />
        </div>
      ) : activeTab === 5 ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Hợp đồng dự án</h3>
            {permissions.canManageContracts && (
              <button
                onClick={() => setShowContractForm(!showContractForm)}
                className="btn-primary flex items-center gap-2"
              >
                <PlusIcon className="size-4" />
                {showContractForm ? 'Hủy' : 'Thêm hợp đồng'}
              </button>
            )}
          </div>
          {showContractForm && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <ContractForm initialProjectId={projectId} onClose={() => setShowContractForm(false)} />
            </div>
          )}
          <ContractList contracts={contracts || []} isLoading={isLoadingContracts} projectId={projectId} />
        </div>
      ) : activeTab === 6 ? (
        <BiddingModule projectId={projectId} />
      ) : activeTab === 7 ? (
        <MaterialModule projectId={projectId} />
      ) : activeTab === 8 ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Hình ảnh dự án
              {slides && slides.length > 0 && (
                <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
                  ({slides.length} ảnh)
                </span>
              )}
            </h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang tải...
                </>
              ) : (
                <>
                  <PlusIcon className="size-4" />
                  Thêm ảnh
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files?.length) {
                  uploadAndCreateSlides(e.target.files);
                  e.target.value = '';
                }
              }}
            />
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${dragActive
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg)]'
              }`}
          >
            <div className="flex flex-col items-center gap-3">
              {dragActive ? (
                <ArrowUpTrayIcon className="h-10 w-10 text-[var(--color-primary)] animate-bounce" />
              ) : (
                <PhotoIcon className="h-10 w-10 text-[var(--color-text-muted)]" />
              )}
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {dragActive ? 'Thả ảnh vào đây để tải lên' : 'Kéo thả hoặc nhấn để chọn ảnh'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Hỗ trợ JPG, PNG, WebP. Tối đa 10MB/ảnh. Chọn nhiều file cùng lúc.
                </p>
              </div>
            </div>
          </div>

          {/* Images Grid */}
          {(slides || []).length === 0 && !uploading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <PhotoIcon className="h-12 w-12 text-[var(--color-text-muted)] mb-3" />
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                Chưa có hình ảnh nào. Hãy thêm hình ảnh cho dự án.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(slides || []).map(slide => (
                <div
                  key={slide.id}
                  className="group relative rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm hover:shadow-md transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={slide.imageUrl}
                      alt={slide.caption || ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Caption */}
                  <div className="px-3 py-2 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {slide.caption || 'Không có chú thích'}
                    </p>
                  </div>
                  {/* Delete overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Xóa ảnh"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
