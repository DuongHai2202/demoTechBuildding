import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateWorkLog } from '../api/worklogApi';
import { useAuthStore } from '../../auth/stores/authStore';
import { PhotoIcon, XMarkIcon, CloudIcon, UsersIcon, ChatBubbleBottomCenterTextIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  logDate: z.string().min(1, 'Vui lòng chọn ngày'),
  content: z.string().min(10, 'Nội dung phải ít nhất 10 ký tự'),
  weatherCondition: z.string().min(1, 'Vui lòng nhập tình hình thời tiết'),
  workerCount: z.number().min(0, 'Số lượng nhân công không hợp lệ'),
});

type FormData = z.infer<typeof schema>;

interface WorkLogFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export function WorkLogForm({ projectId, onSuccess }: WorkLogFormProps) {
  const user = useAuthStore(state => state.user);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const createMutation = useCreateWorkLog();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      logDate: new Date().toISOString().split('T')[0],
      weatherCondition: 'Nắng ráo',
      workerCount: 0
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: any) => {
    const validatedData = data as FormData;
    if (!user) return;

    const jsonPart = {
      projectId,
      userId: user.id,
      logDate: validatedData.logDate,
      content: validatedData.content,
      weatherCondition: validatedData.weatherCondition,
      workerCount: validatedData.workerCount
    };

    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(jsonPart)], { type: 'application/json' }));

    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await createMutation.mutateAsync({ projectId, formData });
      reset();
      setSelectedFiles([]);
      setPreviews([]);
      onSuccess?.();
    } catch (error) {
      console.error('Lỗi khi ghi nhật ký:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-500" />
            Ngày ghi nhật ký
          </label>
          <input
            type="date"
            {...register('logDate')}
            className={`w-full p-2.5 rounded-lg border bg-[var(--color-bg)] text-[var(--color-text-primary)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
              errors.logDate ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          />
          {errors.logDate && (
            <p className="mt-1 text-xs text-red-500">{errors.logDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5 flex items-center gap-2">
            <CloudIcon className="w-4 h-4 text-sky-500" />
            Tình hình thời tiết
          </label>
          <input
            {...register('weatherCondition')}
            placeholder="Ví dụ: Nắng ráo, Mưa nhỏ..."
            className={`w-full p-2.5 rounded-lg border bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
              errors.weatherCondition ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          />
          {errors.weatherCondition && (
            <p className="mt-1 text-xs text-red-500">{errors.weatherCondition.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5 flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-emerald-500" />
            Số lượng nhân công
          </label>
          <input
            type="number"
            {...register('workerCount', { valueAsNumber: true })}
            className={`w-full p-2.5 rounded-lg border bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 ${
              errors.workerCount ? 'border-red-500' : 'border-[var(--color-border)]'
            }`}
          />
          {errors.workerCount && (
            <p className="mt-1 text-xs text-red-500">{errors.workerCount.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-1.5 flex items-center gap-2">
          <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-[var(--color-primary)]" />
          Nội dung công việc
        </label>
        <textarea
          {...register('content')}
          rows={4}
          placeholder="Mô tả chi tiết các hạng mục đã thi công trong ngày..."
          className={`w-full p-3 rounded-lg border bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none ${
            errors.content ? 'border-red-500' : 'border-[var(--color-border)]'
          }`}
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
          <PhotoIcon className="w-4 h-4 text-violet-500" />
          Hình ảnh thực tế ({selectedFiles.length})
        </label>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
          {previews.map((src, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[var(--color-border)] group">
              <img src={src} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
            <PlusIcon className="w-6 h-6" />
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={createMutation.isPending}
        className="w-full py-3 rounded-lg bg-[var(--color-primary)] hover:opacity-90 text-white font-bold shadow-lg transition-all disabled:opacity-50"
      >
        {createMutation.isPending ? 'Đang lưu nhật ký...' : 'Hoàn tất & Lưu nhật ký'}
      </button>
    </form>
  );
}
