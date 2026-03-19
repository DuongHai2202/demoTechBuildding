import { type ReactNode, Suspense } from 'react';

import { Outlet } from 'react-router-dom';

import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface MainLayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
}

export function MainLayout({ sidebar, header }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      {sidebar ? (
        <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
          {sidebar}
        </aside>
      ) : null}
      <div className="flex flex-1 flex-col">
        {header ? (
          <header className="flex h-16 items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-8">
            {header}
          </header>
        ) : null}
        <main className="flex-1 overflow-auto p-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
