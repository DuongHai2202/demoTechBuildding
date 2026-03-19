import { VerifyOtpForm } from '../../features/auth/components/VerifyOtpForm';

export default function VerifyOtpPage() {
  return (
    <div>
      <h2 className="mb-2 text-center text-xl font-bold text-[var(--color-text-primary)]">
        Xác Thực Tài Khoản
      </h2>
      <p className="mb-6 text-center text-sm text-[var(--color-text-muted)]">
        Vui lòng nhập mã OTP để hoàn tất đăng ký
      </p>

      <VerifyOtpForm />
    </div>
  );
}
