import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Notification } from '../types/notification.types';

const NOTIFICATIONS_KEY = ['notifications'] as const;

export function useNotifications(userId: number) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Notification[]>>(`/notifications/me/${userId}`);
      return data.data;
    },
    enabled: userId > 0,
    refetchInterval: 30000, // Refetch every 30 seconds for new notifications
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await api.patch(`/notifications/me/${userId}/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
