import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { TechnicalStandard, TechnicalStandardRequest } from '../types/technicalStandard.types';

export const useTechnicalStandards = () => {
  return useQuery({
    queryKey: ['technical-standards'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TechnicalStandard[]>>('/technical-standards');
      return data.data;
    },
  });
};

export const useProjectTechnicalStandards = (projectId: number) => {
  return useQuery({
    queryKey: ['technical-standards', 'project', projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TechnicalStandard[]>>(`/technical-standards/project/${projectId}`);
      return data.data;
    },
  });
};

export const useCreateTechnicalStandard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: TechnicalStandardRequest) => {
      const { data } = await api.post<ApiResponse<TechnicalStandard>>('/technical-standards', request);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-standards'] });
    },
  });
};

export const useUploadTechnicalFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<ApiResponse<TechnicalStandard>>(`/technical-standards/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-standards'] });
    },
  });
};

export const useDeleteTechnicalStandard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/technical-standards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technical-standards'] });
    },
  });
};
