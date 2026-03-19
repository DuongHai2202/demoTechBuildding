import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useContract, useContractDrawings, useDeleteDrawing, useContracts } from '../../features/contracts/api/contractApi';
import { StepProgressBar } from '../../features/contracts/components/StepProgressBar';
import { BoqTreeTable } from '../../features/contracts/components/BoqTreeTable';
import { MaterialLimitTab } from '../../features/contracts/components/MaterialLimitTab';
import { AttachmentTab } from '../../features/contracts/components/AttachmentTab';
import { VatSummaryTab } from '../../features/contracts/components/VatSummaryTab';
import { DrawingForm } from '../../features/contracts/components/DrawingForm';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ArrowDownTrayIcon, PencilSquareIcon, XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatCurrency';

const SUB_TABS = [
  'Chi tiết',
  'TT Bảo lãnh',
  'File đính kèm',
  'Bản vẽ',
  'Hạng mục công việc',
  'Thuế VAT',
  'Danh sách vật tư',
  'Vật tư A cấp',
  'Vật tư giao khoán',
  'Hợp đồng liên quan',
];

export default function ContractDetailPage() {
  const { id, contractId } = useParams();
  const projectId = Number(id);
  const cId = Number(contractId);
  const { data: contract, isLoading } = useContract(cId);
  const { data: drawings } = useContractDrawings(cId);
  const deleteDrawingMutation = useDeleteDrawing(cId);
  const [activeSubTab, setActiveSubTab] = useState(4); // Default to "Hạng mục công việc"
  const [showDrawingForm, setShowDrawingForm] = useState(false);

  const handleDeleteDrawing = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa bản vẽ này?')) {
      deleteDrawingMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-[var(--color-text-secondary)]">Không tìm thấy hợp đồng.</p>
        <Link to={`/projects/${projectId}`} className="mt-4 text-[var(--color-primary)] hover:underline">
          Quay lại dự án
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Header */}
      <div className="text-sm text-[var(--color-text-muted)] space-y-1">
        <p>
          <span className="font-medium text-[var(--color-text-primary)]">Dự án:</span> - Chủ đầu tư: {contract.partnerName || '—'} -
        </p>
        <p>
          <span className="font-medium text-[var(--color-text-primary)]">Tên hợp đồng:</span> {contract.contractName}
        </p>
        <p>
          <span className="font-medium text-[var(--color-text-primary)]">Chi tiết thông tin hợp đồng:</span> {contract.contractName}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors">
          <XMarkIcon className="size-4" />
          Hủy
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-100 transition-colors">
          <ArrowDownTrayIcon className="size-4" />
          Tải xuống
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          <PencilSquareIcon className="size-4" />
          Chỉnh sửa
        </button>
      </div>

      {/* Workflow Progress Bar */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <StepProgressBar currentStep={contract.workflowStep || 1} />
      </div>

      {/* Sub-Tabs (scrollable) */}
      <div className="border-b border-[var(--color-border)] overflow-x-auto">
        <nav className="flex gap-0 min-w-max">
          {SUB_TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(idx)}
              className={`px-4 pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                idx === activeSubTab
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 0 ? (
        /* Chi tiết */
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[var(--color-text-muted)]">Số hợp đồng</p>
              <p className="font-medium">{contract.contractNumber}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Tên hợp đồng</p>
              <p className="font-medium">{contract.contractName}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Đối tác</p>
              <p className="font-medium">{contract.partnerName || '—'}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Giá trị hợp đồng</p>
              <p className="font-medium">{formatCurrency(contract.contractValue)}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Loại hợp đồng</p>
              <p className="font-medium">
                {contract.type === 'ADDENDUM' ? (
                  <span className="inline-flex items-center gap-1 text-orange-600">
                    Phụ lục hợp đồng (của {contract.parentId})
                  </span>
                ) : 'Hợp đồng gốc'}
              </p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Ngày ký</p>
              <p className="font-medium">{contract.signedDate || '—'}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Thời hạn</p>
              <p className="font-medium">{contract.startDate || '—'} đến {contract.endDate || '—'}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Trạng thái</p>
              <p className="font-medium">{contract.status}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Bước hiện tại</p>
              <p className="font-medium">Bước {contract.workflowStep || 1} / 7</p>
            </div>
          </div>
        </div>
      ) : activeSubTab === 1 ? (
        /* TT Bảo lãnh */
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin bảo lãnh hợp đồng</h3>
          <div className="p-4 rounded-lg bg-[var(--color-surface-alt)] italic text-[var(--color-text-secondary)]">
            {contract.guaranteeInfo || 'Chưa có thông tin bảo lãnh được thiết lập cho hợp đồng này.'}
          </div>
        </div>
      ) : activeSubTab === 2 ? (
        /* File đính kèm */
        <AttachmentTab contractId={cId} />
      ) : activeSubTab === 3 ? (
        /* Bản vẽ */
        // ...Existing drawing list logic...
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Danh sách bản vẽ</h3>
            <button
              onClick={() => setShowDrawingForm(!showDrawingForm)}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="size-4" />
              {showDrawingForm ? 'Hủy' : 'Thêm bản vẽ'}
            </button>
          </div>
          {/* ...Form and Table... */}
          {showDrawingForm && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <DrawingForm projectId={projectId} contractId={cId} onClose={() => setShowDrawingForm(false)} />
            </div>
          )}
          <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-alt)]">
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)] w-12 text-center">STT</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Tên bản vẽ</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Số hiệu</th>
                  <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Phiên bản</th>
                  <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {(drawings || []).length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">Chưa có bản vẽ.</td></tr>
                ) : (
                  (drawings || []).map((d, idx) => (
                    <tr key={d.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors">
                      <td className="px-4 py-3 text-center">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-[var(--color-primary)]">{d.name}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{d.drawingNumber || '—'}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:text-slate-300">
                          {d.version || 'v1.0'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {d.fileUrl && (
                            <a href={d.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-full transition-colors inline-flex">
                              <ArrowDownTrayIcon className="w-5 h-5" />
                            </a>
                          )}
                          <button onClick={() => handleDeleteDrawing(d.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-full transition-colors disabled:opacity-50 inline-flex">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSubTab === 4 ? (
        /* Hạng mục công việc */
        <BoqTreeTable contractId={cId} />
      ) : activeSubTab === 5 ? (
        /* Thuế VAT */
        <VatSummaryTab contractId={cId} />
      ) : activeSubTab === 6 ? (
        /* Danh sách vật tư (Tất cả) */
        <MaterialLimitTab contractId={cId} />
      ) : activeSubTab === 7 ? (
        /* Vật tư A cấp */
        <MaterialLimitTab contractId={cId} filterType="OWNER_SUPPLIED" />
      ) : activeSubTab === 8 ? (
        /* Vật tư giao khoán */
        <MaterialLimitTab contractId={cId} filterType="CONTRACTOR_SUPPLIED" />
      ) : activeSubTab === 9 ? (
        /* Hợp đồng liên quan */
        <RelatedContractsTab contract={contract} />
      ) : (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <p className="text-[var(--color-text-muted)] italic">Tính năng "{SUB_TABS[activeSubTab]}" đang được cập nhật.</p>
        </div>
      )}
    </div>
  );
}

function RelatedContractsTab({ contract }: { contract: any }) {
  const { data: allContracts } = useContracts();
  const parentId = contract.type === 'MAIN' ? contract.id : contract.parentId;
  
  const related = (allContracts || []).filter(c => 
    c.id === parentId || c.parentId === parentId
  ).filter(c => c.id !== contract.id);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h3 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Lịch sử phụ lục & Hợp đồng liên quan</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 italic">Gốc: Hợp đồng #{parentId}</p>
        
        <div className="space-y-4">
          {related.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-text-muted)] border-t border-[var(--color-border)] pt-8">
              Chưa có phụ lục hoặc hợp đồng liên quan nào được ghi nhận.
            </div>
          ) : (
            related.map(c => (
              <Link 
                key={c.id} 
                to={`/projects/${c.projectId}/contracts/${c.id}`}
                className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-surface-alt)] hover:shadow-md transition-all group"
              >
                <div>
                  <p className="font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">{c.contractName}</p>
                  <p className="text-xs text-[var(--color-text-muted)] uppercase mt-1">{c.contractNumber} • {c.type === 'MAIN' ? 'Gốc' : 'Phụ lục'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-emerald-600">{formatCurrency(c.contractValue)}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{c.status}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
