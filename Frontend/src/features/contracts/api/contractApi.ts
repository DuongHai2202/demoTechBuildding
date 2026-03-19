import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Contract, BoqItem, BoqItemRequest, Drawing, ContractMaterialLimit, ContractMaterialLimitRequest, ContractAttachment } from '../types/contract.types';

const CONTRACTS_KEY = ['contracts'] as const;

// GET /api/v1/contracts
export function useContracts() {
  return useQuery({
    queryKey: CONTRACTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Contract[]>>('/contracts');
      return data.data;
    },
  });
}

// GET /api/v1/contracts/project/:id
export function useProjectContracts(projectId: number) {
  return useQuery({
    queryKey: [...CONTRACTS_KEY, 'project', projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Contract[]>>(`/contracts/project/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
  });
}

// GET /api/v1/contracts/:id
export function useContract(contractId: number) {
  return useQuery({
    queryKey: [...CONTRACTS_KEY, contractId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Contract>>(`/contracts/${contractId}`);
      return data.data;
    },
    enabled: !!contractId && contractId > 0,
  });
}

// POST /api/v1/contracts (Multipart)
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData }: { formData: FormData }) => {
      const { data } = await api.post<ApiResponse<Contract>>('/contracts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_KEY });
    },
  });
}

// DELETE /api/v1/contracts/:id
export function useDeleteContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      await api.delete(`/contracts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTRACTS_KEY });
    },
  });
}

// ===== BOQ ITEMS =====

// GET /api/v1/contracts/:id/boq-items
export function useBoqItems(contractId: number) {
  return useQuery({
    queryKey: [...CONTRACTS_KEY, contractId, 'boq'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BoqItem[]>>(`/contracts/${contractId}/boq-items`);
      return data.data;
    },
    enabled: !!contractId && contractId > 0,
  });
}

// POST /api/v1/contracts/:id/boq-items
export function useCreateBoqItem(contractId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BoqItemRequest) => {
      const { data } = await api.post<ApiResponse<BoqItem>>(`/contracts/${contractId}/boq-items`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CONTRACTS_KEY, contractId, 'boq'] });
    },
  });
}

// ===== DRAWINGS =====

// GET /api/v1/drawings/contract/:id
export function useContractDrawings(contractId: number) {
  return useQuery({
    queryKey: ['drawings', 'contract', contractId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Drawing[]>>(`/drawings/contract/${contractId}`);
      return data.data;
    },
    enabled: !!contractId && contractId > 0,
  });
}

// DELETE /api/v1/contracts/:contractId/boq-items/:id
export function useDeleteBoqItem(contractId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/contracts/${contractId}/boq-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CONTRACTS_KEY, contractId, 'boq'] });
    },
  });
}

// POST /api/v1/drawings
export function useCreateDrawing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { projectId: number; contractId: number; name: string; drawingNumber?: string; fileUrl: string; version?: string }) => {
      const { data } = await api.post<ApiResponse<Drawing>>('/drawings', payload);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drawings', 'contract', variables.contractId] });
      queryClient.invalidateQueries({ queryKey: ['drawings', 'project', variables.projectId] });
    },
  });
}

// DELETE /api/v1/drawings/:id
export function useDeleteDrawing(contractId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/drawings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drawings', 'contract', contractId] });
    },
  });
}

// ===== MATERIAL LIMITS =====

// GET /api/v1/contracts/:id/material-limits
export function useContractMaterialLimits(contractId: number) {
  return useQuery({
    queryKey: [...CONTRACTS_KEY, contractId, 'limits'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ContractMaterialLimit[]>>(`/contracts/${contractId}/material-limits`);
      return data.data;
    },
    enabled: !!contractId && contractId > 0,
  });
}

// POST /api/v1/contracts/material-limits
export function useSetContractMaterialLimit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ContractMaterialLimitRequest) => {
      await api.post('/contracts/material-limits', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...CONTRACTS_KEY, variables.contractId, 'limits'] });
    },
  });
}

// ===== ATTACHMENTS =====

// GET /api/v1/contracts/:id/attachments
export function useContractAttachments(contractId: number) {
  return useQuery({
    queryKey: [...CONTRACTS_KEY, contractId, 'attachments'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ContractAttachment[]>>(`/contracts/${contractId}/attachments`);
      return data.data;
    },
    enabled: !!contractId && contractId > 0,
  });
}

// POST /api/v1/contracts/:id/attachments
export function useUploadContractAttachment(contractId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, userId }: { file: File; userId?: number }) => {
      const formData = new FormData();
      formData.append('file', file);
      const url = `/contracts/${contractId}/attachments${userId ? `?userId=${userId}` : ''}`;
      const { data } = await api.post<ApiResponse<ContractAttachment>>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CONTRACTS_KEY, contractId, 'attachments'] });
    },
  });
}

// DELETE /api/v1/contracts/attachments/:id
export function useDeleteContractAttachment(contractId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attachmentId: number) => {
      await api.delete(`/contracts/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CONTRACTS_KEY, contractId, 'attachments'] });
    },
  });
}
