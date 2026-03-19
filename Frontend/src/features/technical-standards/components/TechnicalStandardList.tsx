import { useState } from 'react';
import { 
  useTechnicalStandards, 
  useDeleteTechnicalStandard, 
  useUploadTechnicalFile 
} from '../api/technicalStandardApi';
import { TechnicalStandardForm } from './TechnicalStandardForm';
import { 
  PlusIcon, 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  TrashIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

export function TechnicalStandardList() {
  const { data: standards, isLoading } = useTechnicalStandards();
  const deleteMutation = useDeleteTechnicalStandard();
  const uploadMutation = useUploadTechnicalFile();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStandard, setEditingStandard] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStandards = standards?.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (standard: any) => {
    setEditingStandard(standard);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tiêu chuẩn này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate({ id, file });
    }
  };

  if (isLoading) return <div className="p-8 text-center text-[var(--color-text-muted)] italic">Đang tải tiêu chuẩn...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, tên hoặc phân loại..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={() => { setEditingStandard(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-md active:scale-95"
        >
          <PlusIcon className="size-5" />
          Thêm Tiêu chuẩn
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStandards?.map((standard) => (
          <div 
            key={standard.id} 
            className="group relative bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <DocumentTextIcon className="size-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {standard.category}
                  </span>
                  <h3 className="font-bold text-[var(--color-text-primary)] leading-tight mt-1">{standard.name}</h3>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(standard)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                  <PencilSquareIcon className="size-4" />
                </button>
                <button onClick={() => handleDelete(standard.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <TrashIcon className="size-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Mã hiệu:</span>
                <span className="font-bold font-mono">{standard.code}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--color-text-muted)]">Phiên bản:</span>
                <span className="font-semibold">{standard.version}</span>
              </div>
              {standard.description && (
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 italic">
                  "{standard.description}"
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border)]">
              {standard.fileUrl ? (
                <a
                  href={standard.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-sm"
                >
                  <ArrowDownTrayIcon className="size-4" />
                  Tải xuống PDF
                </a>
              ) : (
                <label className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all cursor-pointer text-sm">
                  <CloudArrowUpIcon className="size-4" />
                  Tải tệp lên
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(standard.id, e)} />
                </label>
              )}
            </div>

            {standard.projectName && (
              <div className="mt-4 text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-green-500" />
                Gán cho dự án: <span className="text-[var(--color-text-primary)] font-medium">{standard.projectName}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredStandards?.length === 0 && (
        <div className="py-20 text-center text-[var(--color-text-muted)]">
          <DocumentTextIcon className="size-12 mx-auto mb-4 opacity-20" />
          <p>Không tìm thấy tiêu chuẩn kỹ thuật nào phù hợp.</p>
        </div>
      )}

      {isFormOpen && (
        <TechnicalStandardForm 
          standard={editingStandard}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
