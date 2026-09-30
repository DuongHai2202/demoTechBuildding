import { useLocation } from 'react-router-dom';
import { useLogout } from '../features/auth/api/authApi';
import { useAuthStore } from '../features/auth/stores/authStore';
import { getRoleDefinition } from '../features/auth/authorization';
import { ThemeToggle } from './ThemeToggle';
import {
  ArrowRightStartOnRectangleIcon,
  ShieldCheckIcon,
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
  '/notifications': 'Thông báo',
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

function getInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogout();
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const displayName = user?.fullName?.trim() || user?.username || 'Người dùng';
  const primaryRole = user?.roles?.[0];
  const role = getRoleDefinition(primaryRole)?.label || primaryRole || 'Người dùng';
  const initials = getInitials(displayName);

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      {/* Left: Breadcrumbs */}
      <div aria-label="Đường dẫn trang" className="flex min-w-0 items-center gap-1.5 overflow-hidden text-sm">
        {breadcrumbs.map((crumb, idx) => (
          <span key={idx} className="flex min-w-0 shrink-0 items-center gap-1.5">
            {idx > 0 && <span className="text-[var(--color-text-muted)]">/</span>}
            <span
              className={
                `max-w-36 truncate ${idx === breadcrumbs.length - 1
                  ? 'font-semibold text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)]'}`
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right: Actions + Profile */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <NotificationBell />

        {/* User Profile */}
        {user && (
          <div className="ml-1 flex min-w-0 max-w-[min(18rem,38vw)] items-center gap-2.5 border-l border-[var(--color-border)] pl-3 sm:ml-2 sm:gap-3 sm:pl-4">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-extrabold tracking-wide text-white shadow-sm"
              title={displayName}
              aria-label={`Tài khoản ${displayName}`}
            >
              {initials}
            </div>
            <div className="hidden min-w-0 flex-1 lg:flex lg:flex-col">
              <span
                className="truncate whitespace-nowrap text-sm font-bold leading-5 text-[var(--color-text-primary)]"
                title={displayName}
              >
                {displayName}
              </span>
              <span
                className="mt-0.5 inline-flex max-w-full items-center gap-1 self-start rounded-md bg-[var(--color-primary-light)] px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-[var(--color-primary)]"
                title={role}
              >
                <ShieldCheckIcon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate whitespace-nowrap">{role}</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-red-50 transition-colors"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <ArrowRightStartOnRectangleIcon className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
