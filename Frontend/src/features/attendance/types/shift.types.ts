export interface ShiftTemplate {
  id: number;
  projectId: number | null;
  projectName: string | null;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
  breakMinutes: number;
  earlyCheckInMinutes: number;
  lateCheckInMinutes: number;
  overtimeEligible: boolean;
  status: string;
}

export interface ShiftAssignment {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  username: string;
  fullName: string;
  shiftTemplateId: number;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
  breakMinutes: number;
  earlyCheckInMinutes: number;
  lateCheckInMinutes: number;
  overtimeEligible: boolean;
  workDate: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  status: 'ASSIGNED' | 'CANCELLED' | string;
  notes: string | null;
  current: boolean;
  eligibleForCheckIn: boolean;
  windowMessage: string;
}

export interface ShiftTemplateRequest {
  projectId?: number;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  crossesMidnight: boolean;
  breakMinutes: number;
  earlyCheckInMinutes: number;
  lateCheckInMinutes: number;
  overtimeEligible: boolean;
}

export interface ShiftAssignmentRequest {
  projectId: number;
  userId: number;
  shiftTemplateId: number;
  workDate: string;
  notes?: string;
}
