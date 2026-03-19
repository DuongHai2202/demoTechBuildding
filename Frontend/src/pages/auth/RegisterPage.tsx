import { Link } from 'react-router-dom';

import { RegisterForm } from '../../features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-[var(--color-text-primary)]">
        Đăng ký tài khoản
      </h2>
      <p className="mb-6 text-center text-sm text-[var(--color-text-muted)]">
        Tạo tài khoản mới để tham gia dự án
      </p>

      <RegisterForm />

      <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
