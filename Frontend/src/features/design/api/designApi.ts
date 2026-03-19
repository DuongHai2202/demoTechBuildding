import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { DesignSheet } from '../types/design.types';

const DESIGN_KEYS = {
  all: ['design-sheets'] as const,
  project: (projectId: number) => [...DESIGN_KEYS.all, 'project', projectId] as const,
};

export function useDesignSheets(projectId: number, zoneId?: number) {
  return useQuery({
    queryKey: zoneId ? [...DESIGN_KEYS.project(projectId), 'zone', zoneId] : DESIGN_KEYS.project(projectId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DesignSheet[]>>(`/design-sheets/project/${projectId}`, {
        params: { zoneId }
      });
      return data.data;
    },
    enabled: projectId > 0,
  });
}

export function useCreateDesignSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<DesignSheet>) => {
      const { data } = await api.post<ApiResponse<DesignSheet>>('/design-sheets', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.project(variables.projectId) });
      }
    },
  });
}
export function useUpdateDesignSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<DesignSheet> }) => {
      const { data } = await api.put<ApiResponse<DesignSheet>>(`/design-sheets/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.project(data.projectId) });
    },
  });
}

export function useDeleteDesignSheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/design-sheets/${id}`);
    },
    onSuccess: () => {
      // Invalidate all design-sheets queries to be safe, 
      // or we can pass projectId in the mutation if needed
      queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.all });
    },
  });
}
