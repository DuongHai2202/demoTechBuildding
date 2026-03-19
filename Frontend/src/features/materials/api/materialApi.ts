import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types/api.types';
import type { 
  Material, 
  MaterialRequest, 
  CreateMaterialRequest, 
  MaterialNorm, 
  MaterialNormRequest,
  MaterialCategory
} from '../types/material.types';

const MATERIALS_KEY = ['materials'] as const;
const MATERIAL_CATEGORIES_KEY = ['material-categories'] as const;
const MATERIAL_REQUESTS_KEY = ['material-requests'] as const;
const MATERIAL_NORMS_KEY = ['material-norms'] as const;

// --- PMMS Foundation ---

export function useMaterialCategories() {
  return useQuery({
    queryKey: MATERIAL_CATEGORIES_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MaterialCategory[]>>('/material-categories');
      return data.data;
    },
    staleTime: 30 * 60 * 1000, // Rarely changes
  });
}

// --- Material Catalog ---

// --- Material Catalog ---

export function useMaterials() {
  return useQuery({
    queryKey: MATERIALS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Material[]>>('/materials');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSyncRevit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Material>) => {
      const { data } = await api.post<ApiResponse<Material>>('/materials/sync-revit', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_KEY });
    },
  });
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Material>) => {
      const { data } = await api.post<ApiResponse<Material>>('/materials', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_KEY });
    },
  });
}

export function useUpdateMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Material> }) => {
      const { data } = await api.put<ApiResponse<Material>>(`/materials/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_KEY });
    },
  });
}

export function useDeleteMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/materials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIALS_KEY });
    },
  });
}

// --- Material Norms ---

export function useMaterialNorms(boqItemId: number) {
  return useQuery({
    queryKey: [...MATERIAL_NORMS_KEY, boqItemId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MaterialNorm[]>>(`/material-norms/boq-item/${boqItemId}`);
      return data.data;
    },
    enabled: boqItemId > 0,
  });
}

export function useCreateMaterialNorm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: MaterialNormRequest) => {
      const { data } = await api.post<ApiResponse<MaterialNorm>>('/material-norms', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MATERIAL_NORMS_KEY, variables.boqItemId] });
    },
  });
}

export function useDeleteMaterialNorm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: number; boqItemId: number }) => {
      await api.delete(`/material-norms/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MATERIAL_NORMS_KEY, variables.boqItemId] });
    },
  });
}

// --- Material Requests (MR Workflow) ---

export function useAllMaterialRequests() {
  return useQuery({
    queryKey: MATERIAL_REQUESTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MaterialRequest[]>>('/material-requests');
      return data.data;
    },
  });
}

export function useProjectMaterialRequests(projectId: number) {
  return useQuery({
    queryKey: [...MATERIAL_REQUESTS_KEY, 'project', projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MaterialRequest[]>>(`/material-requests/project/${projectId}`);
      return data.data;
    },
    enabled: projectId > 0,
  });
}

export function useCreateMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMaterialRequest) => {
      const { data } = await api.post<ApiResponse<MaterialRequest>>('/material-requests', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MATERIAL_REQUESTS_KEY, 'project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: MATERIAL_REQUESTS_KEY });
    },
  });
}

export function useUpdateMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<CreateMaterialRequest> }) => {
      const { data } = await api.put<ApiResponse<MaterialRequest>>(`/material-requests/${id}`, payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      if (variables.payload.projectId) {
        queryClient.invalidateQueries({ queryKey: [...MATERIAL_REQUESTS_KEY, 'project', variables.payload.projectId] });
      }
      queryClient.invalidateQueries({ queryKey: MATERIAL_REQUESTS_KEY });
    },
  });
}

export function useCheckMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, notes }: { id: number; userId: number; notes?: string }) => {
      const { data } = await api.patch<ApiResponse<MaterialRequest>>(`/material-requests/${id}/check`, null, {
        params: { userId, notes }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_REQUESTS_KEY });
      toast.success('Đã chuyển trạng thái sang: KIỂM TRA');
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi kiểm tra: ${err?.response?.data?.message || err.message}`);
    }
  });
}

export function useApproveMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, notes }: { id: number; userId: number; notes?: string }) => {
      const { data } = await api.patch<ApiResponse<MaterialRequest>>(`/material-requests/${id}/approve`, null, {
        params: { userId, notes }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_REQUESTS_KEY });
      toast.success('Đã PHÊ DUYỆT yêu cầu vật tư');
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi phê duyệt: ${err?.response?.data?.message || err.message}`);
    }
  });
}

export function useRejectMaterialRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, notes }: { id: number; userId: number; notes?: string }) => {
      const { data } = await api.patch<ApiResponse<MaterialRequest>>(`/material-requests/${id}/reject`, null, {
        params: { userId, notes }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_REQUESTS_KEY });
      toast.success('Đã TỪ CHỐI yêu cầu vật tư');
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi từ chối: ${err?.response?.data?.message || err.message}`);
    }
  });
}

export function useDeleteMaterialRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number; projectId: number }) => {
      await api.delete(`/material-requests/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MATERIAL_REQUESTS_KEY, 'project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: MATERIAL_REQUESTS_KEY });
    },
  });
}
