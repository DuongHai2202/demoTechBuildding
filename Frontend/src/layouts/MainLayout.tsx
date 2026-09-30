import { type MouseEvent, type ReactNode, Suspense, useEffect, useState } from 'react';

import { Outlet } from 'react-router-dom';
import { Bars3Icon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SidebarLayoutContext } from './SidebarContext';

interface MainLayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
}

export function MainLayout({ sidebar, header }: MainLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return window.localStorage.getItem('techbuilding.sidebar.collapsed') === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem('techbuilding.sidebar.collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleMobileSidebarClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('a')) setMobileSidebarOpen(false);
  };

  return (
    <SidebarLayoutContext.Provider value={{ collapsed: sidebarCollapsed, toggle: () => setSidebarCollapsed((current) => !current) }}>
      <div className="flex min-h-screen bg-[var(--color-bg)]">
        {sidebar ? (
          <aside className={`relative hidden shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-[width] duration-200 lg:block ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
            {sidebar}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="absolute -right-3 top-20 z-40 flex size-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-sm transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              aria-label={sidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
              title={sidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
            >
              {sidebarCollapsed ? <ChevronRightIcon className="size-3.5" /> : <ChevronLeftIcon className="size-3.5" />}
            </button>
          </aside>
        ) : null}

        {sidebar && mobileSidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
            role="presentation"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <aside
              className="h-full w-[min(86vw,18rem)] border-r border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
              aria-label="Điều hướng trên thiết bị di động"
              onClick={handleMobileSidebarClick}
            >
              <div className="flex justify-end border-b border-[var(--color-border)] px-3 py-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
                  aria-label="Đóng menu"
                >
                  <XMarkIcon className="size-5" />
                </button>
              </div>
              <div className="h-[calc(100%-3.25rem)]">{sidebar}</div>
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          {header ? (
            <header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6 lg:px-8">
              {sidebar ? (
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="shrink-0 rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] lg:hidden"
                  aria-label="Mở menu điều hướng"
                  aria-expanded={mobileSidebarOpen}
                >
                  <Bars3Icon className="size-5" />
                </button>
              ) : null}
              {header}
            </header>
          ) : null}
          <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </SidebarLayoutContext.Provider>
  );
}
