import { Suspense } from 'react';

import { Outlet } from 'react-router-dom';

import { LoadingSkeleton } from '../components/LoadingSkeleton';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16">
        <section className="hidden lg:block" aria-labelledby="auth-brand-title">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[var(--color-primary)]/15 bg-[var(--color-primary-light)] px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
            <span className="flex size-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-extrabold text-white">
              TB
            </span>
            Nền tảng quản lý thi công
          </div>
          <h1 id="auth-brand-title" className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[var(--color-text-primary)] xl:text-5xl">
            Điều hành công trình rõ ràng, từ văn phòng đến hiện trường.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-text-muted)]">
            Theo dõi dự án, nhân sự, vật tư và nhật ký thi công trong một không gian thống nhất.
          </p>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <p className="font-bold text-[var(--color-text-primary)]">Dự án</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Một nguồn dữ liệu chung</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <p className="font-bold text-[var(--color-text-primary)]">Hiện trường</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Ghi nhận theo thời gian</p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm">
              <p className="font-bold text-[var(--color-text-primary)]">Kiểm soát</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Phân quyền minh bạch</p>
            </div>
          </div>
        </section>

        <main className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)] sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-lg font-extrabold text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/15">
              TB
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              TechBuilding
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Hệ thống quản lý dự án xây dựng
            </p>
          </div>

          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
