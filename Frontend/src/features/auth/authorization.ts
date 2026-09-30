import type { User, UserRole } from '../users/types/user.types';

/**
 * UI permission names mirror the business capabilities enforced by the API.
 * A user has exactly one global role in the current account flow, so the
 * effective permission set comes from that role. Keeping this list central
 * prevents each page from inventing its own role checks.
 */
export type Permission =
  | 'DASHBOARD_VIEW'
  | 'PROJECT_READ'
  | 'PROJECT_MANAGE'
  | 'PROJECT_MEMBER_MANAGE'
  | 'ATTENDANCE_USE'
  | 'ATTENDANCE_MANAGE'
  | 'WORKLOG_READ'
  | 'WORKLOG_CREATE'
  | 'WORKLOG_REVIEW'
  | 'MATERIAL_READ'
  | 'MATERIAL_MANAGE'
  | 'MATERIAL_REQUEST'
  | 'CONTRACT_READ'
  | 'CONTRACT_MANAGE'
  | 'BIDDING_READ'
  | 'BIDDING_MANAGE'
  | 'PARTNER_READ'
  | 'PARTNER_MANAGE'
  | 'TECHNICAL_STANDARD_READ'
  | 'TECHNICAL_STANDARD_MANAGE'
  | 'USER_MANAGE'
  | 'ROLE_REQUEST_REVIEW'
  | 'SETTINGS_VIEW';

export interface RolePermissionDefinition {
  label: string;
  description: string;
  permissions: readonly Permission[];
}

const ALL_PERMISSIONS: readonly Permission[] = [
  'DASHBOARD_VIEW', 'PROJECT_READ', 'PROJECT_MANAGE', 'PROJECT_MEMBER_MANAGE',
  'ATTENDANCE_USE', 'ATTENDANCE_MANAGE', 'WORKLOG_READ', 'WORKLOG_CREATE',
  'WORKLOG_REVIEW', 'MATERIAL_READ', 'MATERIAL_MANAGE', 'MATERIAL_REQUEST',
  'CONTRACT_READ', 'CONTRACT_MANAGE', 'BIDDING_READ', 'BIDDING_MANAGE',
  'PARTNER_READ', 'PARTNER_MANAGE', 'TECHNICAL_STANDARD_READ',
  'TECHNICAL_STANDARD_MANAGE', 'USER_MANAGE', 'ROLE_REQUEST_REVIEW', 'SETTINGS_VIEW',
];

export const ROLE_PERMISSION_MATRIX: Record<UserRole, RolePermissionDefinition> = {
  ADMIN: {
    label: 'Quản trị viên',
    description: 'Toàn quyền vận hành và quản trị hệ thống. Tài khoản admin hệ thống là tài khoản bảo vệ.',
    permissions: ALL_PERMISSIONS,
  },
  PM: {
    label: 'Quản lý dự án',
    description: 'Quản lý dự án, hợp đồng, đấu thầu, vật tư và phê duyệt nghiệp vụ; không quản trị tài khoản hệ thống.',
    permissions: [
      'DASHBOARD_VIEW', 'PROJECT_READ', 'PROJECT_MANAGE', 'PROJECT_MEMBER_MANAGE',
      'ATTENDANCE_USE', 'WORKLOG_READ', 'WORKLOG_CREATE', 'WORKLOG_REVIEW',
      'MATERIAL_READ', 'MATERIAL_MANAGE', 'MATERIAL_REQUEST', 'CONTRACT_READ',
      'CONTRACT_MANAGE', 'BIDDING_READ', 'BIDDING_MANAGE', 'PARTNER_READ',
      'PARTNER_MANAGE', 'TECHNICAL_STANDARD_READ', 'TECHNICAL_STANDARD_MANAGE',
      'SETTINGS_VIEW',
    ],
  },
  STAFF: {
    label: 'Nhân viên',
    description: 'Làm việc trong các dự án được phân công, chấm công, lập nhật ký và gửi yêu cầu vật tư.',
    permissions: [
      'DASHBOARD_VIEW', 'PROJECT_READ', 'ATTENDANCE_USE', 'WORKLOG_READ',
      'WORKLOG_CREATE', 'MATERIAL_READ', 'MATERIAL_REQUEST', 'TECHNICAL_STANDARD_READ',
      'SETTINGS_VIEW',
    ],
  },
  PARTNER: {
    label: 'Đối tác',
    description: 'Xem gói thầu đang công khai và nộp hồ sơ bằng đúng hồ sơ đối tác đã liên kết; không xem dữ liệu đánh giá nội bộ.',
    permissions: [
      'DASHBOARD_VIEW', 'PROJECT_READ', 'MATERIAL_READ', 'BIDDING_READ',
      'TECHNICAL_STANDARD_READ', 'SETTINGS_VIEW',
    ],
  },
  GUEST: {
    label: 'Khách',
    description: 'Chờ quản trị viên phê duyệt, chưa được truy cập không gian làm việc.',
    permissions: ['DASHBOARD_VIEW', 'SETTINGS_VIEW'],
  },
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  DASHBOARD_VIEW: 'Xem trang tổng quan',
  PROJECT_READ: 'Xem dự án được phép truy cập',
  PROJECT_MANAGE: 'Tạo, sửa, xóa và cấu hình dự án',
  PROJECT_MEMBER_MANAGE: 'Phân công nhân sự trong dự án',
  ATTENDANCE_USE: 'Chấm công và xem dữ liệu cá nhân',
  ATTENDANCE_MANAGE: 'Quản lý, xuất và kiểm tra chấm công',
  WORKLOG_READ: 'Xem nhật ký công trường',
  WORKLOG_CREATE: 'Tạo nhật ký công trường',
  WORKLOG_REVIEW: 'Kiểm tra, duyệt hoặc từ chối nhật ký',
  MATERIAL_READ: 'Xem danh mục vật tư',
  MATERIAL_MANAGE: 'Quản lý danh mục và định mức vật tư',
  MATERIAL_REQUEST: 'Tạo và theo dõi yêu cầu vật tư',
  CONTRACT_READ: 'Xem hợp đồng và tải tài liệu được cấp quyền',
  CONTRACT_MANAGE: 'Tạo, sửa, xóa và chuyển bước hợp đồng',
  BIDDING_READ: 'Xem gói thầu và kết quả được cấp quyền',
  BIDDING_MANAGE: 'Tạo gói thầu, đánh giá và chọn nhà thầu',
  PARTNER_READ: 'Xem thông tin đối tác',
  PARTNER_MANAGE: 'Tạo, sửa và quản lý đối tác',
  TECHNICAL_STANDARD_READ: 'Tra cứu tiêu chuẩn kỹ thuật',
  TECHNICAL_STANDARD_MANAGE: 'Quản lý và cập nhật tiêu chuẩn kỹ thuật',
  USER_MANAGE: 'Quản lý tài khoản và vai trò',
  ROLE_REQUEST_REVIEW: 'Phê duyệt yêu cầu cấp quyền',
  SETTINGS_VIEW: 'Xem cài đặt cá nhân',
};

export function hasPermission(user: User | null | undefined, permission: Permission): boolean {
  // The API may serialize enum values as either ACTIVE or active depending on
  // the configured Jackson naming strategy. Authorization must not depend on
  // that presentation detail.
  if (!user || user.deleted || String(user.status).toUpperCase() !== 'ACTIVE') return false;

  return user.roles?.some((role) => {
    const normalizedRole = String(role).toUpperCase() as UserRole;
    return ROLE_PERMISSION_MATRIX[normalizedRole]?.permissions.includes(permission) ?? false;
  }) ?? false;
}

export function getRoleDefinition(role: UserRole | undefined): RolePermissionDefinition | null {
  return role ? ROLE_PERMISSION_MATRIX[role] ?? null : null;
}
