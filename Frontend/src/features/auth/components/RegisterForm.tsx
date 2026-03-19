import { useCallback } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useRegister } from '../api/authApi';
import { type RegisterFormData, registerSchema } from '../types/auth.schemas';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = useCallback(
    (data: RegisterFormData) => {
      registerMutation.mutate(data, {
        onSuccess: () => {
          navigate('/verify-otp', { state: { username: data.username } });
        },
        onError: (err: any) => {
          const message = err.response?.data?.message || 'Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.';
          setError('root', { type: 'manual', message });
        },
      });
    },
    [registerMutation, navigate, setError]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Tên đăng nhập"
        placeholder="Nhập tên đăng nhập"
        error={errors.username?.message}
        required
        {...register('username')}
      />

      <Input
        label="Mật khẩu"
        type="password"
        placeholder="Tối thiểu 6 ký tự"
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <Input
        label="Họ và tên"
        placeholder="Nhập họ và tên"
        error={errors.fullName?.message}
        {...register('fullName')}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Số điện thoại"
          placeholder="Nhập số điện thoại"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Email"
          type="email"
          placeholder="Nhập email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {errors.root && (
        <div className="rounded-lg bg-[var(--color-danger-bg)] p-3 text-sm text-[var(--color-danger)]">
          {errors.root.message}
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        isLoading={registerMutation.isPending}
        className="mt-6"
      >
        Đăng ký
      </Button>
    </form>
  );
}
