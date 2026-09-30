import { useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { useLogin } from '../api/authApi';
import { type LoginFormData, loginSchema } from '../types/auth.schemas';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

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
      loginMutation.mutate(data, {
        onSuccess: () => {
          navigate('/', { replace: true });
        },
        onError: (err: unknown) => {
          const apiMessage = (err as { response?: { data?: { message?: unknown } } })
            .response?.data?.message;
          let message = typeof apiMessage === 'string'
            ? apiMessage
            : 'Đăng nhập thất bại. Vui lòng thử lại!';
          if (typeof message === 'string') {
            if (message.includes('Bad credentials')) {
              message = 'Tên đăng nhập hoặc mật khẩu không chính xác!';
            } else if (message.includes('not activated') || message.includes('OTP')) {
              message = 'Tài khoản chưa được kích hoạt. Vui lòng xác thực mã OTP!';
            } else if (message.includes('User not found')) {
              message = 'Tài khoản không tồn tại trong hệ thống!';
            }
          }
          setError('root', { type: 'manual', message });
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
          {errors.root.message}
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
