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
  overtimeEligible?: boolean | null;
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
  correctionReason?: string | null;
  correctedBy?: string | null;
  correctedAt?: string | null;
  /** Server/demo time used when calculating a live open record. */
  effectiveTime?: string | null;
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

export interface AttendanceCorrectionRequest {
  status: 'COMPLETED' | 'ABSENT';
  checkInAt?: string;
  checkOutAt?: string;
  reason: string;
}

export interface AttendanceDemoClock {
  featureEnabled: boolean;
  enabled: boolean;
  actualTime: string;
  effectiveTime: string;
  demoTime: string | null;
  updatedAt: string | null;
  expiresAt: string | null;
  updatedBy: string | null;
  message: string;
}

export interface AttendanceDemoClockRequest {
  demoTime: string;
  enabled: boolean;
}

export interface AttendanceEffectiveClock {
  effectiveTime: string;
  businessDate: string;
}
