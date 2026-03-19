export interface Contract {
  id: number;
  projectId: number;
  projectName: string;
  contractNumber: string;
  contractName: string;
  partnerName: string;
  partnerId?: number;
  contractValue: number;
  workflowStep: number; // 1-7
  guaranteeInfo?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING';
  fileUrl?: string;
  type?: 'MAIN' | 'ADDENDUM';
  parentId?: number;
  signedDate?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateContractRequest {
  projectId: number;
  contractNumber: string;
  contractName: string;
  partnerName: string;
  partnerId?: number;
  contractValue: number;
  workflowStep?: number;
  guaranteeInfo?: string;
  status: string;
  type?: 'MAIN' | 'ADDENDUM';
  parentId?: number;
  signedDate?: string;
  startDate?: string;
  endDate?: string;
}

export interface BoqItem {
  id: number;
  contractId: number;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vatRate: number;
  vatAmount: number;
  totalWithVat: number;
  parentId?: number;
  parentCode?: string;
  bimId?: string;
}

export interface BoqItemRequest {
  contractId: number;
  itemCode: string;
  description: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
  vatRate?: number;
  parentId?: number;
  bimId?: string;
}

export interface ContractMaterialLimit {
  id: number;
  contractId: number;
  materialId: number;
  materialName: string;
  materialUnit: string;
  limitQuantity: number;
  type: 'OWNER_SUPPLIED' | 'CONTRACTOR_SUPPLIED';
  notes?: string;
}

export interface ContractMaterialLimitRequest {
  contractId: number;
  materialId: number;
  limitQuantity: number;
  type?: 'OWNER_SUPPLIED' | 'CONTRACTOR_SUPPLIED';
  notes?: string;
}

export interface Drawing {
  id: number;
  projectId: number;
  contractId?: number;
  name: string;
  drawingNumber: string;
  fileUrl: string;
  version: string;
}

export interface ContractAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: number;
  uploaderName?: string;
  createdAt: string;
}
