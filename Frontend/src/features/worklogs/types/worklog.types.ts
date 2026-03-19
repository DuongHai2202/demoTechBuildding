export interface MediaAttachment {
  id: number;
  fileUrl: string;
  fileType: string;
}

export interface WorkLog {
  id: number;
  projectId: number;
  userId: number;
  username: string;
  logDate: string;
  weatherCondition: string;
  workerCount: number;
  content: string;
  status: string;
  mediaUrls: string[]; 
  checkedByName?: string;
  approvedByName?: string;
  checkedAt?: string;
  approvedAt?: string;
  notes?: string;
}

export interface CreateWorkLogRequest {
  projectId: number;
  userId: number;
  content: string;
  weatherCondition: string;
  workerCount: number;
  files: File[];
}
