import { useState } from 'react';
import { useCreateMasterPlanItem, useMasterPlan } from '../api/projectApi';
import type { CreateMasterPlanRequest } from '../types/masterPlan.types';

interface MasterPlanFormProps {
  projectId: number;
  onClose: () => void;
}

export function MasterPlanForm({ projectId, onClose }: MasterPlanFormProps) {
  const { data: items } = useMasterPlan(projectId);
  const createItem = useCreateMasterPlanItem(projectId);
  
  const [formData, setFormData] = useState<CreateMasterPlanRequest>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    parentId: undefined,
    displayOrder: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createItem.mutate(formData, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  // Simple recursive function to flatten items for parent selector
  const flattenItems = (items: any[], level = 0): any[] => {
    return items.reduce((acc, item) => {
      acc.push({ ...item, level });
      if (item.children && item.children.length > 0) {
        acc.push(...flattenItems(item.children, level + 1));
      }
      return acc;
    }, []);
  };

  const options = flattenItems(items || []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Tên hạng mục / công việc</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="VD: Ép cọc móng, Xây thô tầng 1..."
          />
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Mô tả chi tiết</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Ngày bắt đầu</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Ngày kết thúc (dự kiến)</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Thuộc hạng mục cha</label>
          <select
            value={formData.parentId || ''}
            onChange={e => setFormData({ ...formData, parentId: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">— Không có (Hạng mục gốc) —</option>
            {options.map(opt => (
              <option key={opt.id} value={opt.id}>
                {'\u00A0'.repeat(opt.level * 4)}{opt.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase mb-1">Thứ tự hiển thị</label>
          <input
            type="number"
            value={formData.displayOrder}
            onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={createItem.isPending}
          className="btn-primary px-6 py-2 text-sm"
        >
          {createItem.isPending ? 'Đang lưu...' : 'Lưu công việc'}
        </button>
      </div>
    </form>
  );
}
