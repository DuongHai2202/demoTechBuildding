import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import { toast } from 'sonner';
import type { ApiResponse } from '../../../types/api.types';
import type { WorkLog } from '../types/worklog.types';

const WORKLOGS_KEY = ['worklogs'] as const;

// GET /api/v1/work-logs (all)
export function useAllWorkLogs() {
  return useQuery({
    queryKey: [...WORKLOGS_KEY, 'all'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WorkLog[]>>('/work-logs');
      return data.data;
    },
  });
}

// GET /api/v1/work-logs/project/:id
export function useProjectWorkLogs(projectId: number) {
  return useQuery({
    queryKey: [...WORKLOGS_KEY, projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WorkLog[]>>(`/work-logs/project/${projectId}`);
      return data.data;
    },
    enabled: projectId > 0,
  });
}

// POST /api/v1/work-logs (multipart/form-data)
export function useCreateWorkLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData }: { projectId: number; formData: FormData }) => {
      const { data } = await api.post<ApiResponse<WorkLog>>('/work-logs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...WORKLOGS_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [...WORKLOGS_KEY, 'all'] });
    },
  });
}

// DELETE /api/v1/work-logs/:id
export function useDeleteWorkLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: number; projectId: number }) => {
      await api.delete(`/work-logs/${id}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...WORKLOGS_KEY, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: [...WORKLOGS_KEY, 'all'] });
    },
  });
}

// PATCH /api/v1/work-logs/:id/check
export function useCheckWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, notes }: { id: number; userId: number; notes?: string }) => {
      const { data } = await api.patch<ApiResponse<WorkLog>>(`/work-logs/${id}/check`, null, {
        params: { userId, notes }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORKLOGS_KEY] });
      toast.success('Đã chuyển trạng thái sang: KIỂM TRA');
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi kiểm tra: ${err?.response?.data?.message || err.message}`);
    }
  });
}

// PATCH /api/v1/work-logs/:id/approve
export function useApproveWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, notes }: { id: number; userId: number; notes?: string }) => {
      const { data } = await api.patch<ApiResponse<WorkLog>>(`/work-logs/${id}/approve`, null, {
        params: { userId, notes }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORKLOGS_KEY] });
      toast.success('Đã PHÊ DUYỆT nhật ký thi công');
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi phê duyệt: ${err?.response?.data?.message || err.message}`);
    }
  });
}

// PATCH /api/v1/work-logs/:id/reject
export function useRejectWorkLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userId, notes }: { id: number; userId: number; notes?: string }) => {
      const { data } = await api.patch<ApiResponse<WorkLog>>(`/work-logs/${id}/reject`, null, {
        params: { userId, notes }
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...WORKLOGS_KEY] });
      toast.success('Đã TỪ CHỐI nhật ký thi công');
    },
    onError: (err: any) => {
      toast.error(`Lỗi khi từ chối: ${err?.response?.data?.message || err.message}`);
    }
  });
}
