import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateRfi } from '../api/rfiApi';
import { useProjectMembers } from '../../projects/api/projectApi';
import { useDesignSheets } from '../api/designApi';
import type { ProjectMember } from '../../projects/types/project.types';
import { XMarkIcon } from '@heroicons/react/24/outline';

const schema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  question: z.string().min(1, 'Nội dung câu hỏi là bắt buộc'),
  suggestedSolution: z.string(),
  assignedTo: z.string(),
  designSheetId: z.string(),
  status: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function RfiForm({ 
  projectId, 
  onClose 
}: { 
  projectId: number, 
  onClose: () => void 
}) {
  const createRfi = useCreateRfi();
  const { data: members } = useProjectMembers(projectId);
  const { data: sheets } = useDesignSheets(projectId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: '',
      question: '',
      suggestedSolution: '',
      assignedTo: '',
      designSheetId: '',
      status: 'OPEN'
    }
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (data: FormValues) => {
    createRfi.mutate({
      title: data.title,
      question: data.question,
      suggestedSolution: data.suggestedSolution || undefined,
      assignedTo: data.assignedTo ? Number(data.assignedTo) : undefined,
      designSheetId: data.designSheetId ? Number(data.designSheetId) : undefined,
      status: data.status as any,
      projectId
    }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 px-6 py-4">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Tạo yêu cầu làm rõ (RFI)</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--color-border)] transition-colors">
            <XMarkIcon className="size-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Tiêu đề RFI</label>
            <input 
              {...register('title')}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              placeholder="Vd: Sai khác vị trí cột tại trục A-1"
            />
            {errors.title && <p className="text-[10px] text-rose-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Nội dung câu hỏi</label>
            <textarea 
              {...register('question')}
              rows={4}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all resize-none"
              placeholder="Mô tả chi tiết vấn đề cần làm rõ..."
            />
            {errors.question && <p className="text-[10px] text-rose-500">{errors.question.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Đề xuất giải quyết (Nếu có)</label>
            <textarea 
              {...register('suggestedSolution')}
              rows={2}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all resize-none"
              placeholder="Nêu phương án xử lý đề xuất từ hiện trường..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Giao cho xử lý</label>
              <select 
                {...register('assignedTo')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="">Chọn nhân sự</option>
                {members?.map((m: ProjectMember) => (
                  <option key={m.id} value={m.userId}>{m.fullName} ({m.assignedRole})</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Bản vẽ liên quan</label>
              <select 
                {...register('designSheetId')}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="">Chọn bản vẽ</option>
                {sheets?.map(s => (
                  <option key={s.id} value={s.id}>[{s.sheetNumber}] {s.title}</option>
                ))}
              </select>
            </div>
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
              disabled={createRfi.isPending}
              className="rounded-lg bg-[var(--color-primary)] px-6 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {createRfi.isPending ? 'Đang tạo...' : 'Tạo RFI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
