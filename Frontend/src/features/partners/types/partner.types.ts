export type PartnerType = 'CLIENT' | 'CONTRACTOR' | 'SUPPLIER' | 'OTHER';
export type PartnerStatus = 'ACTIVE' | 'INACTIVE';

export interface Partner {
  id: number;
  name: string;
  partnerCode: string;
  taxCode: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacityProfile?: string;
  unitPrices?: Record<string, any>;
  status: PartnerStatus;
  type: PartnerType;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerRequest {
  name: string;
  partnerCode: string;
  taxCode?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  capacityProfile?: string;
  unitPrices?: Record<string, any>;
  status?: PartnerStatus;
  type?: PartnerType;
}
