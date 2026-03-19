import { useMutation } from '@tanstack/react-query';

import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { User } from '../../users/types/user.types';
import type { LoginRequest, RegisterRequest, TokenResponse, VerifyOtpRequest } from '../types/auth.types';
import { useAuthStore } from '../stores/authStore';

// === API Functions ===

async function loginFn(data: LoginRequest): Promise<TokenResponse> {
  const res = await api.post<ApiResponse<TokenResponse>>('/auth/login', data);
  return res.data.data;
}

async function fetchProfileFn(): Promise<User> {
  const res = await api.get<ApiResponse<User>>('/auth/my-profile'); // Giả định endpoint profile
  return res.data.data;
}

async function registerFn(data: RegisterRequest): Promise<void> {
  await api.post('/auth/register', data);
}

async function verifyOtpFn(data: VerifyOtpRequest): Promise<void> {
  await api.post('/auth/verify-otp', data);
}

// === React Query Hooks ===

export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const tokens = await loginFn(data);
      setTokens(tokens.accessToken, tokens.refreshToken);
      const user = await fetchProfileFn();
      setUser(user);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: registerFn,
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtpFn,
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      logout();
      window.location.href = '/login';
    },
  });
}
