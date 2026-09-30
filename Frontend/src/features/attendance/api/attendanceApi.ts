import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Attendance, CheckInRequest, CheckOutRequest, OvertimeReviewRequest } from '../types/attendance.types';
import type {
  FullDayShiftAssignmentRequest,
  ShiftAssignment,
  ShiftAssignmentRequest,
  ShiftTemplate,
  ShiftTemplateRequest,
} from '../types/shift.types';

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
export function usePersonalHistory(userId: number, startDate: string, endDate: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'personal', userId, startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance[]>>(`/attendance/personal/${userId}`, {
        params: { startDate, endDate },
      });
      return data.data;
    },
    enabled: !!userId && (options?.enabled ?? true),
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
export function useAllAttendance(startDate: string, endDate: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'all', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance[]>>('/attendance', {
        params: { startDate, endDate },
      });
      return data.data;
    },
    enabled: options?.enabled ?? true,
  });
}

// GET /api/v1/attendance/today
export function useTodayRecord(userId: number, projectId: number, date: string, options?: { enabled?: boolean }) {
  const enabled = !!userId && !!projectId && (options?.enabled ?? true);
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'today', userId, projectId, date],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Attendance>>('/attendance/today', {
        params: { userId, projectId },
      });
      return data?.data ?? null;
    },
    enabled,
    refetchInterval: enabled ? 5_000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

// POST /api/v1/attendance/log-failure
export function useLogFailure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userId: number; projectId: number; reason: string; latitude?: number; longitude?: number; accuracy?: number }) => {
      await api.post('/attendance/log-failure', payload);
    },
    onSuccess: (_, variables) => {
      // Invalidate project history to reflect the new failure log in the admin view
      queryClient.invalidateQueries({ queryKey: [...ATTENDANCE_KEY, 'project', variables.projectId] });
    },
  });
}

// PATCH /api/v1/attendance/:id/overtime
export function useReviewOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ attendanceId, request }: { attendanceId: number; request: OvertimeReviewRequest }) => {
      const { data } = await api.patch<ApiResponse<Attendance>>(`/attendance/${attendanceId}/overtime`, request);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
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

const SHIFT_KEY = [...ATTENDANCE_KEY, 'shifts'] as const;

// GET /api/v1/shifts/assignments/current
export function useCurrentShift(userId: number, projectId: number, date: string, options?: { enabled?: boolean }) {
  const enabled = !!userId && !!projectId && (options?.enabled ?? true);
  return useQuery({
    queryKey: [...SHIFT_KEY, 'current', userId, projectId, date],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ShiftAssignment>>('/shifts/assignments/current', {
        params: { userId, projectId, date },
      });
      return data?.data ?? null;
    },
    enabled,
    // A manager can assign a shift from another browser. Poll only while the
    // attendance screen is active so the employee does not need to refresh.
    refetchInterval: enabled ? 5_000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useShiftTemplates(projectId?: number) {
  return useQuery({
    queryKey: [...SHIFT_KEY, 'templates', projectId ?? 'all'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ShiftTemplate[]>>('/shifts/templates', {
        params: projectId ? { projectId } : undefined,
      });
      return data.data;
    },
  });
}

export function useShiftAssignments(params: { from: string; to: string; projectId?: number; userId?: number }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...SHIFT_KEY, 'assignments', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ShiftAssignment[]>>('/shifts/assignments', { params });
      return data.data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useCreateShiftAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ShiftAssignmentRequest) => {
      const { data } = await api.post<ApiResponse<ShiftAssignment>>('/shifts/assignments', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIFT_KEY });
      // The current attendance query may still contain the automatic ABSENT
      // snapshot. Refresh it so the employee can start a newly approved late
      // check-in immediately without a manual page reload.
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useCreateFullDayShiftAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FullDayShiftAssignmentRequest) => {
      const { data } = await api.post<ApiResponse<ShiftAssignment>>('/shifts/assignments/full-day', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIFT_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useApproveLateCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignmentId, reason }: { assignmentId: number; reason: string }) => {
      const { data } = await api.post<ApiResponse<ShiftAssignment>>(
        `/shifts/assignments/${assignmentId}/late-checkin`,
        { reason },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIFT_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useRevokeLateCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: number) => {
      await api.delete(`/shifts/assignments/${assignmentId}/late-checkin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIFT_KEY });
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

export function useCancelShiftAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentId: number) => {
      await api.delete(`/shifts/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHIFT_KEY });
    },
  });
}

export function useCreateShiftTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ShiftTemplateRequest) => {
      const { data } = await api.post<ApiResponse<ShiftTemplate>>('/shifts/templates', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SHIFT_KEY, 'templates'] });
    },
  });
}
