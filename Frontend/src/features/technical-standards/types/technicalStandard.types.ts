export interface TechnicalStandard {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  fileUrl: string;
  version: string;
  projectId: number | null;
  projectName: string;
  createdBy: string;
  createdAt: string;
}

export interface TechnicalStandardRequest {
  code: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  projectId?: number | null;
}
