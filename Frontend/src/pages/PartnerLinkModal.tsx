import { useState } from 'react';
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  UserPlusIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useUsers, useUpdateUser } from '../features/users/api/userApi';
import type { Partner } from '../features/partners/types/partner.types';
import type { User } from '../features/users/types/user.types';

interface PartnerLinkModalProps {
  partner: Partner | null;
  onClose: () => void;
}

export default function PartnerLinkModal({ partner, onClose }: PartnerLinkModalProps) {
  const { data: users, isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const [search, setSearch] = useState('');

  if (!partner) return null;

  const partnerUsers = (users || []).filter(u => u.partnerId === partner.id);
  const unlinkedUsers = (users || []).filter(u => 
    !u.partnerId && 
    u.roles.includes('PARTNER') &&
    (u.fullName?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleLink = (userId: number) => {
    updateUser.mutate({ 
      id: userId, 
      payload: { partnerId: partner.id } 
    });
  };

  const handleUnlink = (userId: number) => {
    updateUser.mutate({ 
      id: userId, 
      payload: { partnerId: undefined } 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[var(--color-primary)] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <UserPlusIcon className="size-6" />
            <div>
              <h2 className="text-lg font-bold">Gán tài khoản Portal</h2>
              <p className="text-xs opacity-80">Đối tác: {partner.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <XMarkIcon className="size-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linked Users */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <CheckCircleIcon className="size-4 text-[var(--color-success)]" />
              Tài khoản đã gán
            </h3>
            <div className="bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)] p-2 min-h-[300px] max-h-[300px] overflow-y-auto space-y-2">
              {partnerUsers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] italic text-xs p-4 text-center">
                  Tiến hành gán tài khoản từ danh sách bên phải để cho phép đối tác truy cập portal.
                </div>
              ) : partnerUsers.map(user => (
                <div key={user.id} className="bg-[var(--color-surface)] p-3 rounded-lg border border-[var(--color-border)] flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{user.fullName || user.username}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">@{user.username}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUnlink(user.id)}
                    className="text-red-500 hover:text-red-700 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Gỡ
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Users */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <UserIcon className="size-4 text-[var(--color-primary)]" />
              Tài khoản khả dụng
            </h3>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="Tìm user hoặc mã nhân viên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-border)] p-2 min-h-[250px] max-h-[250px] overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-xs text-[var(--color-text-muted)] italic">Đang tải...</div>
              ) : unlinkedUsers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-muted)] italic text-xs p-4 text-center">
                  Không tìm thấy tài khoản "PARTNER" chưa gán.
                </div>
              ) : unlinkedUsers.map(user => (
                <div key={user.id} className="bg-[var(--color-surface)] p-2 rounded-lg border border-[var(--color-border)] flex items-center justify-between hover:border-[var(--color-primary)] transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-[10px]">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold">{user.fullName || user.username}</div>
                      <div className="text-[9px] text-[var(--color-text-muted)]">@{user.username}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleLink(user.id)}
                    className="size-7 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all"
                  >
                    <UserPlusIcon className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-text-muted)] italic leading-tight">
              * Chỉ các tài khoản có role <span className="font-bold text-indigo-600">PARTNER</span> mới xuất hiện trong danh sách này.
            </p>
          </div>
        </div>

        <div className="bg-[var(--color-surface-alt)] px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="btn-primary px-8"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
}
