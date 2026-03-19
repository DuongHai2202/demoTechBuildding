import type { ApiResponse } from '../../../types/api.types';

export type DesignDiscipline = 'ARCH' | 'STRUC' | 'MEP' | 'LANDSCAPE' | 'INTERIOR';
export type DesignStatus = 'PRELIMINARY' | 'FOR_REVIEW' | 'IFC' | 'AS_BUILT';

export interface DesignSheet {
  id: number;
  projectId: number;
  zoneId: number | null;
  zoneName: string | null;
  sheetNumber: string;
  title: string;
  discipline: DesignDiscipline;
  revision: string;
  status: DesignStatus;
  fileUrl: string;
  thumbnailUrl?: string;
  issuedAt: string;
  issuedBy: number | null;
  issuerName: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RfiStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';

export interface Rfi {
  id: number;
  projectId: number;
  title: string;
  question: string;
  suggestedSolution?: string;
  status: RfiStatus;
  assignedTo: number | null;
  assigneeName: string | null;
  createdBy: string | null;
  creatorName: string | null;
  createdAt: string;
  resolvedAt?: string;
  designSheetId: number | null;
  sheetNumber: string | null;
  coordX: number | null;
  coordY: number | null;
}

export interface RfiComment {
  id: number;
  rfiId: number;
  content: string;
  userId: number;
  userName: string;
  userAvatar: string | null;
  createdAt: string;
}
