import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/stores/authStore';
import {
  ChevronDownIcon,
  ServerIcon,
  IdentificationIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  to?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  children?: { to: string; label: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', icon: HomeIcon, label: 'Trang chủ' },
  {
    icon: ServerIcon,
    label: 'Quản lý dự án',
    children: [
      { to: '/projects', label: 'Dự án' },
      { to: '/partners', label: 'Đối tác' },
      { to: '/materials', label: 'Vật liệu' },
      { to: '/material-management', label: 'Yêu cầu vật tư' },
      { to: '/contracts', label: 'Hợp đồng' },
      { to: '/bidding', label: 'Đấu thầu' },
      { to: '/worklogs', label: 'Quản lý công trường' },
      { to: '/technical-standards', label: 'Tiêu chuẩn kỹ thuật' },
    ],
  },
  {
    icon: IdentificationIcon,
    label: 'Hành chính & Nhân sự',
    children: [
      { to: '/users', label: 'Nhân sự' },
      { to: '/approval-requests', label: 'Phê duyệt quyền' },
      { to: '/attendance', label: 'Chấm công (Của tôi)' },
      { to: '/admin/attendance', label: 'Quản lý Chấm công' },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isGuest = user?.roles?.length === 1 && user.roles[0] === 'GUEST';
  const isAdmin = user?.roles?.includes('ADMIN');

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => {
    const expanded = new Set<string>();
    NAV_ITEMS.forEach(item => {
      if (item.children?.some(c => location.pathname.startsWith(c.to))) {
        expanded.add(item.label);
      }
    });
    return expanded;
  });

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex flex-col items-center border-b border-[var(--color-border)] px-5 py-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-full border-[3px] border-[var(--color-primary)] p-2 shadow-lg bg-[var(--color-surface)] transition-transform hover:scale-105">
            <svg viewBox="0 0 100 100" className="size-full text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              {/* Specialized Trident/Building Tech Icon */}
              <path d="M35 70 V35 Q35 25 50 25 Q65 25 65 35 V70" />
              <path d="M50 25 V75" />
              <path d="M40 75 H60" />
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" opacity="0.2" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-widest text-[var(--color-primary)]">TECHBUILDER</h1>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1.5">
          {!isGuest && NAV_ITEMS.map((item) => {
            // Filter children for Admin tasks
            const filteredChildren = item.children?.filter(child => {
              if (child.to === '/approval-requests') return isAdmin;
              if (child.to === '/admin/attendance') return isAdmin;
              return true;
            });

            if (!filteredChildren && !item.to) return null;

            const Icon = item.icon;
            const hasChildren = filteredChildren && filteredChildren.length > 0;
            const isExpanded = expandedMenus.has(item.label);
            const isChildActive = filteredChildren?.some(c => location.pathname === c.to || location.pathname.startsWith(c.to + '/'));

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all cursor-pointer ${isChildActive || isExpanded
                      ? 'text-[var(--color-primary)] bg-[var(--color-primary-light)] font-semibold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] font-medium'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-5" />
                      {item.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronDownIcon
                        className={`size-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-[var(--color-border)] pl-4">
                      {filteredChildren.map((child) => {
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={({ isActive }) =>
                              `flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-all ${isActive
                                ? 'text-[var(--color-primary)] font-semibold bg-[var(--color-primary-light)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)] font-medium'
                              }`
                            }
                          >
                            <span>{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={item.to!}
                to={item.to!}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${isActive
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold border-r-4 border-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)] font-medium'
                  }`
                }
              >
                <Icon className="size-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom Branding */}
      <div className="border-t border-[var(--color-border)] p-4">
        <p className="text-[10px] text-center text-[var(--color-text-muted)]">
          © 2026 TechBuildding v2.0
        </p>
      </div>
    </div>
  );
}
