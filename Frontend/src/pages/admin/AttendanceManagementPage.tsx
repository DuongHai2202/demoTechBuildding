import { useState } from 'react';
import { useProjects } from '../../features/projects/api/projectApi';
import { AttendanceAdminList } from '../../features/attendance/components/AttendanceAdminList';
import { 
  BuildingOffice2Icon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

export default function AttendanceManagementPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [projectSearch, setProjectSearch] = useState('');

  const filteredProjects = projects?.filter(p => 
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.projectCode?.toLowerCase().includes(projectSearch.toLowerCase())
  );

  if (projectsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-10 border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  const selectedProject = projects?.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Quản lý Chấm công</h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Theo dõi nhật ký vào/ra và các lượt xác thực thất bại trên toàn hệ thống.
        </p>
      </div>

      {/* Project Selector or Empty State */}
      {!selectedProjectId ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Search & Filter bar */}
           <div className="bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm dự án theo tên hoặc mã..."
                  value={projectSearch}
                  onChange={e => setProjectSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
                />
                <svg className="absolute left-3 top-2.5 size-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-xs font-medium text-[var(--color-text-muted)]">
                Tổng cộng: <span className="text-[var(--color-primary)] font-bold">{filteredProjects?.length || 0}</span> dự án
              </div>
           </div>

           {/* Projects List */}
           <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
                   <tr className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                     <th className="px-6 py-4">Dự án</th>
                     <th className="px-6 py-4">Mã dự án</th>
                     <th className="px-6 py-4">Địa chỉ</th>
                     <th className="px-6 py-4 text-right">Thao tác</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[var(--color-border)]">
                    {filteredProjects?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">Không tìm thấy dự án nào khớp với từ khóa.</td>
                      </tr>
                    ) : (
                      filteredProjects?.map(project => (
                        <tr key={project.id} className="hover:bg-[var(--color-bg)] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                                <BuildingOffice2Icon className="size-5" />
                              </div>
                              <span className="font-bold text-[var(--color-text-primary)]">{project.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[var(--color-text-secondary)] font-mono">
                            {project.projectCode || '—'}
                          </td>
                          <td className="px-6 py-4 text-[var(--color-text-muted)] text-xs max-w-[300px] truncate">
                            {project.address || '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => setSelectedProjectId(project.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-lg transition-colors"
                            >
                              Xem nhật ký
                              <ChevronRightIcon className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Breadcrumb back */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSelectedProjectId(null)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-primary)] transition-all flex items-center gap-1"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Danh sách dự án
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-[var(--color-text-primary)]">{selectedProject?.name}</span>
          </div>

          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark,var(--color-primary))] p-6 rounded-2xl text-white shadow-[var(--shadow-modal-theme)] border border-white/10 flex items-center justify-between relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute -right-10 -top-10 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                <BuildingOffice2Icon className="size-6 text-white" />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black opacity-70 tracking-[0.2em] mb-0.5">Đang xem nhật ký từ dự án</span>
                <h2 className="font-black text-xl tracking-tight">{selectedProject?.name}</h2>
              </div>
            </div>
            
            <div className="text-right relative z-10">
              <span className="block text-[10px] uppercase font-black opacity-70 tracking-[0.2em] mb-0.5">Mã dự án</span>
              <span className="font-mono text-2xl font-black tracking-tighter text-white drop-shadow-sm">{selectedProject?.projectCode || 'N/A'}</span>
            </div>
          </div>

          <AttendanceAdminList projectId={selectedProjectId} />
        </div>
      )}
    </div>
  );
}
