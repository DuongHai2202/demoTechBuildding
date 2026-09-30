import { useState } from 'react';
import { useCreateZone } from '../api/projectApi';

interface ZoneFormProps {
  projectId: number;
  parentId?: number;
  onClose: () => void;
}

export function ZoneForm({ projectId, parentId, onClose }: ZoneFormProps) {
  const createZone = useCreateZone(projectId);
  const [name, setName] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = name.trim();
    const normalizedCode = zoneCode.trim();
    if (normalizedName.length < 2) {
      setError('Tên vị trí phải có ít nhất 2 ký tự.');
      return;
    }
    if (normalizedCode && !/^[A-Za-z0-9._/-]{2,50}$/.test(normalizedCode)) {
      setError('Mã vị trí chỉ gồm chữ cái, số và các ký tự - . / _.');
      return;
    }
    setError('');

    createZone.mutate({
      name: normalizedName,
      zoneCode: normalizedCode,
      parentId
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-[var(--color-surface-alt)] rounded-lg border border-[var(--color-primary)] shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Tên (Khu vực/Tầng/Căn) <span className="text-rose-500">*</span></label>
          <input
            required
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="VD: Khu A, Tầng 1, P.102..."
            maxLength={120}
          />
        </div>
        <div className="w-24">
          <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-1">Mã hiệu <span className="font-normal normal-case">(để trống để tự sinh)</span></label>
          <input
            type="text"
            value={zoneCode}
            onChange={e => setZoneCode(e.target.value)}
            className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
            placeholder="A, T1..."
            maxLength={50}
          />
        </div>
      </div>
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={createZone.isPending}
          className="btn-primary px-4 py-1.5 text-xs"
        >
          {createZone.isPending ? 'Đang lưu...' : 'Lưu vị trí'}
        </button>
      </div>
    </form>
  );
}
