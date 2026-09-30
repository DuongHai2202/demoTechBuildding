import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Notification } from '../types/notification.types';

export const NOTIFICATIONS_KEY = ['notifications', 'me'] as const;

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Notification[]>>('/notifications/me');
      return data.data;
    },
    enabled,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current = []) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, isRead: true } : notification,
        ),
      );

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/me/read-all');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_KEY });
      const previous = queryClient.getQueryData<Notification[]>(NOTIFICATIONS_KEY);

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current = []) =>
        current.map((notification) => ({ ...notification, isRead: true })),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
