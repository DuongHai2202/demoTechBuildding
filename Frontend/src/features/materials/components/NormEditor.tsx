import { useState } from 'react';
import { useMaterials, useMaterialNorms, useCreateMaterialNorm, useDeleteMaterialNorm } from '../api/materialApi';
import { PlusIcon, TrashIcon, CalculatorIcon } from '@heroicons/react/24/outline';

export function NormEditor({ boqItemId, boqItemName }: { boqItemId: number; boqItemName: string }) {
  const { data: norms } = useMaterialNorms(boqItemId);
  const { data: materials } = useMaterials();
  const createNorm = useCreateMaterialNorm();
  const deleteNorm = useDeleteMaterialNorm();

  const [selectedMaterial, setSelectedMaterial] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');

  const handleAdd = () => {
    if (selectedMaterial && quantity) {
      createNorm.mutate({
        boqItemId,
        materialId: Number(selectedMaterial),
        quantityPerUnit: Number(quantity)
      }, {
        onSuccess: () => {
          setSelectedMaterial('');
          setQuantity('');
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10">
        <CalculatorIcon className="size-5 text-[var(--color-primary)]" />
        <div>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Định mức cho: {boqItemName}</h4>
          <p className="text-[10px] text-[var(--color-text-secondary)]">Thiết lập lượng vật tư tiêu hao cho 1 đơn vị khối lượng công việc</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2">
        <select
          className="col-span-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          value={selectedMaterial}
          onChange={(e) => setSelectedMaterial(Number(e.target.value))}
        >
          <option value="">-- Chọn vật tư --</option>
          {materials?.map(m => (
            <option key={m.id} value={m.id}>{m.nameVi || 'Chưa có tên'} ({m.unit})</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Số lượng"
          className="col-span-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <button
          onClick={handleAdd}
          disabled={!selectedMaterial || !quantity || createNorm.isPending}
          className="col-span-2 flex items-center justify-center rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
        >
          <PlusIcon className="size-5" />
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--color-bg)] border-b border-[var(--color-border)] uppercase text-[var(--color-text-muted)] font-bold">
            <tr>
              <th className="px-4 py-3">Vật tư</th>
              <th className="px-4 py-3 text-right">Định mức</th>
              <th className="px-4 py-3 text-center">ĐVT</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {norms?.map(norm => (
              <tr key={norm.id} className="hover:bg-[var(--color-bg)]/50">
                <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{norm.materialName}</td>
                <td className="px-4 py-3 text-right font-bold text-[var(--color-primary)]">{norm.quantityPerUnit}</td>
                <td className="px-4 py-3 text-center text-[var(--color-text-muted)]">{norm.materialUnit}</td>
                <td className="px-4 py-3 text-right">
                  <button 
                    onClick={() => deleteNorm.mutate({ id: norm.id, boqItemId })}
                    className="text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-colors"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {norms?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-text-muted)] italic">
                  Chưa có định mức nào được thiết lập.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
