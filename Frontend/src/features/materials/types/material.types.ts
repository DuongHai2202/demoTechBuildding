export interface MaterialCategory {
  id: number;
  name: string;
  description?: string;
}


export interface Material {
  id: number;
  categoryId?: number;
  categoryName?: string;
  managementCode?: string;
  nameVi: string;
  nameEn?: string;
  nameZh?: string;
  unit: string;
  imageUrl?: string;
  catalogueUrl?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  descriptionZh?: string;
  revitFamilyCategory?: string;
  revitCode?: string;
  properties?: string; // JSON string
}

export interface MaterialNorm {
  id: number;
  boqItemId: number;
  materialId: number;
  materialName: string;
  materialUnit: string;
  quantityPerUnit: number;
}

export type MaterialRequestStatus = 'PENDING' | 'CHECKED' | 'APPROVED' | 'REJECTED';

export interface MaterialRequest {
  id: number;
  projectId: number;
  projectName: string;
  requesterId: number;
  requesterName: string;
  materialId: number;
  materialName: string;
  materialUnit: string;
  requestedQuantity: number;
  status: MaterialRequestStatus;
  checkedBy?: number;
  checkedByName?: string;
  approvedBy?: number;
  approvedByName?: string;
  checkedAt?: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateMaterialRequest {
  projectId: number;
  requesterId: number;
  materialId: number;
  requestedQuantity: number;
  notes?: string;
}

export interface MaterialNormRequest {
  boqItemId: number;
  materialId: number;
  quantityPerUnit: number;
}
