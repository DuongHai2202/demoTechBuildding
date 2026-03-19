import { Link, useLocation } from 'react-router-dom';

import { LoginForm } from '../../features/auth/components/LoginForm';

export default function LoginPage() {
  const location = useLocation();
  const successMessage = location.state?.message as string | undefined;

  return (
    <div>
      <h2 className="mb-6 text-center text-2xl font-bold text-[var(--color-text-primary)]">
        Đăng nhập
      </h2>

      {successMessage && (
        <div className="mb-6 rounded-lg bg-[var(--color-success-bg)] p-4 text-sm font-medium text-[var(--color-success)]">
          {successMessage}
        </div>
      )}

      <LoginForm />

      <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
