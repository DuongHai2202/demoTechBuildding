import { useState } from 'react';
import { useProjectMembers, useAddProjectMember, useRemoveProjectMember, useUpdateProjectMember, useMyProjectPermission } from '../api/projectApi';
import { useUsers } from '../../users/api/userApi';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import type { ProjectMember } from '../types/project.types';
import { Button } from '../../../components/ui/Button';
import { UserPlusIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface MemberManagerProps {
  projectId: number;
}

export function MemberManager({ projectId }: MemberManagerProps) {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const addMemberMutation = useAddProjectMember(projectId);
  const removeMemberMutation = useRemoveProjectMember(projectId);
  const updateMemberMutation = useUpdateProjectMember(projectId);
  const permissions = useMyProjectPermission(projectId);

  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchResults, isLoading: isSearching } = useUsers(searchQuery);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newRole, setNewRole] = useState('WORKER');
  const [showDropdown, setShowDropdown] = useState(false);

  // States for inline editing
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [tempRole, setTempRole] = useState<string>('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    addMemberMutation.mutate({ 
      userId: selectedUserId, 
      assignedRole: newRole 
    }, {
      onSuccess: () => {
        setSearchQuery('');
        setSelectedUserId(null);
        setShowDropdown(false);
      }
    });
  };

  const handleRemoveMember = (userId: number, username: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhân sự "${username}" khỏi dự án này không?`)) {
      removeMemberMutation.mutate(userId);
    }
  };

  const handleUpdateRole = (userId: number) => {
    updateMemberMutation.mutate({ userId, role: tempRole }, {
      onSuccess: () => setEditingUserId(null)
    });
  };

  const columns: ColumnDef<ProjectMember>[] = [
    { key: 'username', header: 'Người dùng', className: 'font-medium' },
    { key: 'fullName', header: 'Họ tên' },
    { 
      key: 'assignedRole', 
      header: 'Vai trò',
      render: (m) => (
        editingUserId === m.userId ? (
          <select
            className="text-xs px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface)]"
            value={tempRole}
            onChange={(e) => setTempRole(e.target.value)}
            autoFocus
          >
            <option value="WORKER">WORKER</option>
            <option value="ENGINEER">ENGINEER</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="PM">PM</option>
          </select>
        ) : (
          <span className="font-medium text-xs px-2 py-1 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            {m.assignedRole}
          </span>
        )
      )
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (m) => (
        permissions.canManageMembers && (
          <div className="flex items-center justify-end gap-1">
            {editingUserId === m.userId ? (
              <>
                <button
                  onClick={() => handleUpdateRole(m.userId)}
                  disabled={updateMemberMutation.isPending}
                  className="p-1 px-2 text-xs font-medium bg-[var(--color-primary)] text-white rounded hover:opacity-90"
                >
                  Lưu
                </button>
                <button
                  onClick={() => setEditingUserId(null)}
                  className="p-1 px-2 text-xs font-medium bg-[var(--color-surface-alt)] text-[var(--color-text-primary)] rounded hover:opacity-90"
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditingUserId(m.userId);
                    setTempRole(m.assignedRole);
                  }}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  title="Sửa vai trò"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleRemoveMember(m.userId, m.fullName)}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
                  title="Xóa thành viên"
                >
                  <TrashIcon className="size-4" />
                </button>
              </>
            )}
          </div>
        )
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Add Member Form */}
      {permissions.canManageMembers && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/30 p-4">
          <form onSubmit={handleAddMember} className="flex flex-wrap items-end gap-4">
            <div className="relative flex-1 min-w-[300px]">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 block">Tìm nhân sự</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                  <MagnifyingGlassIcon className="size-4" />
                </span>
                <input
                  type="text"
                  placeholder="Nhập tên hoặc username..."
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                />
              </div>
              
              {showDropdown && searchQuery && (
                <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  {isSearching ? (
                    <div className="p-3 text-center text-sm text-[var(--color-text-muted)]">Đang tìm...</div>
                  ) : searchResults?.length ? (
                    searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--color-surface-alt)] transition-colors flex items-center justify-between ${
                          selectedUserId === user.id ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'
                        }`}
                        onClick={() => {
                          setSearchQuery(user.fullName);
                          setSelectedUserId(user.id);
                          setShowDropdown(false);
                        }}
                      >
                        <span>{user.fullName} (@{user.username})</span>
                        <span className="text-xs text-[var(--color-text-muted)] italic">#{user.id}</span>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-[var(--color-text-muted)]">Không tìm thấy nhân sự phù hợp</div>
                  )}
                </div>
              )}
            </div>
            
            <div className="w-[150px]">
               <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 block">Vai trò</label>
               <select 
                 className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                 value={newRole}
                 onChange={(e) => setNewRole(e.target.value)}
               >
                 <option value="WORKER">Công nhân (WORKER)</option>
                 <option value="ENGINEER">Kỹ sư (ENGINEER)</option>
                 <option value="SUPERVISOR">Giám sát (SUPERVISOR)</option>
                 <option value="PM">Quản lý dự án (PM)</option>
               </select>
            </div>
            <Button 
              type="submit" 
              isLoading={addMemberMutation.isPending}
              disabled={!selectedUserId}
              className="h-[42px]"
            >
              <UserPlusIcon className="size-4 mr-2" />
              Thêm vào dự án
            </Button>
          </form>
        </div>
      )}

      <DataTable<ProjectMember>
        items={members ?? []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="Chưa có thành viên nào tham gia dự án."
      />
    </div>
  );
}
