import { useState } from 'react';
import {
  useBimModels,
  useCreateModel,
  useDeleteModel,
  useUploadBimFile
} from '../api/bimApi';
import {
  ArrowDownTrayIcon,
  TrashIcon,
  CubeIcon,
  CloudArrowUpIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { toast } from 'sonner';

interface RevitFileManagerProps {
  projectId: number;
  zoneId?: number;
}

export function RevitFileManager({ projectId, zoneId }: RevitFileManagerProps) {
  const { data: models, isLoading, refetch } = useBimModels(projectId, zoneId);
  const uploadFileMutation = useUploadBimFile();
  const createModelMutation = useCreateModel();
  const deleteModelMutation = useDeleteModel();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a Revit file
    if (!file.name.toLowerCase().endsWith('.rvt') && !file.name.toLowerCase().endsWith('.ifc')) {
      toast.error('Chỉ hỗ trợ file .rvt (Revit) hoặc .ifc');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Upload to MinIO
      const fileUrl = await uploadFileMutation.mutateAsync({ file, folder: 'bim' });
      setUploadProgress(70);

      // 2. Create metadata record in DB
      await createModelMutation.mutateAsync({
        projectId,
        zoneId,
        modelName: file.name,
        fileUrl,
        fileSize: file.size,
        version: 'v1.0',
        description: `Tải lên bởi người dùng vào lúc ${dayjs().format('HH:mm DD/MM/YYYY')}`
      });

      setUploadProgress(100);
      toast.success('Tải lên file Revit thành công!');
      refetch();
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error?.response?.data?.message || 'Lỗi khi tải file lên');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa file mô hình này?')) return;

    try {
      await deleteModelMutation.mutateAsync(id);
      toast.success('Đã xóa file mô hình');
      refetch();
    } catch (error) {
      toast.error('Lỗi khi xóa file');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[var(--color-surface)] rounded-3xl">
        <ArrowPathIcon className="size-8 text-[var(--color-primary)] animate-spin mb-2" />
        <p className="text-sm text-[var(--color-text-muted)] font-medium italic">Đang tải danh sách mô hình...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface)]">
      {/* Header Container */}
      <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
        <div>
          <h3 className="text-lg font-black text-[var(--color-text-primary)] flex items-center gap-2">
            <CubeIcon className="size-5 text-[var(--color-primary)]" />
            Quản lý File
          </h3>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Quản lý các mô hình cấu trúc</p>
        </div>

        <label className={`
          relative cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-primary-hover)] hover:shadow-lg transition-all
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <CloudArrowUpIcon className="size-5" />
          {isUploading ? 'Đang tải lên...' : 'Tải file lên'}
          <input
            type="file"
            className="hidden"
            accept=".rvt,.ifc"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="px-6 py-3 bg-[var(--color-primary-light)] border-b border-[var(--color-primary)]/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest">Đang tải lên dữ liệu...</span>
            <span className="text-[10px] font-black text-[var(--color-primary)]">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-[var(--color-bg)] rounded-full h-2 overflow-hidden shadow-inner border border-[var(--color-primary)]/5">
            <div
              className="bg-[var(--color-primary)] h-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(59,130,246,0.3)]"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[var(--color-bg)]/50">
        {models?.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
            <div className="size-20 bg-[var(--color-surface-alt)] rounded-full flex items-center justify-center mb-6">
              <CubeIcon className="size-10 text-[var(--color-text-muted)] opacity-20" />
            </div>
            <h4 className="text-lg font-black text-[var(--color-text-primary)]">Chưa có mô hình kết cấu</h4>
            <p className="text-[var(--color-text-muted)] text-sm mt-2 max-w-[280px]">
              Hãy tải lên bản vẽ kết cấu 3D (.rvt hoặc .ifc).
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)] bg-[var(--color-surface)]">
            {models?.map((model) => (
              <div
                key={model.id}
                className="group flex items-center gap-4 p-4 hover:bg-[var(--color-bg)] transition-all duration-300"
              >
                {/* Icon Column */}
                <div className="size-12 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center shrink-0 group-hover:border-[var(--color-primary)] transition-colors">
                  <CubeIcon className="size-6 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Info Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate" title={model.modelName}>
                      {model.modelName}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-[var(--color-surface-alt)] text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider border border-[var(--color-border)]">
                      {model.version || 'v1.0'}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--color-text-disabled)] font-mono">
                      {formatFileSize(model.fileSize)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-4 text-[11px] font-medium text-[var(--color-text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[var(--color-text-disabled)] uppercase tracking-tighter text-[10px] font-black">Cập nhật:</span>
                      <span className="text-[var(--color-text-secondary)] font-bold">{dayjs(model.createdAt).format('DD/MM/YYYY')}</span>
                    </div>
                    {model.description && (
                      <div className="flex items-center gap-1.5 line-clamp-1 max-w-md hidden md:flex">
                        <span className="text-[var(--color-text-disabled)] uppercase tracking-tighter text-[10px] font-black">Ghi chú:</span>
                        <span className="truncate">{model.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <a
                    href={model.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-all"
                    title="Tải về"
                  >
                    <ArrowDownTrayIcon className="size-5" />
                  </a>

                  <button
                    onClick={() => handleDelete(model.id)}
                    className="p-2.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-all"
                    title="Xóa mô hình"
                  >
                    <TrashIcon className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="px-6 py-4 bg-[var(--color-warning-bg)] border-t border-[var(--color-warning)]/10 flex items-center gap-4 animate-in fade-in duration-500">
        <div className="text-[var(--color-warning)] drop-shadow-sm">
          <ExclamationTriangleIcon className="size-6 stroke-[2px]" />
        </div>
        <p className="text-sm font-black text-[var(--color-warning)] tracking-tight">
          Hệ thống tối ưu lưu trữ cho mô hình BIM Kết cấu. Hỗ trợ tối đa 250MB mỗi lần tải lên.
        </p>
      </div>
    </div>
  );
}
