import { useState } from 'react';
import { MaterialCatalog } from './MaterialCatalog';
import { MaterialRequestBoard } from './MaterialRequestBoard';
import { 
  CubeIcon, 
  ClipboardDocumentListIcon, 
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface MaterialModuleProps {
  projectId?: number;
}

export function MaterialModule({ projectId }: MaterialModuleProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'requests'>(projectId ? 'requests' : 'catalog');

  const tabs = [
    { id: 'catalog' as const, name: 'Thư viện PMMS', icon: CubeIcon },
    { id: 'requests' as const, name: 'Yêu cầu (Project)', icon: ClipboardDocumentListIcon, hidden: !projectId },
  ].filter(t => !t.hidden);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {activeTab === 'catalog' ? 'Hệ thống Quản lý Vật tư Tập trung (PMMS)' : 'Quản lý Vật tư Dự án'}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {activeTab === 'catalog' 
              ? 'Tra cứu và quản lý cơ sở dữ liệu vật tư kỹ thuật dùng chung cho toàn công ty' 
              : 'Theo dõi nhu cầu, định mức và quy trình phê duyệt vật tư của riêng dự án này'}
          </p>
        </div>
        
        {projectId && (
          <div className="flex bg-[var(--color-bg)] p-1 rounded-xl border border-[var(--color-border)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Module Content */}
      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm min-h-[500px]">
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            <MaterialCatalog />
            
            {!projectId && (
              <div className="mt-12 p-6 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-4">
                <InformationCircleIcon className="size-6 text-blue-500 shrink-0" />
                <div className="text-sm">
                  <h4 className="font-bold text-blue-900">Ghi chú về Dữ liệu Revit</h4>
                  <p className="text-blue-800 mt-1">
                    Dữ liệu vật tư ở đây được đồng bộ hóa với hệ thống BIM/Revit. Mỗi vật phẩm có mã quản lý (Code) và mã Revit tương ứng để đảm bảo tính nhất quán từ giai đoạn thiết kế đến thi công.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'requests' && projectId && (
          <MaterialRequestBoard projectId={projectId} />
        )}
      </div>
    </div>
  );
}
