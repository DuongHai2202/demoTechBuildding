import { useState, type ComponentType, type SVGProps } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import { getRoleDefinition, hasPermission, type Permission } from '../features/auth/authorization';
import { useSidebarLayout } from '../layouts/SidebarContext';
import {
  ArchiveBoxIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

type NavIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface NavChild {
  to: string;
  label: string;
  icon: NavIcon;
  adminOnly?: boolean;
  permission?: Permission;
}

interface NavGroup {
  label: string;
  icon: NavIcon;
  children: NavChild[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Dự án & hiện trường',
    icon: BuildingOfficeIcon,
    children: [
      { to: '/projects', label: 'Dự án', icon: BuildingOfficeIcon, permission: 'PROJECT_READ' },
      { to: '/worklogs', label: 'Nhật ký công trường', icon: ClipboardDocumentListIcon, permission: 'WORKLOG_READ' },
      { to: '/attendance', label: 'Chấm công', icon: IdentificationIcon, permission: 'ATTENDANCE_USE' },
      { to: '/technical-standards', label: 'Tiêu chuẩn kỹ thuật', icon: DocumentTextIcon, permission: 'TECHNICAL_STANDARD_READ' },
    ],
  },
  {
    label: 'Vật tư & hợp đồng',
    icon: ArchiveBoxIcon,
    children: [
      { to: '/materials', label: 'Kho vật tư', icon: ArchiveBoxIcon, permission: 'MATERIAL_READ' },
      { to: '/material-management', label: 'Yêu cầu vật tư', icon: ClipboardDocumentListIcon, permission: 'MATERIAL_REQUEST' },
      { to: '/partners', label: 'Đối tác', icon: UsersIcon, permission: 'PARTNER_READ' },
      { to: '/contracts', label: 'Hợp đồng', icon: DocumentTextIcon, permission: 'CONTRACT_READ' },
      { to: '/bidding', label: 'Đấu thầu', icon: DocumentTextIcon, permission: 'BIDDING_READ' },
    ],
  },
  {
    label: 'Quản trị & nhân sự',
    icon: IdentificationIcon,
    children: [
      { to: '/users', label: 'Nhân sự', icon: UsersIcon, permission: 'USER_MANAGE' },
      { to: '/approval-requests', label: 'Phê duyệt quyền', icon: IdentificationIcon, adminOnly: true },
      { to: '/admin/attendance', label: 'Quản lý chấm công', icon: ClipboardDocumentListIcon, adminOnly: true },
    ],
  },
];

function isPathActive(pathname: string, to: string) {
  return to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`);
}

function getInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const { collapsed } = useSidebarLayout();
  const isGuest = user?.roles?.length === 1 && user.roles[0] === 'GUEST';
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;
  const activeGroupIndex = NAV_GROUPS.findIndex((group) =>
    group.children.some((child) => isPathActive(location.pathname, child.to)),
  );

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    return activeGroupIndex >= 0 ? new Set([NAV_GROUPS[activeGroupIndex].label]) : new Set();
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const displayName = user?.fullName || user?.username || 'Người dùng';
  const primaryRole = user?.roles?.[0];
  const role = getRoleDefinition(primaryRole)?.label || primaryRole || 'Người dùng';
  const initials = getInitials(displayName);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`border-b border-[var(--color-border)] py-5 ${collapsed ? 'px-3' : 'px-5'}`}>
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-lg font-extrabold text-white shadow-sm">
            TB
          </div>
          <div className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
            <h1 className="truncate text-base font-extrabold tracking-tight text-[var(--color-text-primary)]">
              TechBuilding
            </h1>
            <p className="truncate text-xs text-[var(--color-text-muted)]">Quản lý thi công</p>
          </div>
        </div>
      </div>

      <nav aria-label="Điều hướng chính" className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <NavLink
            to="/"
            end
            title={collapsed ? 'Trang chủ' : undefined}
            aria-label="Trang chủ"
            className={({ isActive }) =>
              `flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${collapsed ? 'lg:justify-center' : ''} ${
                isActive
                  ? 'bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary)]'
                  : 'font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            <HomeIcon className="size-5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Trang chủ</span>
          </NavLink>

          {!isGuest && (
            <div className="space-y-1 pt-3">
              <p className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] ${collapsed ? 'lg:hidden' : ''}`}>
                Không gian làm việc
              </p>
              {NAV_GROUPS.map((group, index) => {
                const visibleChildren = group.children.filter((child) => {
                  if (child.adminOnly && !isAdmin) return false;
                  return !child.permission || hasPermission(user, child.permission);
                });
                if (visibleChildren.length === 0) return null;
                const groupId = `sidebar-group-${index}`;
                const Icon = group.icon;
                const isChildActive = visibleChildren.some((child) => isPathActive(location.pathname, child.to));
                const isExpanded = expandedMenus.has(group.label) || isChildActive;

                return (
                  <div key={group.label}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={groupId}
                      title={collapsed ? group.label : undefined}
                      onClick={() => toggleMenu(group.label)}
                      className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${collapsed ? 'lg:justify-center' : ''} ${
                        isChildActive
                          ? 'bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary)]'
                          : 'font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className="size-5 shrink-0" />
                        <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{group.label}</span>
                      </span>
                      <ChevronDownIcon className={`size-4 shrink-0 transition-transform ${collapsed ? 'lg:hidden' : ''} ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div id={groupId} className={`ml-5 mt-1 space-y-0.5 border-l border-[var(--color-border)] pl-2 ${collapsed ? 'lg:ml-0 lg:border-l-0 lg:pl-0' : ''}`}>
                        {visibleChildren.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              title={collapsed ? child.label : undefined}
                              aria-label={child.label}
                              className={({ isActive }) =>
                                `flex min-h-9 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${collapsed ? 'lg:justify-center lg:px-2' : ''} ${
                                  isActive
                                    ? 'bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary)]'
                                    : 'font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]'
                                }`
                              }
                            >
                              <ChildIcon className="size-4 shrink-0" />
                              <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <NavLink
            to="/settings"
            title={collapsed ? 'Cài đặt' : undefined}
            aria-label="Cài đặt"
            className={({ isActive }) =>
              `mt-3 flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${collapsed ? 'lg:justify-center' : ''} ${
                isActive
                  ? 'bg-[var(--color-primary-light)] font-semibold text-[var(--color-primary)]'
                  : 'font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            <Cog6ToothIcon className="size-5 shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Cài đặt</span>
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-[var(--color-border)] p-3">
        {user && (
          <div className={`mb-3 flex min-w-0 items-center gap-3 rounded-xl bg-[var(--color-surface-alt)] px-3 py-3 ${collapsed ? 'lg:justify-center' : ''}`}>
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-xs font-extrabold tracking-wide text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/10"
              title={displayName}
              aria-label={`Tài khoản ${displayName}`}
            >
              {initials}
            </div>
            <div className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate whitespace-nowrap text-sm font-bold leading-5 text-[var(--color-text-primary)]" title={displayName}>
                {displayName}
              </p>
              <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-md bg-[var(--color-primary-light)] px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-[var(--color-primary)]" title={role}>
                <ShieldCheckIcon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate whitespace-nowrap">{role}</span>
              </span>
            </div>
          </div>
        )}
        <p className={`text-center text-[11px] text-[var(--color-text-muted)] ${collapsed ? 'lg:hidden' : ''}`}>TechBuilding · 2026</p>
      </div>
    </div>
  );
}
