import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';

export interface BimModel {
  id: number;
  projectId: number;
  zoneId?: number;
  zoneName?: string;
  modelName: string;
  fileUrl: string;
  version?: string;
  description?: string;
  fileSize?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

const BIM_KEYS = {
  all: ['bim-models'] as const,
  project: (projectId: number) => [...BIM_KEYS.all, 'project', projectId] as const,
};

export function useBimModels(projectId: number, zoneId?: number) {
  return useQuery({
    queryKey: zoneId ? [...BIM_KEYS.project(projectId), 'zone', zoneId] : BIM_KEYS.project(projectId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BimModel[]>>(`/bim-models/project/${projectId}`, {
        params: { zoneId }
      });
      return data.data;
    },
    enabled: projectId > 0,
  });
}

export function useCreateModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BimModel>) => {
      const { data } = await api.post<ApiResponse<BimModel>>('/bim-models', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: BIM_KEYS.project(variables.projectId) });
      }
    },
  });
}

export function useUpdateModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<BimModel> }) => {
      const { data } = await api.put<ApiResponse<BimModel>>(`/bim-models/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BIM_KEYS.project(data.projectId) });
    },
  });
}

export function useDeleteModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bim-models/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BIM_KEYS.all });
    },
  });
}

// Helper to handle file upload
export function useUploadBimFile() {
  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const { data } = await api.post<ApiResponse<string>>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data;
    },
  });
}
