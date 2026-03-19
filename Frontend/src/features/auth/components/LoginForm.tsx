import { useCallback } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useLogin } from '../api/authApi';
import { type LoginFormData, loginSchema } from '../types/auth.schemas';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

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
        onError: (err: any) => {
          const message = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';
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
        {...register('username')}
      />

      <Input
        label="Mật khẩu"
        type="password"
        placeholder="Nhập mật khẩu"
        error={errors.password?.message}
        {...register('password')}
      />

      {errors.root && (
        <div className="rounded-lg bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger)]">
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
