import { useState } from 'react';
import { useZones } from '../../projects/api/projectApi';
import { 
  FolderIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  DocumentIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import { DesignSheetList } from './index';
import { RevitFileManager } from './RevitFileManager';

type ViewMode = 'SHEETS' | 'REVIT';

export function DesignModule({ projectId }: { projectId: number }) {
  const { data: zones } = useZones(projectId);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('SHEETS');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[600px]">
      {/* Sidebar - Zones */}
      <div className="w-72 flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden shrink-0 shadow-sm">
        <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
          <h4 className="text-[11px] font-black text-[var(--color-text-primary)] uppercase tracking-widest flex items-center gap-2">
            Cấu trúc công trình
          </h4>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => setSelectedZoneId(null)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all ${
              selectedZoneId === null 
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold shadow-sm' 
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
            }`}
          >
            <FolderIcon className="size-4" />
            Tất cả khu vực
          </button>
          
          <div className="pt-2 border-t border-[var(--color-border)]/50">
            {zones?.map(zone => (
              <ZoneTreeNode 
                key={zone.id} 
                zone={zone} 
                level={0} 
                selectedId={selectedZoneId}
                onSelect={setSelectedZoneId}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Sub Navigation */}
        <div className="flex items-center gap-4 p-1 rounded-xl bg-[var(--color-surface-alt)]/50 border border-[var(--color-border)] self-start backdrop-blur-sm">
          <button
            onClick={() => setViewMode('SHEETS')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              viewMode === 'SHEETS' 
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-md' 
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <DocumentIcon className="size-4" />
            Hồ sơ thiết kế
          </button>
          <button
            onClick={() => setViewMode('REVIT')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              viewMode === 'REVIT' 
                ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-md' 
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <CubeIcon className="size-4" />
            Quản lý file Revit
          </button>
        </div>

        {/* Dynamic Component Area */}
        <div className="flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          {viewMode === 'SHEETS' ? (
            <DesignSheetList projectId={projectId} zoneId={selectedZoneId ?? undefined} />
          ) : (
            <RevitFileManager projectId={projectId} zoneId={selectedZoneId ?? undefined} />
          )}
        </div>
      </div>
    </div>
  );
}

function ZoneTreeNode({ 
  zone, 
  level, 
  selectedId, 
  onSelect, 
  expandedIds, 
  onToggleExpand 
}: { 
  zone: any, 
  level: number, 
  selectedId: number | null, 
  onSelect: (id: number) => void,
  expandedIds: Set<number>,
  onToggleExpand: (id: number) => void
}) {
  const isExpanded = expandedIds.has(zone.id);
  const isSelected = selectedId === zone.id;
  const hasChildren = zone.children && zone.children.length > 0;

  return (
    <div className="space-y-0.5">
      <div 
        className={`flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold' 
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(zone.id)}
      >
        {hasChildren ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleExpand(zone.id); }}
            className="p-0.5 hover:bg-[var(--color-border)] rounded text-[var(--color-text-muted)]"
          >
            {isExpanded ? <ChevronDownIcon className="size-3" /> : <ChevronRightIcon className="size-3" />}
          </button>
        ) : (
          <div className="size-4" />
        )}
        <span className="text-xs font-semibold truncate">{zone.name}</span>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="space-y-0.5">
          {zone.children.map((child: any) => (
            <ZoneTreeNode 
              key={child.id} 
              zone={child} 
              level={level + 1} 
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}
