export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type UserRole = 'ADMIN' | 'PM' | 'STAFF' | 'PARTNER' | 'GUEST';

export interface User {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: string;
  roles: UserRole[];
  hasFaceRegistered?: boolean;
  faceDescriptor?: string;
}

export interface RoleRequest {
  id: number;
  username: string;
  fullName: string;
  requestedRoleName: UserRole;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  createdAt: string;
}

export interface UserRequest {
  username: string;
  password: string;
  fullName?: string;
  phone?: string;
  email?: string;
  roles?: UserRole[];
  status?: UserStatus;
}
