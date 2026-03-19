import { useLocation } from 'react-router-dom';
import { useLogout } from '../features/auth/api/authApi';
import { useAuthStore } from '../features/auth/stores/authStore';
import { ThemeToggle } from './ThemeToggle';
import {
  MagnifyingGlassIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { NotificationBell } from '../features/notifications/components/NotificationBell';

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Trang chủ',
  '/projects': 'Dự án',
  '/contracts': 'Hợp đồng',
  '/attendance': 'Chấm công',
  '/materials': 'Kho vật tư',
  '/worklogs': 'Nhật ký',
  '/users': 'Nhân sự',
  '/settings': 'Cài đặt',
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: string[] = ['Trang chủ'];

  let path = '';
  for (const seg of segments) {
    path += `/${seg}`;
    const mapped = BREADCRUMB_MAP[path];
    if (mapped) {
      crumbs.push(mapped);
    } else if (seg === 'new') {
      crumbs.push('Tạo mới');
    } else if (seg === 'edit') {
      crumbs.push('Chỉnh sửa');
    } else if (!isNaN(Number(seg))) {
      crumbs.push(`#${seg}`);
    }
  }
  return crumbs;
}

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  return (
    <div className="flex w-full items-center justify-between">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-[var(--color-text-muted)]">/</span>}
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'font-medium text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)]'
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right: Search + Actions + Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-1.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-primary)] focus:w-64 transition-all"
          />
        </div>

        <ThemeToggle />

        <NotificationBell />

        {/* User Profile */}
        {user && (
          <div className="flex items-center gap-3 ml-2 border-l border-[var(--color-border)] pl-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-sm font-bold">
              {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-medium text-[var(--color-text-primary)] leading-tight">
                {user.fullName || user.username}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] capitalize leading-tight">
                {user.roles?.[0]?.toLowerCase?.() || 'Người dùng'}
              </span>
            </div>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-50 transition-colors"
              title="Đăng xuất"
            >
              <ArrowRightStartOnRectangleIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
