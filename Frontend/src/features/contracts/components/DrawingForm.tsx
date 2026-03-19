import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateDrawing } from '../api/contractApi';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import { DocumentPlusIcon, XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  name: z.string().min(1, 'Tên bản vẽ là bắt buộc'),
  drawingNumber: z.string().optional(),
  version: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface DrawingFormProps {
  projectId: number;
  contractId: number;
  onClose: () => void;
}

export function DrawingForm({ projectId, contractId, onClose }: DrawingFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const createMutation = useCreateDrawing();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: FormData) => {
    if (!file) {
      toast.error('Vui lòng tải lên file bản vẽ (PDF/CAD/Image).');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload file
      const uploadFd = new FormData();
      uploadFd.append('file', file);
      uploadFd.append('folder', 'drawings');
      
      const { data: uploadRes } = await api.post<ApiResponse<string>>('/files/upload', uploadFd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = uploadRes.data;

      // 2. Create drawing record
      await createMutation.mutateAsync({
        projectId,
        contractId,
        name: data.name,
        drawingNumber: data.drawingNumber,
        version: data.version,
        fileUrl,
      });

      onClose();
    } catch (error) {
      console.error('Lỗi khi thêm bản vẽ:', error);
      toast.error('Tải lên bản vẽ thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex w-full justify-between items-center border-b border-[var(--color-border)] pb-4">
        <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <DocumentPlusIcon className="w-6 h-6 text-[var(--color-primary)]" />
          Thêm bản vẽ mới
        </h3>
        <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Tên bản vẽ <span className="text-red-500">*</span></label>
          <input 
            {...register('name')}
            placeholder="VD: Bản vẽ mặt bằng thi công..."
            className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Số hiệu</label>
            <input 
              {...register('drawingNumber')}
              placeholder="VD: ARC-01"
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Phiên bản</label>
            <input 
              {...register('version')}
              placeholder="VD: v1.0, Rev 2"
              className="w-full p-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-6 border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-bg)] transition-colors group">
          <label className="flex flex-col items-center justify-center cursor-pointer text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
            <PaperClipIcon className="w-8 h-8 mb-3" />
            <span className="text-sm font-medium text-[var(--color-text-primary)] text-center">
              {file ? file.name : "Tải lên file bản vẽ (PDF, DWG, Image)"}
            </span>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            />
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] font-medium hover:bg-[var(--color-surface-alt)] transition-colors"
          >
            Hủy
          </button>
          <button 
            type="submit"
            disabled={uploading || createMutation.isPending}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:opacity-90 shadow-sm transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {(uploading || createMutation.isPending) && (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            )}
            {(uploading || createMutation.isPending) ? "Đang xử lý..." : "Lưu bản vẽ"}
          </button>
        </div>
      </form>
    </div>
  );
}
