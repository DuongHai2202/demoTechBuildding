import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateDesignSheet, useUpdateDesignSheet } from '../api/designApi';
import { useZones } from '../../projects/api/projectApi';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { DesignDiscipline, DesignStatus } from '../types/design.types';
import { XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { toast } from 'sonner';

const schema = z.object({
  sheetNumber: z.string().min(1, 'Mã bản vẽ là bắt buộc'),
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  discipline: z.string().min(1, 'Bộ môn là bắt buộc'),
  revision: z.string().min(1, 'Phiên bản là bắt buộc'),
  status: z.string().min(1, 'Trạng thái là bắt buộc'),
  issuedAt: z.string().min(1, 'Ngày phát hành là bắt buộc'),
  zoneId: z.number().optional(),
  fileUrl: z.string().min(1, 'Vui lòng tải lên file bản vẽ'),
});

type FormValues = z.infer<typeof schema>;

export function DesignSheetForm({ 
  projectId, 
  zoneId, 
  initialData,
  onClose 
}: { 
  projectId: number, 
  zoneId?: number, 
  initialData?: any,
  onClose: () => void 
}) {
  const createSheet = useCreateDesignSheet();
  const updateSheet = useUpdateDesignSheet();
  const { data: zones } = useZones(projectId);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      sheetNumber: initialData.sheetNumber,
      title: initialData.title,
      discipline: initialData.discipline,
      revision: initialData.revision,
      status: initialData.status,
      issuedAt: initialData.issuedAt,
      zoneId: initialData.zoneId,
      fileUrl: initialData.fileUrl
    } : {
      discipline: 'ARCH',
      revision: '00',
      status: 'IFC',
      issuedAt: new Date().toISOString().split('T')[0],
      zoneId: zoneId
    }
  });

  const fileUrl = watch('fileUrl');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'design');
      const { data } = await api.post<ApiResponse<string>>('/files/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValue('fileUrl', data.data);
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Tải file thất bại');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      discipline: data.discipline as DesignDiscipline,
      status: data.status as DesignStatus,
      projectId
    };

    if (initialData?.id) {
      updateSheet.mutate({ id: initialData.id, payload: payload as any }, {
        onSuccess: () => onClose()
      });
    } else {
      createSheet.mutate(payload as any, {
        onSuccess: () => onClose()
      });
    }
  };

  const flattenedZones = (zones: any[]): any[] => {
    let result: any[] = [];
    zones.forEach(z => {
      result.push({ id: z.id, name: z.name });
      if (z.children) result = [...result, ...flattenedZones(z.children)];
    });
    return result;
  };

  const allZones = zones ? flattenedZones(zones) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 px-6 py-4">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            {initialData ? 'Cập nhật hồ sơ thiết kế' : 'Phát hành hồ sơ thiết kế'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--color-border)] transition-colors">
            <XMarkIcon className="size-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Mã bản vẽ</label>
              <input 
                {...register('sheetNumber')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
                placeholder="Vd: A-101"
              />
              {errors.sheetNumber && <p className="text-[10px] text-rose-500">{errors.sheetNumber.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Bộ môn</label>
              <select 
                {...register('discipline')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="ARCH">Kiến trúc</option>
                <option value="STRUC">Kết cấu</option>
                <option value="MEP">Cơ điện (MEP)</option>
                <option value="LANDSCAPE">Cảnh quan</option>
                <option value="INTERIOR">Nội thất</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Tiêu đề bản vẽ</label>
            <input 
              {...register('title')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              placeholder="Vd: Mặt bằng tầng 1 - Khối A"
            />
            {errors.title && <p className="text-[10px] text-rose-500">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Khu vực / Phân khu</label>
              <select 
                {...register('zoneId', { valueAsNumber: true })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="">Chọn khu vực (Không bắt buộc)</option>
                {allZones.map((z: any) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Ngày phát hành</label>
              <input 
                type="date"
                {...register('issuedAt')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Revision</label>
              <input 
                {...register('revision')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Trạng thái phát hành</label>
              <select 
                {...register('status')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="PRELIMINARY">Sơ bộ</option>
                <option value="FOR_REVIEW">Đang thẩm tra</option>
                <option value="IFC">Bản vẽ thi công (IFC)</option>
                <option value="AS_BUILT">Hoàn công</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Tải lên file bản vẽ (PDF/DWG/IFC...)</label>
            <div className="relative group">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className={`w-full rounded-xl border-2 border-dashed p-4 flex flex-col items-center justify-center transition-all ${
                fileUrl ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/30' : 'border-[var(--color-border)] group-hover:border-[var(--color-primary)]'
              }`}>
                {uploading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]" />
                ) : fileUrl ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-primary)]">Đã tải lên file: {fileUrl.split('/').pop()}</span>
                    <button type="button" onClick={() => setValue('fileUrl', '')} className="text-rose-500 text-xs hover:underline">Xóa</button>
                  </div>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="size-6 text-[var(--color-text-muted)] mb-2" />
                    <span className="text-xs text-[var(--color-text-muted)]">Nhấn hoặc kéo thả để tải lên</span>
                  </>
                )}
              </div>
            </div>
            {errors.fileUrl && <p className="text-[10px] text-rose-500">{errors.fileUrl.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={createSheet.isPending || updateSheet.isPending || uploading}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createSheet.isPending || updateSheet.isPending ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
