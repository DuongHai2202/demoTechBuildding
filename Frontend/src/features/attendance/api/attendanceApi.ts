import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Attendance, CheckInRequest, CheckOutRequest } from '../types/attendance.types';

const ATTENDANCE_KEY = ['attendance'] as const;

// POST /api/v1/attendance/check-in (Multipart)
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, data, selfie }: { userId: number; data: CheckInRequest; selfie?: File }) => {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      if (selfie) {
        formData.append('selfie', selfie);
      }

      const response = await api.post<ApiResponse<Attendance>>(`/attendance/check-in?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

// POST /api/v1/attendance/check-out/:projectId (Multipart)
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, projectId, data, selfie }: { userId: number; projectId: number; data: CheckOutRequest; selfie?: File }) => {
      const formData = new FormData();
      formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
      if (selfie) {
        formData.append('selfie', selfie);
      }

      const response = await api.post<ApiResponse<Attendance>>(`/attendance/check-out/${projectId}?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

// GET /api/v1/attendance/personal/:userId
export function usePersonalHistory(userId: number, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'personal', userId, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance[]>>(`/attendance/personal/${userId}`, {
        params: { startDate, endDate },
      });
      return data.data;
    },
    enabled: !!userId,
  });
}

// GET /api/v1/attendance/project/:projectId
export function useProjectHistory(projectId: number, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'project', projectId, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance[]>>(`/attendance/project/${projectId}`, {
        params: { startDate, endDate },
      });
      return data.data;
    },
    enabled: !!projectId,
  });
}

// GET /api/v1/attendance
export function useAllAttendance(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'all', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance[]>>('/attendance', {
        params: { startDate, endDate },
      });
      return data.data;
    },
  });
}

// GET /api/v1/attendance/today
export function useTodayRecord(userId: number, projectId: number, date: string) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'today', userId, projectId, date],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance>>('/attendance/today', {
        params: { userId, projectId },
      });
      return data?.data ?? null;
    },
    enabled: !!userId && !!projectId,
  });
}

// POST /api/v1/attendance/log-failure
export function useLogFailure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userId: number; projectId: number; reason: string; latitude?: number; longitude?: number }) => {
      await api.post('/attendance/log-failure', payload);
    },
    onSuccess: (_, variables) => {
      // Invalidate project history to reflect the new failure log in the admin view
      queryClient.invalidateQueries({ queryKey: [...ATTENDANCE_KEY, 'project', variables.projectId] });
    },
  });
}

// GET /api/v1/attendance/export/excel/:projectId (Utility function)
export const exportAttendanceExcel = async (projectId: number, startDate: string, endDate: string) => {
  const response = await api.get(`/attendance/export/excel/${projectId}`, {
    params: { startDate, endDate },
    responseType: 'blob',
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `attendance_project_${projectId}_${startDate}_to_${endDate}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
