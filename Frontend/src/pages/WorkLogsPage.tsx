import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  BuildingOffice2Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloudIcon,
  ClockIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAllWorkLogs } from '../features/worklogs/api/worklogApi';
import { useProjects } from '../features/projects/api/projectApi';
import type { Project } from '../features/projects/types/project.types';
import type { WorkLog } from '../features/worklogs/types/worklog.types';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/ui/Pagination';

const PAGE_SIZE = 10;

const WEATHER_OPTIONS = [
  { value: 'SUNNY', label: 'Nắng' },
  { value: 'CLOUDY', label: 'Nhiều mây' },
  { value: 'RAIN', label: 'Mưa' },
  { value: 'WINDY', label: 'Gió mạnh' },
  { value: 'STORM', label: 'Bão / giông' },
  { value: 'OTHER', label: 'Khác' },
] as const;

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'CHECKED', label: 'Đã kiểm tra' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
] as const;

type WeatherCategory = (typeof WEATHER_OPTIONS)[number]['value'];

function normalize(value: string | undefined | null) {
  return (value || '').trim().toLocaleLowerCase('vi-VN');
}

function getWeatherCategory(condition: string | undefined): WeatherCategory | '' {
  const value = normalize(condition);
  if (!value) return '';
  if (/bão|bao|giông|giong|sấm|sam/.test(value)) return 'STORM';
  if (/mưa|mua|ẩm|am/.test(value)) return 'RAIN';
  if (/gió mạnh|gio manh|gió lớn|gio lon/.test(value)) return 'WINDY';
  if (/nhiều mây|nhieu may|mây|may|âm u|am u/.test(value)) return 'CLOUDY';
  if (/nắng|nang|ráo|rao|quang/.test(value)) return 'SUNNY';
  return 'OTHER';
}

function getWeatherLabel(condition: string | undefined) {
  const category = getWeatherCategory(condition);
  return WEATHER_OPTIONS.find((option) => option.value === category)?.label || condition || 'Chưa cập nhật';
}

function getProjectLabel(project?: Project) {
  if (!project) return 'Dự án chưa xác định';
  return project.projectCode ? `${project.projectCode} · ${project.name}` : project.name;
}

interface ProjectPickerProps {
  projects: Project[];
  value: number | '';
  onChange: (value: number | '') => void;
}

function ProjectPicker({ projects, value, onChange }: ProjectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedProject = projects.find((project) => project.id === value);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const filteredProjects = useMemo(() => {
    const search = normalize(query);
    return [...projects]
      .sort((a, b) => {
        const aActive = a.status === 'IN_PROGRESS' ? 0 : 1;
        const bActive = b.status === 'IN_PROGRESS' ? 0 : 1;
        return aActive - bActive || a.name.localeCompare(b.name, 'vi');
      })
      .filter((project) => {
        if (!search) return true;
        return [project.name, project.projectCode, project.address]
          .some((field) => normalize(field).includes(search));
      });
  }, [projects, query]);

  const selectProject = (projectId: number | '') => {
    onChange(projectId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative min-w-0 sm:w-[22rem]">
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Chọn dự án để lọc nhật ký"
        onClick={() => setIsOpen((open) => !open)}
      >
        <BuildingOffice2Icon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
        <span className="min-w-0 flex-1 truncate text-[var(--color-text-primary)]">
          {selectedProject ? getProjectLabel(selectedProject) : 'Tất cả dự án'}
        </span>
        <ChevronDownIcon className={`h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-dropdown-theme)]">
          <div className="border-b border-[var(--color-border)] p-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo mã, tên hoặc địa chỉ..."
                aria-label="Tìm dự án"
                autoFocus
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2 pl-9 pr-3 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5" role="listbox" aria-label="Danh sách dự án">
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              onClick={() => selectProject('')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-alt)]"
            >
              <span className="min-w-0 flex-1 font-medium text-[var(--color-text-primary)]">Tất cả dự án</span>
              {value === '' && <CheckIcon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />}
            </button>

            {filteredProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="option"
                aria-selected={project.id === value}
                onClick={() => selectProject(project.id)}
                className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-surface-alt)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--color-text-primary)]">{project.name}</span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--color-text-muted)]">
                    {project.projectCode || `Mã dự án #${project.id}`}
                    {project.address ? ` · ${project.address}` : ''}
                  </span>
                </span>
                {project.id === value && <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />}
              </button>
            ))}

            {filteredProjects.length === 0 && (
              <p className="px-3 py-5 text-center text-sm text-[var(--color-text-muted)]">Không tìm thấy dự án phù hợp.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getLocalDateString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default function WorkLogsPage() {
  const { data: workLogs, isLoading } = useAllWorkLogs();
  const { data: projects } = useProjects();
  const projectList = projects || [];
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState<number | ''>('');
  const [filterWeather, setFilterWeather] = useState<WeatherCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [page, setPage] = useState(1);

  const projectMap = useMemo(() => new Map(projectList.map((project) => [project.id, project])), [projectList]);

  const filtered = useMemo(() => {
    if (!workLogs) return [];
    const normalizedSearch = normalize(search);

    return [...workLogs]
      .filter((log) => {
        const project = projectMap.get(log.projectId);
        const searchableFields = [log.content, log.username, project?.name, project?.projectCode, project?.address];
        const matchSearch = !normalizedSearch || searchableFields.some((field) => normalize(field).includes(normalizedSearch));
        const matchProject = filterProject === '' || log.projectId === filterProject;
        const matchWeather = !filterWeather || getWeatherCategory(log.weatherCondition) === filterWeather;
        const matchStatus = !filterStatus || (log.status || 'PENDING') === filterStatus;
        const matchDateFrom = !dateFrom || log.logDate >= dateFrom;
        const matchDateTo = !dateTo || log.logDate <= dateTo;
        return matchSearch && matchProject && matchWeather && matchStatus && matchDateFrom && matchDateTo;
      })
      .sort((a, b) => b.logDate.localeCompare(a.logDate) || b.id - a.id);
  }, [workLogs, projectMap, search, filterProject, filterWeather, filterStatus, dateFrom, dateTo]);

  const stats = useMemo(() => ({
    total: workLogs?.length || 0,
    today: workLogs?.filter((log) => log.logDate === getLocalDateString()).length || 0,
    totalWorkers: workLogs?.reduce((sum, log) => sum + (log.workerCount || 0), 0) || 0,
  }), [workLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, filterProject, filterWeather, filterStatus, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActiveFilters = Boolean(search.trim() || filterProject !== '' || filterWeather || filterStatus || dateFrom || dateTo);
  const advancedFilterCount = [filterWeather, filterStatus, dateFrom, dateTo].filter(Boolean).length;

  const resetFilters = () => {
    setSearch('');
    setFilterProject('');
    setFilterWeather('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Nhật ký thi công</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Tổng hợp tiến độ và hoạt động hiện trường từ tất cả các dự án.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500"><DocumentTextIcon className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p><p className="text-xs text-[var(--color-text-muted)]">Tổng nhật ký</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500"><ClockIcon className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.today}</p><p className="text-xs text-[var(--color-text-muted)]">Nhật ký hôm nay</p></div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500"><UsersIcon className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalWorkers}</p><p className="text-xs text-[var(--color-text-muted)]">Tổng công nhân</p></div>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card-theme)]" aria-label="Bộ lọc nhật ký">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="search" placeholder="Tìm nội dung, người ghi, mã hoặc tên dự án..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Tìm kiếm nhật ký thi công" className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)]" />
          </div>

          <ProjectPicker projects={projectList} value={filterProject} onChange={setFilterProject} />

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setIsAdvancedOpen((open) => !open)} aria-expanded={isAdvancedOpen} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${isAdvancedOpen || advancedFilterCount > 0 ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]'}`}>
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Bộ lọc nâng cao
              {advancedFilterCount > 0 && <span className="font-bold">({advancedFilterCount})</span>}
            </button>
            {hasActiveFilters && <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"><XMarkIcon className="h-4 w-4" />Xóa lọc</button>}
          </div>
        </div>

        {isAdvancedOpen && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">Từ ngày</span><input type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">Đến ngày</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" /></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">Trạng thái</span><select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"><option value="">Tất cả trạng thái</option>{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">Nhóm thời tiết</span><select value={filterWeather} onChange={(event) => setFilterWeather(event.target.value as WeatherCategory | '')} className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"><option value="">Không lọc thời tiết</option>{WEATHER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--color-text-muted)]"><FunnelIcon className="h-3.5 w-3.5" /><span>Đang hiển thị <strong className="text-[var(--color-text-secondary)]">{filtered.length}</strong> nhật ký phù hợp</span>{filterWeather && <span>· Thời tiết được lọc theo nhóm.</span>}</div>
      </section>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
        {isLoading ? (
          <div className="space-y-3 p-6">{[...Array(5)].map((_, index) => <div key={index} className="h-14 animate-pulse rounded-lg bg-[var(--color-bg)]" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center"><DocumentTextIcon className="mb-3 h-12 w-12 text-[var(--color-text-muted)]" /><p className="text-sm font-medium text-[var(--color-text-secondary)]">{hasActiveFilters ? 'Không tìm thấy nhật ký phù hợp với bộ lọc.' : 'Chưa có nhật ký thi công nào.'}</p>{hasActiveFilters && <button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-[var(--color-primary)] hover:underline">Xóa bộ lọc</button>}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead><tr className="bg-[var(--color-surface-alt)]"><th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Ngày</th><th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Dự án</th><th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Người ghi</th><th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Nội dung</th><th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]"><CloudIcon className="inline h-4 w-4" /> Thời tiết</th><th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Công nhân</th><th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Trạng thái</th><th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Ảnh</th></tr></thead>
              <tbody>
                {paginatedLogs.map((log: WorkLog) => {
                  const project = projectMap.get(log.projectId);
                  return <tr key={log.id} className="border-t border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-alt)]"><td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">{log.logDate ? new Date(`${log.logDate}T00:00:00`).toLocaleDateString('vi-VN') : '—'}</td><td className="px-4 py-3"><Link to={`/projects/${log.projectId}`} className="group flex max-w-[220px] items-center gap-1 text-[var(--color-primary)] hover:underline"><span className="min-w-0"><span className="block truncate font-medium">{project?.name || `Dự án #${log.projectId}`}</span>{project?.projectCode && <span className="block truncate text-xs text-[var(--color-text-muted)] no-underline">{project.projectCode}</span>}</span><ChevronRightIcon className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-0.5" /></Link></td><td className="px-4 py-3 text-[var(--color-text-primary)]">{log.username || '—'}</td><td className="max-w-xs truncate px-4 py-3 text-[var(--color-text-secondary)]" title={log.content}>{log.content || '—'}</td><td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)]" title={log.weatherCondition || 'Chưa cập nhật'}><CloudIcon className="h-3.5 w-3.5 text-[var(--color-info)]" />{getWeatherLabel(log.weatherCondition)}</span></td><td className="px-4 py-3 text-center font-bold text-[var(--color-text-primary)]">{log.workerCount ?? 0}</td><td className="px-4 py-3 text-center"><StatusBadge status={log.status || 'PENDING'} /></td><td className="px-4 py-3 text-center">{log.mediaUrls && log.mediaUrls.length > 0 ? <span className="text-xs font-medium text-emerald-600">{log.mediaUrls.length} ảnh</span> : <span className="text-xs text-[var(--color-text-disabled)]">—</span>}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && <Pagination page={currentPage} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} itemLabel="nhật ký" ariaLabel="Phân trang nhật ký thi công" />}
      </div>
    </div>
  );
}
