import { useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useLogin } from '../api/authApi';
import { type LoginFormData, loginSchema } from '../types/auth.schemas';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { getApiErrorInfo } from '../../../services/apiError';

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [supportCode, setSupportCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = useCallback(
    (data: LoginFormData) => {
      setSupportCode(null);
      loginMutation.mutate(data, {
        onSuccess: () => {
          navigate('/', { replace: true });
        },
        onError: (err: unknown) => {
          const info = getApiErrorInfo(err, 'Đăng nhập thất bại. Vui lòng thử lại.');
          setSupportCode(info.supportCode ?? null);
          setError('root', { type: 'manual', message: info.message });
        },
      });
    },
    [loginMutation, navigate, setError]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Tên đăng nhập"
        placeholder="Nhập tên đăng nhập"
        error={errors.username?.message}
        autoComplete="username"
        required
        {...register('username')}
      />

      <Input
        label="Mật khẩu"
        type={showPassword ? 'text' : 'password'}
        placeholder="Nhập mật khẩu"
        error={errors.password?.message}
        autoComplete="current-password"
        required
        rightIcon={(
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="rounded-md p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        )}
        {...register('password')}
      />

      {errors.root && (
        <div role="alert" className="rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] p-3 text-sm font-medium text-[var(--color-danger)]">
          <p>{errors.root.message}</p>
          {supportCode && (
            <p className="mt-1 text-xs font-normal opacity-75">
              Mã hỗ trợ: {supportCode}. Chỉ cung cấp mã này khi liên hệ quản trị viên.
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        isLoading={loginMutation.isPending}
        className="mt-6"
      >
        Đăng nhập
      </Button>
    </form>
  );
}
