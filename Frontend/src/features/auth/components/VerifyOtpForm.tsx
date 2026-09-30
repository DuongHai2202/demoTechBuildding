import { useCallback, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';

import { useVerifyOtp } from '../api/authApi';
import { type VerifyOtpFormData, verifyOtpSchema } from '../types/auth.schemas';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

type ApiError = Error & {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function VerifyOtpForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const verifyMutation = useVerifyOtp();

  // Retrieve username from registration step (if passed via state)
  const registrationState = (location.state || {}) as {
    username?: string;
    email?: string;
    demoOtp?: string | null;
    otpExpiresInSeconds?: number;
    emailQueued?: boolean;
  };
  const username = registrationState.username || '';
  const demoOtp = registrationState.demoOtp || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<VerifyOtpFormData>({
    resolver: zodResolver(verifyOtpSchema),
  });

  useEffect(() => {
    if (demoOtp) {
      setValue('otpCode', demoOtp, { shouldDirty: true, shouldValidate: true });
    }
  }, [demoOtp, setValue]);

  const onSubmit = useCallback(
    (data: VerifyOtpFormData) => {
      if (!username) {
        setError('root', { type: 'manual', message: 'Thiếu thông tin người dùng. Vui lòng đăng ký lại.' });
        return;
      }

      verifyMutation.mutate(
        { username, otpCode: data.otpCode },
        {
          onSuccess: () => {
             navigate('/login', { state: { message: 'Xác thực thành công. Vui lòng đăng nhập.' } });
          },
          onError: (err: ApiError) => {
            const message = err.response?.data?.message || 'Xác thực thất bại hoặc mã OTP không đúng.';
            setError('root', { type: 'manual', message });
          },
        }
      );
    },
    [verifyMutation, navigate, username, setError]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center text-sm text-[var(--color-text-secondary)]">
        Mã OTP đã được gửi đến {registrationState.email || 'email/SĐT'} của tài khoản <strong className="text-[var(--color-text-primary)]">{username}</strong>
      </div>

      {demoOtp && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <strong>Chế độ demo:</strong> mã OTP đã được backend điền tự động. Luồng gửi email và xác thực Redis vẫn được thực hiện đầy đủ.
        </div>
      )}

      <Input
        label="Mã xác thực OTP"
        placeholder="Nhập 6 số"
        error={errors.otpCode?.message}
        maxLength={6}
        className="text-center text-lg tracking-[0.5em]"
        required
        {...register('otpCode')}
      />

      {errors.root && (
        <div className="rounded-lg bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger)]">
          {errors.root.message}
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        isLoading={verifyMutation.isPending}
        className="mt-6"
      >
        Xác thực
      </Button>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </form>
  );
}
