import { Suspense } from 'react';

import { Outlet } from 'react-router-dom';

import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-md rounded-xl bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card-theme)]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary-500">
            TechBuilding
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Hệ thống quản lý dự án xây dựng
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
