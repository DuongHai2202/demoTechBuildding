export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';

export interface Project {
  id: number;
  name: string;
  projectCode?: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface ProjectRequest {
  name: string;
  projectCode?: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
}

export interface ProjectMember {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  assignedRole: string;
  joinedAt: string;
}

export interface Zone {
  id: number;
  projectId: number;
  name: string;
  zoneCode: string;
  parentId: number | null;
  children?: Zone[];
}

export interface ZoneRequest {
  name: string;
  zoneCode: string;
  parentId?: number;
}

export interface ProjectSlide {
  id: number;
  projectId: number;
  imageUrl: string;
  caption: string;
  displayOrder: number;
}

export interface ProjectSlideRequest {
  imageUrl: string;
  caption?: string;
  displayOrder?: number;
}
