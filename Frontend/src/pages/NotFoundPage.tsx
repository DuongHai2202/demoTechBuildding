import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)]">
      <h1 className="text-6xl font-bold text-500">404</h1>
      <p className="mt-4 text-lg text-[var(--color-text-muted)]">
        Trang bạn tìm không tồn tại
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
