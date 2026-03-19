import { useState } from 'react';
import { useContractMaterialLimits, useSetContractMaterialLimit } from '../api/contractApi';
import { useMaterials } from '../../materials/api/materialApi';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';

interface MaterialLimitTabProps {
  contractId: number;
  filterType?: 'OWNER_SUPPLIED' | 'CONTRACTOR_SUPPLIED'; // New filter prop
}

export function MaterialLimitTab({ contractId, filterType }: MaterialLimitTabProps) {
  const { data: limits, isLoading: loadingLimits } = useContractMaterialLimits(contractId);
  const { data: materials } = useMaterials();
  const setLimitMutation = useSetContractMaterialLimit();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | ''>('');
  const [limitQuantity, setLimitQuantity] = useState<number | ''>('');
  const [limitType, setLimitType] = useState<'OWNER_SUPPLIED' | 'CONTRACTOR_SUPPLIED'>('CONTRACTOR_SUPPLIED');
  const [notes, setNotes] = useState('');

  const handleAddLimit = async () => {
    if (!selectedMaterialId || !limitQuantity) return;
    
    try {
      await setLimitMutation.mutateAsync({
        contractId,
        materialId: Number(selectedMaterialId),
        limitQuantity: Number(limitQuantity),
        type: limitType,
        notes
      });
      setShowForm(false);
      setSelectedMaterialId('');
      setLimitQuantity('');
      setNotes('');
    } catch (error) {
      console.error('Error setting material limit:', error);
    }
  };

  const filteredLimits = filterType 
    ? (limits || []).filter(l => l.type === filterType)
    : (limits || []);

  if (loadingLimits) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Hạn mức vật tư theo hợp đồng</h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="size-4" />
          {showForm ? 'Hủy' : 'Thiết lập hạn mức'}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Vật tư</label>
              <select 
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              >
                <option value="">-- Chọn vật tư --</option>
                {materials?.map(m => (
                  <option key={m.id} value={m.id}>{m.nameVi || 'Chưa có tên'} ({m.unit})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Hạn mức cấp</label>
              <input 
                type="number"
                value={limitQuantity}
                onChange={(e) => setLimitQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Phân loại</label>
              <select 
                value={limitType}
                onChange={(e) => setLimitType(e.target.value as any)}
                className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              >
                <option value="CONTRACTOR_SUPPLIED">Vật tư giao khoán</option>
                <option value="OWNER_SUPPLIED">Vật tư A cấp</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">Ghi chú</label>
            <input 
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú điều kiện cấp..."
              className="w-full p-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button 
              onClick={handleAddLimit}
              disabled={setLimitMutation.isPending}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {setLimitMutation.isPending ? 'Đang lưu...' : 'Lưu hạn mức'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-surface-alt)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Tên vật tư</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Đơn vị</th>
              {!filterType && <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Loại</th>}
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Hạn mức</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Ghi chú</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)] w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filteredLimits.length === 0 ? (
              <tr>
                <td colSpan={filterType ? 5 : 6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                  Chưa có hạn mức vật tư nào được thiết lập.
                </td>
              </tr>
            ) : (
              filteredLimits.map((l) => (
                <tr key={l.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)]/30">
                  <td className="px-4 py-3 font-medium">{l.materialName}</td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-muted)]">{l.materialUnit}</td>
                  {!filterType && (
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.type === 'OWNER_SUPPLIED' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {l.type === 'OWNER_SUPPLIED' ? 'A cấp' : 'Giao khoán'}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-right font-bold text-[var(--color-primary)]">
                    {new Intl.NumberFormat('vi-VN').format(l.limitQuantity)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{l.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-rose-500 rounded-full transition-colors">
                      <TrashIcon className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
