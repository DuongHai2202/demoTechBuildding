import { useState } from 'react';
import { toast } from 'sonner';
import { useContractAttachments, useUploadContractAttachment, useDeleteContractAttachment } from '../api/contractApi';
import { CloudArrowUpIcon, DocumentIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

interface AttachmentTabProps {
  contractId: number;
}

export function AttachmentTab({ contractId }: AttachmentTabProps) {
  const { data: attachments, isLoading } = useContractAttachments(contractId);
  const uploadMutation = useUploadContractAttachment(contractId);
  const deleteMutation = useDeleteContractAttachment(contractId);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({ file });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Tải lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) return <div className="py-10 text-center text-[var(--color-text-muted)]">Đang tải tài liệu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Tài liệu đính kèm</h3>
        <label className={`btn-primary flex items-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <CloudArrowUpIcon className="size-5" />
          {isUploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
          <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(attachments || []).length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)]/30">
            <DocumentIcon className="size-12 mx-auto text-[var(--color-text-muted)] mb-3 opacity-20" />
            <p className="text-[var(--color-text-muted)]">Chưa có tài liệu đính kèm nào.</p>
          </div>
        ) : (
          attachments?.map((file) => (
            <div key={file.id} className="group relative flex items-start gap-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-md transition-all">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <DocumentIcon className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate" title={file.fileName}>
                  {file.fileName}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>•</span>
                  <span>{dayjs(file.createdAt).format('DD/MM/YYYY')}</span>
                </div>
                <p className="mt-1 text-[10px] text-[var(--color-text-muted)] truncate">
                  Tải lên bởi: {file.uploaderName || 'Hệ thống'}
                </p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Tải xuống"
                >
                  <ArrowDownTrayIcon className="size-4" />
                </a>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Xóa"
                >
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
