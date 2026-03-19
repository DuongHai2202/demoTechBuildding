import { useState, useMemo } from 'react';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../features/users/api/userApi';
import type { User, UserRequest, UserStatus, UserRole } from '../features/users/types/user.types';

const STATUS_STYLE: Record<UserStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Hoạt động', cls: 'bg-[var(--color-success-bg)] text-[var(--color-success)]' },
  PENDING: { label: 'Chờ xác thực', cls: 'bg-amber-500/10 text-amber-600' },
  INACTIVE: { label: 'Ngưng', cls: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]' },
};

const emptyForm: UserRequest = {
  username: '',
  password: '',
  fullName: '',
  phone: '',
  email: '',
  roles: ['GUEST'],
  status: 'PENDING'
};

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'PM', 'STAFF', 'PARTNER', 'GUEST'];

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserRequest>(emptyForm);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchSearch =
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || u.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [users, search, filterStatus]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: '',
      fullName: user.fullName || '',
      phone: user.phone || '',
      email: user.email || '',
      roles: user.roles || [],
      status: user.status
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.username.trim()) return;
    if (editingUser) {
      const payload: Partial<UserRequest> = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email,
        roles: form.roles,
        status: form.status
      };
      if (form.password) payload.password = form.password;

      updateUser.mutate({ id: editingUser.id, payload }, {
        onSuccess: () => { setShowForm(false); setEditingUser(null); },
      });
    } else {
      if (!form.password.trim()) return;
      createUser.mutate(form, {
        onSuccess: () => { setShowForm(false); setForm(emptyForm); },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      deleteUser.mutate(id);
    }
  };

  const stats = useMemo(() => ({
    total: users?.length || 0,
    active: users?.filter(u => u.status === 'ACTIVE').length || 0,
    pending: users?.filter(u => u.status === 'PENDING').length || 0,
  }), [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Quản lý Nhân sự</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Quản lý thông tin nhân viên, phân quyền và vai trò</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Thêm nhân sự
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Tổng nhân sự</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.active}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Đang hoạt động</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <EnvelopeIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.pending}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Chờ xác thực</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, username, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as UserStatus | '')}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm outline-none"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="PENDING">Chờ xác thực</option>
          <option value="INACTIVE">Ngưng</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-[var(--color-bg)] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <UsersIcon className="h-12 w-12 text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {search ? 'Không tìm thấy nhân sự phù hợp.' : 'Chưa có nhân sự nào.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">STT</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Nhân sự</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Username</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Liên hệ</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Vai trò</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Trạng thái</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => {
                const statusInfo = STATUS_STYLE[user.status] || STATUS_STYLE.PENDING;
                return (
                  <tr key={user.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
                          {(user.fullName || user.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[var(--color-text-primary)]">{user.fullName || user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">@{user.username}</td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {user.email && (
                          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <EnvelopeIcon className="h-3 w-3" /> {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                            <PhoneIcon className="h-3 w-3" /> {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <span key={role} className="inline-flex items-center rounded-full bg-[var(--color-info-bg)] px-2 py-0.5 text-[10px] font-bold text-[var(--color-info)]">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-[var(--color-text-muted)]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded-md text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors" title="Chỉnh sửa">
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors" title="Xóa">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-surface)] w-full max-w-md rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 flex items-center justify-between border-b border-[var(--color-border)]">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {editingUser ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingUser(null); }} className="p-2 hover:bg-[var(--color-bg)] rounded-full transition-colors">
                <XMarkIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Username *</label>
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  disabled={!!editingUser}
                  placeholder="username"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
                  {editingUser ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Họ tên</label>
                <input
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Email</label>
                  <input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Số điện thoại</label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0901234567"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Vai trò</label>
                <div className="flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map(role => {
                    const isSelected = form.roles?.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          const current = form.roles || [];
                          const next = isSelected
                            ? current.filter(r => r !== role)
                            : [...current, role];
                          setForm(f => ({ ...f, roles: next }));
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${isSelected
                            ? 'bg-[var(--color-primary)] text-white shadow-sm'
                            : 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
                          }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as UserStatus }))}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="PENDING">Chờ xác thực</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Ngưng hoạt động</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingUser(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createUser.isPending || updateUser.isPending}
                  className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {(createUser.isPending || updateUser.isPending) ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
