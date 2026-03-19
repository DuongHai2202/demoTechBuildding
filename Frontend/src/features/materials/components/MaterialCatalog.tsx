import { useState } from 'react';
import { 
  useMaterials, 
  useMaterialCategories 
} from '../api/materialApi';
import { LoadingSkeleton } from '../../../components/LoadingSkeleton';
import { 
  MagnifyingGlassIcon, 
  CubeIcon, 
  InformationCircleIcon,
  DocumentArrowDownIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { cn } from '../../../lib/utils';

export function MaterialCatalog() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data: categories, isLoading: isCategoriesLoading } = useMaterialCategories();
  const { data: materials, isLoading: isMaterialsLoading } = useMaterials();

  const filteredMaterials = materials?.filter(m => {
    const matchesSearch = m.nameVi?.toLowerCase().includes(search.toLowerCase()) || 
                         m.nameEn?.toLowerCase().includes(search.toLowerCase()) ||
                         m.managementCode?.toLowerCase().includes(search.toLowerCase()) ||
                         m.revitCode?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? m.categoryId === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  if (isCategoriesLoading || isMaterialsLoading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Thư viện vật tư PMMS</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Quản lý cơ sở dữ liệu vật tư tập trung</p>
        </div>
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã hoặc mã Revit..."
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-4 text-sm focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Squares2X2Icon className="size-4" /> Phân loại kỹ thuật
              </h3>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                  !selectedCategory ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold" : "hover:bg-[var(--color-bg)]"
                )}
              >
                Tất cả Vật Tư
              </button>
              {categories?.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id === selectedCategory ? null : c.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between transition-colors",
                    selectedCategory === c.id ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold" : "hover:bg-[var(--color-bg)]"
                  )}
                >
                  <span className="line-clamp-1">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Material Grid */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMaterials?.map(material => (
              <div 
                key={material.id}
                className="group flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:shadow-lg transition-all"
              >
                <div className="p-4 flex-1">
                  <div className="flex items-start gap-3">
                    <div className="size-16 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden shrink-0">
                      {material.imageUrl ? (
                        <img src={material.imageUrl} alt={material.nameVi} className="size-full object-cover" />
                      ) : (
                        <CubeIcon className="size-8 text-[var(--color-text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase font-bold text-[var(--color-primary)] tracking-wider">
                        {material.categoryName || 'Chưa phân loại'}
                      </div>
                      <h3 className="font-bold text-sm text-[var(--color-text-primary)] mt-0.5 line-clamp-2 leading-tight" title={material.nameVi}>
                        {material.nameVi}
                      </h3>
                      {material.nameEn && (
                        <div className="text-xs text-[var(--color-text-muted)] italic truncate" title={material.nameEn}>
                          {material.nameEn}
                        </div>
                      )}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {material.managementCode && (
                          <span className="px-1.5 py-0.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-[9px] text-[var(--color-text-secondary)] font-mono">
                            Mã: {material.managementCode}
                          </span>
                        )}
                        {material.revitCode && (
                          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-600 border border-blue-200/50 rounded text-[9px] font-bold">
                            REVIT: {material.revitCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="text-[var(--color-text-muted)]">Đơn vị:</div>
                    <div className="font-semibold text-right">{material.unit}</div>
                    {material.revitFamilyCategory && (
                      <>
                        <div className="text-[var(--color-text-muted)]">Revit Category:</div>
                        <div className="truncate text-right font-medium" title={material.revitFamilyCategory}>
                          {material.revitFamilyCategory}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 flex items-center justify-between rounded-b-2xl">
                  {material.catalogueUrl ? (
                    <a 
                      href={material.catalogueUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                    >
                      <DocumentArrowDownIcon className="size-3.5" /> Catalogue
                    </a>
                  ) : (
                    <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 grayscale opacity-50">
                      <DocumentArrowDownIcon className="size-3.5" /> No Catalogue
                    </span>
                  )}
                  <button className="text-[10px] font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform">
                    <InformationCircleIcon className="size-3.5" /> Chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredMaterials?.length === 0 && (
            <div className="py-32 text-center rounded-3xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/50">
              <CubeIcon className="size-16 mx-auto text-[var(--color-text-muted)]/30 mb-4" />
              <p className="text-[var(--color-text-muted)] font-medium">Không tìm thấy vật tư nào phù hợp.</p>
              <button 
                onClick={() => { setSelectedCategory(null); setSearch(''); }}
                className="mt-4 text-sm text-[var(--color-primary)] font-bold hover:underline"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
