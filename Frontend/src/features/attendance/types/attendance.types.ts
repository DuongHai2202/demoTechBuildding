export type AttendanceStatus = 'CHECKED_IN' | 'COMPLETED' | 'FAILED' | 'MISSING_CHECKOUT' | 'PENDING_REVIEW' | 'IN_PROJECT' | 'OUTSIDE' | 'ABSENT';
export type OvertimeStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;

export interface Attendance {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  projectId: number;
  projectName: string;
  shiftAssignmentId?: number | null;
  shiftCode?: string | null;
  shiftName?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  breakMinutes?: number | null;
  lateMinutes?: number | null;
  earlyLeaveMinutes?: number | null;
  overtimeMinutes?: number | null;
  overtimeStatus?: OvertimeStatus | null;
  overtimeApprovedMinutes?: number | null;
  overtimeReviewedBy?: string | null;
  overtimeReviewedAt?: string | null;
  overtimeReviewNote?: string | null;
  checkInAt: string;
  gpsLatIn: number;
  gpsLongIn: number;
  selfieUrlIn: string | null;
  checkOutAt: string | null;
  gpsLatOut: number | null;
  gpsLongOut: number | null;
  selfieUrlOut: string | null;
  distanceInMeters: number | null;
  distanceOutMeters: number | null;
  gpsAccuracyIn: number | null;
  gpsAccuracyOut: number | null;
  status: string;
  workingMinutes: number | null;
  workingHours: number | null;
  durationText: string | null;
  remarks: string | null;
}

export interface CheckInRequest {
  projectId: number;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface CheckOutRequest {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface OvertimeReviewRequest {
  status: 'APPROVED' | 'REJECTED';
  approvedMinutes: number;
  note?: string;
}
