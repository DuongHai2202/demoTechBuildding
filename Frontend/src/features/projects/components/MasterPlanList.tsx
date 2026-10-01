import { useEffect, useState } from 'react';
import { useMasterPlan, useMyProjectPermission, useUpdateMasterPlanProgress } from '../api/projectApi';
import type { MasterPlanItem, MasterPlanStatus } from '../types/masterPlan.types';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../../services/apiError';
import { 
  ChevronRightIcon, 
  ChevronDownIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { MasterPlanForm } from './MasterPlanForm';
import { Pagination } from '../../../components/ui/Pagination';

const PAGE_SIZE = 10;

interface MasterPlanListProps {
  projectId: number;
}

export function MasterPlanList({ projectId }: MasterPlanListProps) {
  const { data: items, isLoading } = useMasterPlan(projectId);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const permissions = useMyProjectPermission(projectId);
  const itemList = items || [];

  useEffect(() => {
    setPage(1);
  }, [itemList.length]);

  const totalPages = Math.max(1, Math.ceil(itemList.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedItems = itemList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleExpand = (id: number) => {
    const next = new Set(expandedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedItems(next);
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Kế hoạch tổng thể</h3>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
              <div className="h-2 w-2 rounded-full bg-slate-400" /> Chờ
            </div>
            <div className="flex items-center gap-1.5 text-blue-500">
              <div className="h-2 w-2 rounded-full bg-blue-500" /> Chạy
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <div className="h-2 w-2 rounded-full bg-emerald-500" /> Xong
            </div>
          </div>
          {permissions.canManageSchedule && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-opacity"
            >
              <PlusIcon className="size-3.5" />
              {showForm ? 'Đóng' : 'Thêm công việc'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-[var(--color-primary)] bg-[var(--color-surface)] p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">Thêm công việc mới vào kế hoạch</h4>
          <MasterPlanForm projectId={projectId} onClose={() => setShowForm(false)} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="grid grid-cols-12 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] px-4 py-3 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          <div className="col-span-6">Hạng mục / Công việc</div>
          <div className="col-span-2 text-center">Thời gian</div>
          <div className="col-span-2 text-center">Tiến độ</div>
          <div className="col-span-2 text-right">Trạng thái</div>
        </div>
        
        <div className="divide-y divide-[var(--color-border)]">
          {paginatedItems.map(item => (
            <MasterPlanRow 
              key={item.id} 
              item={item} 
              level={0} 
              expandedItems={expandedItems} 
              toggleExpand={toggleExpand}
              projectId={projectId}
              canManage={permissions.canManageSchedule}
            />
          ))}
          {itemList.length === 0 && (
            <div className="p-12 text-center text-[var(--color-text-muted)]">
              Chưa có kế hoạch công việc nào được thiết lập.
            </div>
          )}
        </div>
        <Pagination
          page={currentPage}
          pageSize={PAGE_SIZE}
          total={itemList.length}
          onPageChange={setPage}
          itemLabel="công việc"
          ariaLabel="Phân trang kế hoạch tổng thể"
        />
      </div>
    </div>
  );
}

interface RowProps {
  item: MasterPlanItem;
  level: number;
  expandedItems: Set<number>;
  toggleExpand: (id: number) => void;
  projectId: number;
  canManage: boolean;
}

function MasterPlanRow({ item, level, expandedItems, toggleExpand, projectId, canManage }: RowProps) {
  const updateProgress = useUpdateMasterPlanProgress(projectId);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<MasterPlanStatus>(item.status);
  const [progress, setProgress] = useState(String(item.progress));
  const [error, setError] = useState('');

  const startEditing = () => {
    setStatus(item.status);
    setProgress(String(item.progress));
    setError('');
    setEditing(true);
  };

  const saveProgress = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canManage || updateProgress.isPending) return;
    const value = Number(progress);
    if (progress.trim() === '' || !Number.isInteger(value) || value < 0 || value > 100) {
      setError('Tiến độ phải là số nguyên từ 0 đến 100.');
      return;
    }
    if (value === 100 && status !== 'COMPLETED') {
      setError('Với tiến độ 100%, vui lòng chọn trạng thái Hoàn thành.');
      return;
    }
    setError('');
    updateProgress.mutate({ planId: item.id, progress: value, status }, {
      onSuccess: () => {
        setEditing(false);
        toast.success('Đã cập nhật trạng thái và tiến độ công việc.');
      },
      onError: (err) => setError(getApiErrorMessage(err)),
    });
  };
  const isExpanded = expandedItems.has(item.id);
  const hasChildren = item.children && item.children.length > 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon className="size-4 text-emerald-500" />;
      case 'IN_PROGRESS': return <PlayIcon className="size-4 text-blue-500" />;
      case 'DELAYED': return <ExclamationCircleIcon className="size-4 text-rose-500" />;
      default: return <ClockIcon className="size-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Hoàn thành';
      case 'IN_PROGRESS': return 'Đang chạy';
      case 'DELAYED': return 'Trễ hạn';
      default: return 'Chờ';
    }
  };

  return (
    <>
      <div className="grid grid-cols-12 items-center px-4 py-3 hover:bg-[var(--color-bg)] transition-colors group">
        <div className="col-span-6 flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
          {hasChildren ? (
            <button onClick={() => toggleExpand(item.id)} className="p-0.5 hover:bg-[var(--color-border)] rounded transition-colors text-[var(--color-text-muted)]">
              {isExpanded ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
            </button>
          ) : (
            <div className="size-3.5" />
          )}
          <div className="flex flex-col">
            <span className={`text-sm ${level === 0 ? 'font-bold text-[var(--color-text-primary)]' : 'font-medium text-[var(--color-text-secondary)]'}`}>
              {item.name}
            </span>
            {item.description && <span className="text-[10px] text-[var(--color-text-muted)] line-clamp-1 italic">{item.description}</span>}
          </div>
        </div>

        <div className="col-span-2 text-center text-[10px] text-[var(--color-text-muted)]">
          {item.startDate && item.endDate ? (
            <div className="flex flex-col">
              <span>{new Date(item.startDate).toLocaleDateString('vi-VN')}</span>
              <span>-</span>
              <span>{new Date(item.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
          ) : '—'}
        </div>

        <div className="col-span-2 px-4">
          <div className="flex flex-col gap-1">
            <div className="h-1.5 w-full rounded-full bg-[var(--color-border)] overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${item.progress === 100 ? 'bg-emerald-500' : 'bg-[var(--color-primary)]'}`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
            <span className="text-[10px] text-center font-bold text-[var(--color-text-secondary)]">{item.progress}%</span>
          </div>
        </div>

        <div className="col-span-2 flex flex-wrap justify-end items-center gap-1.5">
          <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-tighter">
            {getStatusLabel(item.status)}
          </span>
          {getStatusIcon(item.status)}
          {canManage && (
            <button type="button" onClick={startEditing} aria-label={`Cập nhật ${item.name}`} aria-expanded={editing} className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-bg)]">
              Cập nhật
            </button>
          )}
        </div>
      </div>

      {editing && canManage && (
        <form onSubmit={saveProgress} className="border-t border-[var(--color-border)] bg-[var(--color-bg)] p-4">
          <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Cập nhật: {item.name}</p>
          <fieldset disabled={updateProgress.isPending} className="flex flex-wrap items-end gap-3 disabled:opacity-60">
            <label className="flex flex-col gap-1 text-sm text-[var(--color-text-secondary)]">
              Trạng thái
              <select value={status} onChange={(event) => {
                const next = event.target.value as MasterPlanStatus;
                setStatus(next);
                setError('');
                if (next === 'NOT_STARTED') setProgress('0');
                else if (next === 'COMPLETED') setProgress('100');
              }} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2">
                <option value="NOT_STARTED">Chờ</option>
                <option value="IN_PROGRESS">Đang chạy</option>
                <option value="DELAYED">Trễ hạn</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--color-text-secondary)]">
              Tiến độ (%)
              <input type="number" min="0" max="100" step="1" required value={progress} readOnly={status === 'NOT_STARTED' || status === 'COMPLETED'} onChange={(event) => setProgress(event.target.value)} className="w-28 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 read-only:opacity-60" />
            </label>
            <button type="submit" className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white">{updateProgress.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-secondary)]">Hủy</button>
          </fieldset>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">Chờ tương ứng 0%; Hoàn thành tương ứng 100%. Đang chạy hoặc Trễ hạn cho phép nhập tiến độ thực tế.</p>
          {error && <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>}
        </form>
      )}
      
      {isExpanded && hasChildren && (
        <div className="bg-[var(--color-bg)]/30">
          {item.children.map(child => (
            <MasterPlanRow 
              key={child.id} 
              item={child} 
              level={level + 1} 
              expandedItems={expandedItems} 
              toggleExpand={toggleExpand}
              projectId={projectId}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </>
  );
}
