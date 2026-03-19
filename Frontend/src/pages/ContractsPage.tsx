import { useState } from 'react';
import { useContracts } from '../features/contracts/api/contractApi';
import { ContractList } from '../features/contracts/components/ContractList';
import { ContractForm } from '../features/contracts/components/ContractForm';
import { DocumentCheckIcon, ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function ContractsPage() {
  const { data: contracts, isLoading } = useContracts();
  const [showContractForm, setShowContractForm] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Quản Lý Hợp Đồng
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">Theo dõi pháp lý và giá trị hợp đồng toàn hệ thống.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--color-success-bg)] border border-[var(--color-success)]/10 rounded-2xl">
          <ShieldCheckIcon className="w-5 h-5 text-[var(--color-success)]" />
          <span className="text-sm font-bold text-[var(--color-success)]">Hệ thống bảo mật</span>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-2xl shadow-[var(--shadow-card-theme)] border border-[var(--color-border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2 text-[var(--color-text-primary)]">
            <DocumentCheckIcon className="w-5 h-5 text-[var(--color-primary)]" />
            Danh sách tất cả hợp đồng
          </h2>
          <button
            onClick={() => setShowContractForm(!showContractForm)}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4 text-white" />
            {showContractForm ? 'Hủy bỏ' : 'Thêm hợp đồng'}
          </button>
        </div>
        
        {showContractForm && (
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/30">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <ContractForm onClose={() => setShowContractForm(false)} />
            </div>
          </div>
        )}

        <div className="p-0">
          <ContractList contracts={contracts || []} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
