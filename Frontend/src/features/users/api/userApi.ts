import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { User, UserRequest } from '../types/user.types';

const USERS_KEY = ['users'] as const;

// GET /api/v1/users
export function useUsers(query?: string) {
  return useQuery({
    queryKey: [...USERS_KEY, query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User[]>>('/users', {
        params: { query },
      });
      return data.data;
    },
    enabled: true,
  });
}

// POST /api/v1/users
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UserRequest) => {
      const { data } = await api.post<ApiResponse<User>>('/users', payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

// PUT /api/v1/users/:id
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<UserRequest> }) => {
      const { data } = await api.put<ApiResponse<User>>(`/users/${id}`, payload);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

// DELETE /api/v1/users/:id
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

