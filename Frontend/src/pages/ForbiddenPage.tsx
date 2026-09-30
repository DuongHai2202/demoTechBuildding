import { Link } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <ShieldExclamationIcon className="size-8" />
        </div>
        <h1 className="mt-5 text-xl font-bold text-[var(--color-text-primary)]">Bạn chưa được cấp quyền</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
          Tài khoản hiện tại không có quyền sử dụng chức năng này. Hãy liên hệ quản trị viên nếu cần được cấp quyền.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Về trang chủ</Link>
      </div>
    </div>
  );
}
