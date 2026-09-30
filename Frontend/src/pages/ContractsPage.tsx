import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useContracts } from '../features/contracts/api/contractApi';
import { ContractList } from '../features/contracts/components/ContractList';
import { ContractForm } from '../features/contracts/components/ContractForm';
import type { Contract } from '../features/contracts/types/contract.types';
import { DocumentCheckIcon, ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../features/auth/stores/authStore';
import { hasPermission } from '../features/auth/authorization';

export default function ContractsPage() {
  const { data: contracts, isLoading } = useContracts();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const canManageContracts = hasPermission(user, 'CONTRACT_MANAGE');
  const [showContractForm, setShowContractForm] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const isFormOpen = showContractForm || Boolean(editingContract);

  const openCreateForm = () => {
    setEditingContract(null);
    setShowContractForm((current) => !current);
  };

  const openEditForm = (contract: Contract) => {
    setEditingContract(contract);
    setShowContractForm(true);
  };

  const closeForm = () => {
    setEditingContract(null);
    setShowContractForm(false);
  };

  useEffect(() => {
    const editContractId = (location.state as { editContractId?: number } | null)?.editContractId;
    if (!editContractId || !contracts) return;

    const contract = contracts.find((item) => item.id === editContractId);
    if (contract) {
      openEditForm(contract);
    }
    navigate(location.pathname, { replace: true, state: null });
  }, [contracts, location.pathname, location.state, navigate]);

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
          {canManageContracts && (
            <button
              onClick={isFormOpen ? closeForm : openCreateForm}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4 text-white" />
              {isFormOpen ? 'Hủy bỏ' : 'Thêm hợp đồng'}
            </button>
          )}
        </div>
        
        {isFormOpen && (
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/30">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <ContractForm contract={editingContract ?? undefined} onClose={closeForm} />
            </div>
          </div>
        )}

        <div className="p-0">
          <ContractList contracts={contracts || []} isLoading={isLoading} onEdit={openEditForm} />
        </div>
      </div>
    </div>
  );
}
