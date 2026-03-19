export type MasterPlanStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';

export interface MasterPlanItem {
  id: number;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  progress: number;
  status: MasterPlanStatus;
  parentId: number | null;
  displayOrder: number;
  children: MasterPlanItem[];
}

export interface CreateMasterPlanRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  parentId?: number;
  displayOrder?: number;
}
