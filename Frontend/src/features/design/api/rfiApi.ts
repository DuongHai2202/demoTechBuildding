import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Rfi, RfiComment } from '../types/design.types';

const RFI_KEYS = {
  all: ['rfis'] as const,
  project: (projectId: number) => [...RFI_KEYS.all, 'project', projectId] as const,
  detail: (id: number) => [...RFI_KEYS.all, 'detail', id] as const,
  comments: (id: number) => [...RFI_KEYS.detail(id), 'comments'] as const,
};

export function useRfis(projectId: number, zoneId?: number) {
  return useQuery({
    queryKey: [...RFI_KEYS.all, 'project', projectId, zoneId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Rfi[]>>(`/rfis/project/${projectId}`, {
        params: { zoneId }
      });
      return data.data;
    },
    enabled: projectId > 0,
  });
}

export function useRfi(id: number) {
  return useQuery({
    queryKey: RFI_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Rfi>>(`/rfis/${id}`);
      return data.data;
    },
    enabled: id > 0,
  });
}

export function useCreateRfi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Rfi>) => {
      const { data } = await api.post<ApiResponse<Rfi>>('/rfis', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: RFI_KEYS.project(variables.projectId) });
      }
    },
  });
}

export function useUpdateRfiStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch<ApiResponse<Rfi>>(`/rfis/${id}/status`, null, {
        params: { status }
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: RFI_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: RFI_KEYS.project(data.projectId) });
    },
  });
}

export function useRfiComments(rfiId: number) {
  return useQuery({
    queryKey: RFI_KEYS.comments(rfiId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RfiComment[]>>(`/rfis/${rfiId}/comments`);
      return data.data;
    },
    enabled: rfiId > 0,
  });
}

export function useAddRfiComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ rfiId, content, userId }: { rfiId: number; content: string; userId: number }) => {
      const { data } = await api.post<ApiResponse<RfiComment>>(`/rfis/${rfiId}/comments`, { content, userId });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: RFI_KEYS.comments(variables.rfiId) });
    },
  });
}

export function useDeleteRfi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/rfis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RFI_KEYS.all });
    },
  });
}
