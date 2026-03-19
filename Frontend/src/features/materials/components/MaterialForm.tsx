import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Material } from '../types/material.types';
import { 
  XMarkIcon, 
  PhotoIcon, 
  TrashIcon,
  CloudArrowUpIcon,
  LinkIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import { useMaterialCategories } from '../api/materialApi';
import { cn } from '../../../lib/utils';

const materialSchema = z.object({
  nameVi: z.string().min(1, 'Tên tiếng Việt là bắt buộc'),
  nameEn: z.string().optional(),
  nameZh: z.string().optional(),
  unit: z.string().min(1, 'Đơn vị tính là bắt buộc'),
  managementCode: z.string().optional(),
  categoryId: z.number().min(1, 'Vui lòng chọn phân loại'),
  catalogueUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  descriptionVi: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionZh: z.string().optional(),
  revitFamilyCategory: z.string().optional(),
  revitCode: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  initialData?: Material | null;
  onSubmit: (data: MaterialFormData & { imageUrl?: string }) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function MaterialForm({ initialData, onSubmit, onClose, isLoading }: MaterialFormProps) {
  const { data: categories } = useMaterialCategories();

  const [activeLang, setActiveLang] = useState<'vi'|'en'|'zh'>('vi');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      nameVi: initialData?.nameVi || '',
      nameEn: initialData?.nameEn || '',
      nameZh: initialData?.nameZh || '',
      unit: initialData?.unit || '',
      managementCode: initialData?.managementCode || '',
      categoryId: initialData?.categoryId || 0,
      catalogueUrl: initialData?.catalogueUrl || '',
      descriptionVi: initialData?.descriptionVi || '',
      descriptionEn: initialData?.descriptionEn || '',
      descriptionZh: initialData?.descriptionZh || '',
      revitFamilyCategory: initialData?.revitFamilyCategory || '',
      revitCode: initialData?.revitCode || '',
    },
  });

  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');
  const [previewFiles, setPreviewFiles] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files)
      .filter(f => f.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    setPreviewFiles(prev => [...prev, ...newFiles]);
  }, []);

  const uploadFilesAndSubmit = async (formData: MaterialFormData) => {
    try {
      setUploading(true);
      let finalImageUrl = imageUrl;

      if (previewFiles.length > 0) {
        const fd = new FormData();
        fd.append('file', previewFiles[0].file);
        fd.append('folder', 'materials');
        const { data } = await api.post<ApiResponse<string>>('/files/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalImageUrl = data.data;
      }

      onSubmit({ ...formData, imageUrl: finalImageUrl });
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-3xl shadow-2xl border border-[var(--color-border)] overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/30">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
              {initialData ? 'Cập nhật phân loại vật tư' : 'Thêm vật tư (PMMS)'}
            </h2>
            <p className="text-xs text-[var(--color-text-muted)]">Cơ sở dữ liệu đa ngôn ngữ & BIM</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(uploadFilesAndSubmit)} className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Phân loại kỹ thuật */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span className="size-5 rounded bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px]">1</span>
              Phân loại & Định danh
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Danh mục (Category) *</label>
                <select
                  {...register('categoryId', { valueAsNumber: true })}
                  className={cn(
                    "w-full bg-[var(--color-bg)] border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all font-medium",
                    errors.categoryId ? "border-red-500 focus:ring-red-100" : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                  )}
                >
                  <option value={0}>-- Chọn phân loại vật tư --</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="mt-1.5 text-[10px] text-red-500 font-bold ">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Mã quản lý (Management Code)</label>
                <input
                  {...register('managementCode')}
                  placeholder="VD: MAT-ELEC-001"
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 transition-all font-mono"
                />
              </div>
            </div>
            
            <div className="bg-[var(--color-bg)] rounded-2xl p-4 border border-[var(--color-border)]">
              <div className="flex border-b border-[var(--color-border)] mb-4 hide-scrollbar overflow-x-auto">
                {(['vi', 'en', 'zh'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all border-b-2",
                      activeLang === lang 
                        ? "border-[var(--color-primary)] text-[var(--color-primary)]" 
                        : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    )}
                  >
                    <LanguageIcon className="size-4" />
                    {lang === 'vi' ? 'Tiếng Việt' : lang === 'en' ? 'English' : '中文 (Chinese)'}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className={cn(activeLang !== 'vi' && "hidden")}>
                  <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Tên vật tư (VI) *</label>
                  <input
                    {...register('nameVi')}
                    placeholder="VD: Ống thép đen DN50 - Hòa Phát"
                    className={cn(
                      "w-full bg-white border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition-all font-bold",
                      errors.nameVi ? "border-red-500 focus:ring-red-100" : "border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)]/10"
                    )}
                  />
                  {errors.nameVi && <p className="mt-1.5 text-[10px] text-red-500 font-bold">{errors.nameVi.message}</p>}
                  
                  <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 mt-3 uppercase tracking-wider">Mô tả chi tiết (VI)</label>
                  <textarea
                    {...register('descriptionVi')}
                    rows={2}
                    className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>

                <div className={cn(activeLang !== 'en' && "hidden")}>
                  <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Tên vật tư (EN)</label>
                  <input
                    {...register('nameEn')}
                    placeholder="E.g: Black Steel Pipe DN50 - Hoa Phat"
                    className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                  />
                  <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 mt-3 uppercase tracking-wider">Mô tả chi tiết (EN)</label>
                  <textarea
                    {...register('descriptionEn')}
                    rows={2}
                    className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>

                <div className={cn(activeLang !== 'zh' && "hidden")}>
                  <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Tên vật tư (ZH)</label>
                  <input
                    {...register('nameZh')}
                    placeholder="E.g: 黑钢管 DN50 - 和发"
                    className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-all font-bold"
                  />
                  <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 mt-3 uppercase tracking-wider">Mô tả chi tiết (ZH)</label>
                  <textarea
                    {...register('descriptionZh')}
                    rows={2}
                    className="w-full bg-white border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Thông số & Media */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span className="size-5 rounded bg-[var(--color-primary)] text-white flex items-center justify-center text-[10px]">2</span>
              Đơn vị & Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Đơn vị tính *</label>
                <input
                  {...register('unit')}
                  placeholder="m, cái, bộ..."
                  className={cn(
                    "w-full bg-[var(--color-bg)] border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] transition-all font-medium",
                    errors.unit ? "border-red-500" : "border-[var(--color-border)]"
                  )}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Catalogue URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
                  <input
                    {...register('catalogueUrl')}
                    placeholder="https://example.com/catalogue.pdf"
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] mb-1.5 uppercase tracking-wider">Hình ảnh đại diện</label>
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="size-32 rounded-2xl border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 flex flex-col items-center justify-center cursor-pointer transition-all shrink-0 overflow-hidden relative group"
                >
                  {(previewFiles.length > 0 || imageUrl) ? (
                    <>
                      <img 
                        src={previewFiles.length > 0 ? previewFiles[0].preview : imageUrl} 
                        className="size-full object-cover" 
                        alt="Preview" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <CloudArrowUpIcon className="size-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <PhotoIcon className="size-8 text-[var(--color-text-muted)] mb-1" />
                      <span className="text-[10px] font-bold text-[var(--color-text-muted)]">Upload Ảnh</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed italic">
                      Kéo thả hoặc nhấn vào ô bên trái để chọn ảnh đại diện cho vật tư. Dung lượng tối đa 5MB. Định dạng JPG, PNG, WEBP.
                    </p>
                  </div>
                  {(previewFiles.length > 0 || imageUrl) && (
                    <button 
                      type="button" 
                      onClick={() => { setPreviewFiles([]); setImageUrl(''); }}
                      className="text-[10px] font-bold text-red-500 flex items-center gap-1 hover:underline"
                    >
                      <TrashIcon className="size-3" /> Gỡ bỏ ảnh
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Revit Integration */}
          <section className="space-y-4 p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
            <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
              <span className="size-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
              Tích hợp BIM / Revit
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-blue-600 mb-1.5 uppercase tracking-wider">Revit Family Category</label>
                <input
                  {...register('revitFamilyCategory')}
                  placeholder="VD: Pipes, Pipe Fittings..."
                  className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-blue-600 mb-1.5 uppercase tracking-wider">Mã Revit (Revit Code)</label>
                <input
                  {...register('revitCode')}
                  placeholder="VD: ST-P-001"
                  className="w-full bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>
          </section>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-bg)]/30 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-all"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit(uploadFilesAndSubmit)}
            disabled={isLoading || uploading}
            className="flex-[2] py-3 rounded-2xl bg-[var(--color-primary)] text-white text-sm font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {(isLoading || uploading) ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {uploading ? 'Đang xử lý media...' : 'Đang lưu...'}
              </>
            ) : (
              'Lưu Cấu Hình Vật Tư'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
