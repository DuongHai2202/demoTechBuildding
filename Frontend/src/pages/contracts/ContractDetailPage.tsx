import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useContract, useContractDrawings, useDeleteDrawing, useContracts, useContractAttachments, useDownloadContract } from '../../features/contracts/api/contractApi';
import { StepProgressBar } from '../../features/contracts/components/StepProgressBar';
import { ContractWorkflowPanel } from '../../features/contracts/components/ContractWorkflowPanel';
import { GuaranteeInfoTab } from '../../features/contracts/components/GuaranteeInfoTab';
import { BoqTreeTable } from '../../features/contracts/components/BoqTreeTable';
import { MaterialLimitTab } from '../../features/contracts/components/MaterialLimitTab';
import { AttachmentTab } from '../../features/contracts/components/AttachmentTab';
import { VatSummaryTab } from '../../features/contracts/components/VatSummaryTab';
import { DrawingForm } from '../../features/contracts/components/DrawingForm';
import { LoadingSkeleton } from '../../components/LoadingSkeleton';
import { ArrowDownTrayIcon, PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatCurrency';
import { useActionDialog } from '../../components/ui/ActionDialog';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { toast } from 'sonner';
import { useAuthStore } from '../../features/auth/stores/authStore';
import { hasPermission } from '../../features/auth/authorization';

const DRAWING_PAGE_SIZE = 10;
const RELATED_CONTRACT_PAGE_SIZE = 6;

const SUB_TABS = [
  'Chi tiết',
  'TT Bảo lãnh',
  'File đính kèm',
  'Bản vẽ',
  'Hạng mục công việc',
  'Thuế VAT',
  'Danh sách vật tư',
  'Hợp đồng liên quan',
];

export default function ContractDetailPage() {
  const { confirm } = useActionDialog();
  const { id, contractId } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);
  const cId = Number(contractId);
  const user = useAuthStore((state) => state.user);
  const canManageContracts = hasPermission(user, 'CONTRACT_MANAGE');
  const { data: contract, isLoading } = useContract(cId);
  const { data: attachments } = useContractAttachments(cId);
  const { data: drawings } = useContractDrawings(cId);
  const deleteDrawingMutation = useDeleteDrawing(cId);
  const downloadMutation = useDownloadContract();
  const [activeSubTab, setActiveSubTab] = useState(0); // Mặc định mở phần "Chi tiết"
  const [showDrawingForm, setShowDrawingForm] = useState(false);
  const [drawingPage, setDrawingPage] = useState(1);
  const drawingList = drawings || [];
  const totalDrawingPages = Math.max(1, Math.ceil(drawingList.length / DRAWING_PAGE_SIZE));
  const currentDrawingPage = Math.min(drawingPage, totalDrawingPages);
  const paginatedDrawings = drawingList.slice((currentDrawingPage - 1) * DRAWING_PAGE_SIZE, currentDrawingPage * DRAWING_PAGE_SIZE);
  const hasContractDocument = Boolean(contract?.fileUrl || attachments?.length);

  useEffect(() => {
    setDrawingPage(1);
  }, [cId, drawings?.length]);

  const handleDeleteDrawing = async (id: number) => {
    if (await confirm({
      title: 'Xóa bản vẽ',
      description: 'Bản vẽ này sẽ bị xóa khỏi hợp đồng. Bạn có chắc muốn tiếp tục?',
      confirmLabel: 'Xóa bản vẽ',
      variant: 'danger',
    })) {
      deleteDrawingMutation.mutate(id);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadMutation.mutateAsync({
        id: cId,
        fallbackFileName: `${contract?.contractNumber || `hop-dong-${cId}`}.pdf`,
      });
    } catch {
      toast.error('Không thể tải tài liệu. Hợp đồng có thể chưa có file hoặc file đã bị xóa.');
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
          <span className="font-medium text-[var(--color-text-primary)]">Dự án:</span>{' '}
          {contract.projectName || `Dự án #${contract.projectId}`} - Chủ đầu tư: {contract.partnerName || '—'}
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
        <button
          type="button"
          onClick={handleDownload}
          disabled={!hasContractDocument || downloadMutation.isPending}
          title={hasContractDocument ? 'Tải xuống tài liệu hợp đồng' : 'Hợp đồng chưa có tài liệu'}
          className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="size-4" />
          {downloadMutation.isPending ? 'Đang tải...' : hasContractDocument ? 'Tải xuống' : 'Chưa có tài liệu'}
        </button>
        {canManageContracts && (
          <button
            type="button"
            onClick={() => navigate('/contracts', { state: { editContractId: cId } })}
            className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            <PencilSquareIcon className="size-4" />
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* Workflow Progress Bar */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <StepProgressBar currentStep={contract.workflowStep || 1} />
      </div>

      <ContractWorkflowPanel contract={contract} />

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
              <StatusBadge status={contract.status} />
            </div>
            <div>
              <p className="text-[var(--color-text-muted)]">Bước hiện tại</p>
              <p className="font-medium">Bước {contract.workflowStep || 1} / 7</p>
            </div>
          </div>
        </div>
      ) : activeSubTab === 1 ? (
        /* TT Bảo lãnh */
        <GuaranteeInfoTab contract={contract} canManage={canManageContracts} />
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
          <div className="space-y-4">
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
                  {drawingList.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">Chưa có bản vẽ.</td></tr>
                  ) : (
                    paginatedDrawings.map((d, idx) => (
                      <tr key={d.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors">
                        <td className="px-4 py-3 text-center">{(currentDrawingPage - 1) * DRAWING_PAGE_SIZE + idx + 1}</td>
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
            <Pagination
              page={currentDrawingPage}
              pageSize={DRAWING_PAGE_SIZE}
              total={drawingList.length}
              onPageChange={setDrawingPage}
              itemLabel="bản vẽ"
              ariaLabel="Phân trang bản vẽ"
            />
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
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(related.length / RELATED_CONTRACT_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRelated = related.slice((currentPage - 1) * RELATED_CONTRACT_PAGE_SIZE, currentPage * RELATED_CONTRACT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [parentId, related.length]);

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
            paginatedRelated.map(c => (
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
          <Pagination
            page={currentPage}
            pageSize={RELATED_CONTRACT_PAGE_SIZE}
            total={related.length}
            onPageChange={setPage}
            itemLabel="hợp đồng liên quan"
            ariaLabel="Phân trang hợp đồng liên quan"
          />
        </div>
      </div>
    </div>
  );
}
