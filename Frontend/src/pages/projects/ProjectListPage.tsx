import { Link } from 'react-router-dom';
import { ProjectList } from '../../features/projects/components/ProjectList';

export default function ProjectListPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Danh sách dự án</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Quản lý và theo dõi tiến độ các công trình</p>
        </div>
        <Link
          to="/projects/new"
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors cursor-pointer"
        >
          + Thêm dự án mới
        </Link>
      </div>

      <ProjectList />
    </div>
  );
}
