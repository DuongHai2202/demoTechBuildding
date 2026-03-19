export type BiddingStatus = 'DRAFT' | 'PUBLISHED' | 'INVITING' | 'EVALUATING' | 'CLOSED' | 'CANCELLED';

export interface BiddingPackage {
  id: number;
  projectId: number;
  packageCode: string;
  packageName: string;
  description?: string;
  budget?: number;
  status: BiddingStatus;
  deadline: string;
  criteria: string; // JSON string
  createdAt: string;
}

export interface BidSubmission {
  id: number;
  packageId: number;
  partnerId: number;
  partnerName: string;
  bidPrice: number;
  proposalFileUrl?: string;
  submissionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  notes?: string;
}
