import { useState } from 'react';
import { useZones, useDeleteZone, useMyProjectPermission } from '../api/projectApi';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { ZoneForm } from './ZoneForm';
import type { Zone } from '../types/project.types';

export function ZoneList({ projectId }: { projectId: number }) {
  const { data: zones, isLoading } = useZones(projectId);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [showRootForm, setShowRootForm] = useState(false);
  const permissions = useMyProjectPermission(projectId);

  const toggleExpand = (id: number) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const filtered = (zones || []).filter(z =>
    z.name?.toLowerCase().includes(search.toLowerCase()) ||
    z.zoneCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm vị trí..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        {permissions.canManageZones && (
          <button
            onClick={() => setShowRootForm(!showRootForm)}
            className="ml-4 flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="size-4" />
            Thêm phân khu
          </button>
        )}
      </div>

      {showRootForm && (
        <ZoneForm projectId={projectId} onClose={() => setShowRootForm(false)} />
      )}

      {/* Tree View Container */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="grid grid-cols-12 bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] px-4 py-3 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
          <div className="col-span-8">Tên khu vực / Tầng / Căn hộ</div>
          <div className="col-span-2 text-center">Mã hiệu</div>
          <div className="col-span-2 text-right">Tác vụ</div>
        </div>

        <div className="divide-y divide-[var(--color-border)]">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">Đang tải cấu trúc...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--color-text-muted)]">Chưa có phân khu nào được thiết lập.</div>
          ) : (
            filtered.map(zone => (
              <ZoneRow 
                key={zone.id} 
                zone={zone} 
                level={0} 
                expandedIds={expandedIds} 
                toggleExpand={toggleExpand} 
                projectId={projectId} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  zone: Zone;
  level: number;
  expandedIds: Set<number>;
  toggleExpand: (id: number) => void;
  projectId: number;
}

function ZoneRow({ zone, level, expandedIds, toggleExpand, projectId }: RowProps) {
  const isExpanded = expandedIds.has(zone.id);
  const hasChildren = zone.children && zone.children.length > 0;
  const [showAddChild, setShowAddChild] = useState(false);
  const deleteZone = useDeleteZone(projectId);
  const permissions = useMyProjectPermission(projectId);

  return (
    <>
      <div className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-[var(--color-bg)] transition-colors group">
        <div className="col-span-8 flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
          {hasChildren ? (
            <button onClick={() => toggleExpand(zone.id)} className="p-0.5 hover:bg-[var(--color-border)] rounded text-[var(--color-text-muted)]">
              {isExpanded ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
            </button>
          ) : (
            <div className="size-4.5 p-1"><div className="size-1 rounded-full bg-[var(--color-border)] mx-auto" /></div>
          )}
          <MapPinIcon className={`size-4 ${level === 0 ? 'text-[var(--color-primary)]' : level === 1 ? 'text-indigo-500' : 'text-slate-400'}`} />
          <span className={`text-sm ${level === 0 ? 'font-bold text-[var(--color-text-primary)]' : 'font-medium text-[var(--color-text-secondary)]'}`}>
            {zone.name}
          </span>
        </div>

        <div className="col-span-2 text-center">
          <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-text-muted)]">
            {zone.zoneCode || '—'}
          </span>
        </div>

        <div className="col-span-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {permissions.canManageZones && (
            <>
              <button 
                onClick={() => setShowAddChild(!showAddChild)}
                className="p-1 rounded text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                title="Thêm vị trí con"
              >
                <PlusIcon className="size-3.5" />
              </button>
              <button 
                onClick={() => { if(confirm('Xóa vị trí này và tất cả con?')) deleteZone.mutate(zone.id); }}
                className="p-1 rounded text-rose-500 hover:bg-rose-50"
                title="Xóa"
              >
                <TrashIcon className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {showAddChild && (
        <div className="px-4 py-3 bg-[var(--color-bg)]/50 border-x border-[var(--color-border)]" style={{ paddingLeft: `${(level + 1) * 1.5}rem` }}>
           <ZoneForm projectId={projectId} parentId={zone.id} onClose={() => setShowAddChild(false)} />
        </div>
      )}

      {isExpanded && hasChildren && (
        <div className="bg-[var(--color-bg)]/10">
          {zone.children?.map(child => (
            <ZoneRow 
              key={child.id} 
              zone={child} 
              level={level + 1} 
              expandedIds={expandedIds} 
              toggleExpand={toggleExpand} 
              projectId={projectId} 
            />
          ))}
        </div>
      )}
    </>
  );
}
