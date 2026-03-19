import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Project, ProjectMember, ProjectRequest, Zone, ZoneRequest, ProjectSlide, ProjectSlideRequest } from '../types/project.types';
import type { MasterPlanItem, CreateMasterPlanRequest } from '../types/masterPlan.types';
import { useAuthStore } from '../../auth/stores/authStore';

export interface ProjectPermissions {
  canEditProject: boolean;
  canManageMembers: boolean;
  canManageSchedule: boolean;
  canManageZones: boolean;
  canCreateWorkLog: boolean;
  canManageContracts: boolean;
  projectRole: string | null;
}

const PROJECTS_KEY = ['projects'] as const;

// GET /api/v1/projects
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>('/projects');
      return data.data;
    },
  });
}

// GET /api/v1/projects/:id
export function useProject(projectId: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return data.data;
    },
    enabled: !!projectId && projectId > 0,
  });
}

// POST /api/v1/projects
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProjectRequest) => {
      const { data } = await api.post<ApiResponse<Project>>('/projects', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// PUT /api/v1/projects/:id
export function useUpdateProject(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProjectRequest) => {
      const { data } = await api.put<ApiResponse<Project>>(`/projects/${projectId}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId] });
    },
  });
}

// DELETE /api/v1/projects/:id
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: number) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// GET /api/v1/projects/:id/members
export function useProjectMembers(projectId: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId, 'members'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProjectMember[]>>(
        `/projects/${projectId}/members`
      );
      return data.data;
    },
    enabled: !!projectId && projectId > 0,
  });
}

// PUT /api/v1/projects/:id/members/:userId
export function useUpdateProjectMember(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const { data } = await api.put<ApiResponse<ProjectMember>>(
        `/projects/${projectId}/members/${userId}?role=${role}`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'members'] });
    },
  });
}

// POST /api/v1/projects/:id/members
export function useAddProjectMember(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { userId: number; assignedRole: string }) => {
      const { data } = await api.post<ApiResponse<void>>(
        `/projects/${projectId}/members`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'members'] });
    },
  });
}

// DELETE /api/v1/projects/:id/members/:userId
export function useRemoveProjectMember(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/projects/${projectId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'members'] });
    },
  });
}

// ===== ZONES =====

// GET /api/v1/projects/:id/zones
export function useZones(projectId: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId, 'zones'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Zone[]>>(`/projects/${projectId}/zones`);
      return data.data;
    },
    enabled: !!projectId && projectId > 0,
  });
}

// POST /api/v1/projects/:id/zones
export function useCreateZone(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ZoneRequest) => {
      const { data } = await api.post<ApiResponse<Zone>>(`/projects/${projectId}/zones`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'zones'] });
    },
  });
}

// DELETE /api/v1/projects/:id/zones/:zoneId
export function useDeleteZone(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zoneId: number) => {
      await api.delete(`/projects/${projectId}/zones/${zoneId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'zones'] });
    },
  });
}

// ===== PROJECT SLIDES =====

// GET /api/v1/projects/:id/slides
export function useProjectSlides(projectId: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId, 'slides'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProjectSlide[]>>(`/projects/${projectId}/slides`);
      return data.data;
    },
    enabled: !!projectId && projectId > 0,
  });
}

// POST /api/v1/projects/:id/slides
export function useCreateSlide(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProjectSlideRequest) => {
      const { data } = await api.post<ApiResponse<ProjectSlide>>(`/projects/${projectId}/slides`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'slides'] });
    },
  });
}

// DELETE /api/v1/projects/:id/slides/:slideId
export function useDeleteSlide(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slideId: number) => {
      await api.delete(`/projects/${projectId}/slides/${slideId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'slides'] });
    },
  });
}
// ===== MASTER PLAN (SCHEDULE) =====

// GET /api/v1/projects/:id/master-plan
export function useMasterPlan(projectId: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId, 'master-plan'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<MasterPlanItem[]>>(
        `/projects/${projectId}/master-plan`
      );
      return data.data;
    },
    enabled: !!projectId && projectId > 0,
  });
}

// POST /api/v1/projects/:id/master-plan
export function useCreateMasterPlanItem(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMasterPlanRequest) => {
      const { data } = await api.post<ApiResponse<MasterPlanItem>>(
        `/projects/${projectId}/master-plan`,
        payload
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'master-plan'] });
    },
  });
}

// PATCH /api/v1/projects/:id/master-plan/:planId
export function useUpdateMasterPlanProgress(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ planId, progress, status }: { planId: number; progress: number; status: string }) => {
      const { data } = await api.patch<ApiResponse<MasterPlanItem>>(
        `/projects/${projectId}/master-plan/${planId}`,
        null,
        { params: { progress, status } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_KEY, projectId, 'master-plan'] });
    },
  });
}

// ===== PERMISSIONS =====

export function useMyProjectPermission(projectId: number): ProjectPermissions {
  const user = useAuthStore((s) => s.user);
  const { data: members } = useProjectMembers(projectId);

  const globalRoles = user?.roles || [];
  const isAdmin = globalRoles.includes('ADMIN');
  const isGlobalPM = globalRoles.includes('PM');

  const myMemberInfo = members?.find(m => m.userId === user?.id);
  const projectRole = myMemberInfo?.assignedRole || null;

  // Logic based on RBAC Matrix in GUILD.md
  const isProjectPM = projectRole === 'PM';
  const isSupervisor = projectRole === 'SUPERVISOR';
  const isEngineer = projectRole === 'ENGINEER';

  return {
    canEditProject: isAdmin || isGlobalPM,
    canManageMembers: isAdmin || isProjectPM,
    canManageSchedule: isAdmin || isGlobalPM || isProjectPM || isSupervisor || isEngineer,
    canManageZones: isAdmin || isGlobalPM || isProjectPM || isSupervisor || isEngineer,
    canCreateWorkLog: isAdmin || isEngineer || isSupervisor || isProjectPM,
    canManageContracts: isAdmin || isGlobalPM || isProjectPM,
    projectRole,
  };
}
