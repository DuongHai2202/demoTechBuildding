import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { BiddingPackage, BidSubmission } from '../types/bidding.types';

const BIDDING_KEYS = {
  all: ['bidding'] as const,
  projectPackages: (projectId: number) => [...BIDDING_KEYS.all, 'project', projectId, 'packages'] as const,
  packageDetail: (id: number) => [...BIDDING_KEYS.all, 'package', id] as const,
  submissions: (packageId: number) => [...BIDDING_KEYS.packageDetail(packageId), 'submissions'] as const,
};

export function useBiddingPackages(projectId: number) {
  return useQuery({
    queryKey: BIDDING_KEYS.projectPackages(projectId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BiddingPackage[]>>(`/projects/${projectId}/bidding-packages`);
      return data.data;
    },
    enabled: projectId > 0,
  });
}

export function useAllBiddingPackages() {
  return useQuery({
    queryKey: [...BIDDING_KEYS.all, 'list'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BiddingPackage[]>>('/bidding-packages');
      return data.data;
    },
  });
}

export function useBiddingPackage(id: number) {
  return useQuery({
    queryKey: BIDDING_KEYS.packageDetail(id),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BiddingPackage>>(`/bidding-packages/${id}`);
      return data.data;
    },
    enabled: id > 0,
  });
}

export function useCreateBiddingPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BiddingPackage>) => {
      const { data } = await api.post<ApiResponse<BiddingPackage>>('/bidding-packages', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BIDDING_KEYS.projectPackages(data.projectId) });
      queryClient.invalidateQueries({ queryKey: [...BIDDING_KEYS.all, 'list'] });
    },
  });
}

export function useUpdateBiddingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const { data } = await api.patch<ApiResponse<BiddingPackage>>(`/bidding-packages/${id}/status`, null, {
        params: { status }
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BIDDING_KEYS.packageDetail(data.id) });
      queryClient.invalidateQueries({ queryKey: BIDDING_KEYS.projectPackages(data.projectId) });
      queryClient.invalidateQueries({ queryKey: [...BIDDING_KEYS.all, 'list'] });
    },
  });
}

export function useBidSubmissions(packageId: number) {
  return useQuery({
    queryKey: BIDDING_KEYS.submissions(packageId),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<BidSubmission[]>>(`/bidding-packages/${packageId}/submissions`);
      return data.data;
    },
    enabled: packageId > 0,
  });
}

export function useSubmitBid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<BidSubmission>) => {
      const { data } = await api.post<ApiResponse<BidSubmission>>('/bid-submissions', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BIDDING_KEYS.submissions(data.packageId) });
    },
  });
}

export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const { data } = await api.patch<ApiResponse<BidSubmission>>(`/bid-submissions/${id}/status`, null, {
        params: { status, notes }
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BIDDING_KEYS.submissions(data.packageId) });
    },
  });
}
