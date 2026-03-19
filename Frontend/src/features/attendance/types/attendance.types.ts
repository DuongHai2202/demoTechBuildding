export type AttendanceStatus = 'IN_PROJECT' | 'OUTSIDE' | 'COMPLETED' | 'ABSENT';

export interface Attendance {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  projectId: number;
  projectName: string;
  checkInAt: string;
  gpsLatIn: number;
  gpsLongIn: number;
  selfieUrlIn: string | null;
  checkOutAt: string | null;
  gpsLatOut: number | null;
  gpsLongOut: number | null;
  selfieUrlOut: string | null;
  distanceInMeters: number | null;
  status: string;
  workingHours: number | null;
  remarks: string | null;
}

export interface CheckInRequest {
  projectId: number;
  latitude: number;
  longitude: number;
}

export interface CheckOutRequest {
  latitude: number;
  longitude: number;
}
