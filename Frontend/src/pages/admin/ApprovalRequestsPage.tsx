import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/axiosInstance';
import type { RoleRequest } from '../../features/users/types/user.types';
import type { ApiResponse } from '../../types/api.types';
import { CheckIcon, XMarkIcon, UserPlusIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '../../components/StatusBadge';

export default function ApprovalRequestsPage() {
  const queryClient = useQueryClient();

  // Fetch all requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['role-requests'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<RoleRequest[]>>('/role-requests');
      return data.data;
    },
  });

  // Mutation to approve/reject
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, adminNote }: { id: number; status: string; adminNote?: string }) => {
      await api.patch(`/role-requests/${id}`, null, {
        params: { status, adminNote }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-requests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleAction = (id: number, status: 'APPROVED' | 'REJECTED') => {
    const note = prompt(status === 'APPROVED' ? 'Ghi chú phê duyệt (tùy chọn):' : 'Lý do từ chối:');
    if (status === 'REJECTED' && note === null) return;
    updateStatusMutation.mutate({ id, status, adminNote: note || '' });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--color-text-muted)]">Đang tải yêu cầu...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Phê duyệt quyền truy cập</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Danh sách người dùng GUEST đang chờ cấp quyền vào hệ thống</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
              <th className="px-6 py-4 text-left font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Người yêu cầu</th>
              <th className="px-6 py-4 text-left font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Vai trò xin cấp</th>
              <th className="px-6 py-4 text-left font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Lý do</th>
              <th className="px-6 py-4 text-left font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-right font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <UserPlusIcon className="h-10 w-10 text-[var(--color-text-muted)] opacity-20" />
                    <p className="text-[var(--color-text-muted)] font-medium">Không có yêu cầu nào đang chờ xử lý.</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-[var(--color-bg)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[var(--color-text-primary)]">{req.fullName}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">@{req.username}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-lg bg-[var(--color-primary-light)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)]">
                      {req.requestedRoleName}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex items-start gap-2">
                      <ChatBubbleLeftEllipsisIcon className="h-4 w-4 mt-0.5 text-[var(--color-text-muted)] shrink-0" />
                      <p className="italic text-[var(--color-text-secondary)] line-clamp-2">"{req.reason}"</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                    {req.adminNote && (
                      <div className="mt-1 text-[10px] text-[var(--color-text-muted)] italic">
                        Node: {req.adminNote}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          disabled={updateStatusMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                          title="Phê duyệt"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          disabled={updateStatusMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Từ chối"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--color-text-muted)]">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
