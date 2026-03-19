import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CloudIcon,
  UsersIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAllWorkLogs } from '../features/worklogs/api/worklogApi';
import { useProjects } from '../features/projects/api/projectApi';
import { StatusBadge } from '../components/StatusBadge';

export default function WorkLogsPage() {
  const { data: workLogs, isLoading } = useAllWorkLogs();
  const { data: projects } = useProjects();
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState<number | ''>('');
  const [filterWeather, setFilterWeather] = useState('');

  const projectMap = useMemo(() => {
    const map: Record<number, string> = {};
    projects?.forEach(p => { map[p.id] = p.name; });
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    if (!workLogs) return [];
    return workLogs.filter(log => {
      const matchSearch =
        log.content?.toLowerCase().includes(search.toLowerCase()) ||
        log.username?.toLowerCase().includes(search.toLowerCase());
      const matchProject = filterProject === '' || log.projectId === filterProject;
      const matchWeather = !filterWeather || log.weatherCondition === filterWeather;
      return matchSearch && matchProject && matchWeather;
    });
  }, [workLogs, search, filterProject, filterWeather]);

  const weatherOptions = useMemo(() => {
    if (!workLogs) return [];
    return [...new Set(workLogs.map(l => l.weatherCondition).filter(Boolean))];
  }, [workLogs]);

  const stats = useMemo(() => ({
    total: workLogs?.length || 0,
    today: workLogs?.filter(l => l.logDate === new Date().toISOString().split('T')[0]).length || 0,
    totalWorkers: workLogs?.reduce((sum, l) => sum + (l.workerCount || 0), 0) || 0,
  }), [workLogs]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Nhật Ký Thi Công</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Tổng hợp toàn bộ nhật ký công việc từ tất cả các dự án.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <DocumentTextIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Tổng nhật ký</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <ClockIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.today}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Hôm nay</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalWorkers}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Tổng công nhân</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung, người ghi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value ? Number(e.target.value) : '')}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none"
          >
            <option value="">Tất cả dự án</option>
            {projects?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={filterWeather}
            onChange={e => setFilterWeather(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none"
          >
            <option value="">Thời tiết</option>
            {weatherOptions.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-[var(--color-bg)] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <DocumentTextIcon className="h-12 w-12 text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {search || filterProject || filterWeather ? 'Không tìm thấy nhật ký phù hợp.' : 'Chưa có nhật ký thi công nào.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Ngày</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Dự án</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Người ghi</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Nội dung</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">
                  <CloudIcon className="h-4 w-4 inline" /> Thời tiết
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Công nhân</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Trạng thái</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Ảnh</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                    {log.logDate ? new Date(log.logDate).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/projects/${log.projectId}`}
                      className="font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1"
                    >
                      {projectMap[log.projectId] || `Dự án #${log.projectId}`}
                      <ChevronRightIcon className="h-3 w-3" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-primary)]">{log.username || '—'}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)] max-w-xs truncate">{log.content}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-info-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-info)]">
                      <CloudIcon className="h-3 w-3" />
                      {log.weatherCondition || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-[var(--color-text-primary)]">{log.workerCount}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={log.status || 'DRAFT'} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.mediaUrls && log.mediaUrls.length > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        {log.mediaUrls.length} ảnh
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-text-disabled)]">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
