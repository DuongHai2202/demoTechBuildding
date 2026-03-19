import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Partner, PartnerRequest } from '../types/partner.types';

export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Partner[]>>('/partners');
      return data.data;
    },
  });
};

export const usePartner = (id: number) => {
  return useQuery({
    queryKey: ['partners', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Partner>>(`/partners/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partner: PartnerRequest) => {
      const { data } = await api.post<ApiResponse<Partner>>('/partners', partner);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, partner }: { id: number; partner: PartnerRequest }) => {
      const { data } = await api.put<ApiResponse<Partner>>(`/partners/${id}`, partner);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partners', variables.id] });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/partners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
};
