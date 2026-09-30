import { useEffect, useState, useMemo } from 'react';
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
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useRestoreUser, useHardDeleteUser } from '../features/users/api/userApi';
import type { User, UserRequest, UserStatus, UserRole } from '../features/users/types/user.types';
import { toast } from 'sonner';
import { useActionDialog } from '../components/ui/ActionDialog';
import { Pagination } from '../components/ui/Pagination';
import { PERMISSION_LABELS, ROLE_PERMISSION_MATRIX } from '../features/auth/authorization';

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
  status: 'ACTIVE'
};

const ROLE_OPTIONS: UserRole[] = ['ADMIN', 'PM', 'STAFF', 'PARTNER', 'GUEST'];
const PAGE_SIZE = 10;

function normalizeUserStatus(status: UserStatus | string | undefined): UserStatus {
  const normalized = String(status ?? '').toUpperCase();
  return normalized in STATUS_STYLE ? normalized as UserStatus : 'PENDING';
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const message = (error as { response?: { data?: { message?: unknown } } })
    .response?.data?.message;
  return typeof message === 'string' ? message : fallback;
}

function isProtectedAdmin(user: User) {
  return user.username?.trim().toLowerCase() === 'admin';
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/.test(value.replace(/\s+/g, ''));
}

export default function UsersPage() {
  const { confirm, prompt } = useActionDialog();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();
  const hardDeleteUser = useHardDeleteUser();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserRequest>(emptyForm);

  const filtered = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const matchSearch =
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || normalizeUserStatus(u.status) === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [users, search, filterStatus]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (user: User) => {
    if (isProtectedAdmin(user)) {
      toast.info('Tài khoản admin hệ thống được bảo vệ và không thể chỉnh sửa.');
      return;
    }
    if (user.deleted) {
      toast.info('Tài khoản đã xóa mềm. Hãy khôi phục trước khi chỉnh sửa.');
      return;
    }
    setEditingUser(user);
    setForm({
      username: user.username,
      password: '',
      fullName: user.fullName || '',
      phone: user.phone || '',
      email: user.email || '',
      roles: [user.roles?.[0] || 'GUEST'],
      status: normalizeUserStatus(user.status)
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    const username = form.username.trim();
    const fullName = form.fullName?.trim() || '';
    const email = form.email?.trim() || '';
    const phone = form.phone?.trim() || '';
    if (!/^[a-zA-Z0-9._-]{3,50}$/.test(username)) {
      toast.error('Username phải dài 3–50 ký tự và chỉ gồm chữ cái, số, dấu chấm, gạch ngang hoặc gạch dưới.');
      return;
    }
    if (fullName.length < 2) {
      toast.error('Họ tên phải có ít nhất 2 ký tự.');
      return;
    }
    if (email && !isValidEmail(email)) {
      toast.error('Email không đúng định dạng.');
      return;
    }
    if (phone && !isValidPhone(phone)) {
      toast.error('Số điện thoại phải có 10 số hợp lệ, ví dụ 0901234567.');
      return;
    }
    if (!form.roles || form.roles.length !== 1) {
      toast.error('Mỗi tài khoản chỉ được chọn đúng một vai trò.');
      return;
    }
    if (!editingUser && form.password.trim().length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (editingUser && form.password.trim() && form.password.trim().length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (!editingUser && username.toLowerCase() === 'admin') {
      toast.error('Tên đăng nhập admin được dành riêng cho tài khoản hệ thống.');
      return;
    }
    if (editingUser) {
      const payload: Partial<UserRequest> = {
        username,
        fullName,
        phone: phone || undefined,
        email: email || undefined,
        roles: [form.roles[0]],
        status: form.status
      };
      if (form.password && form.password.trim()) {
        payload.password = form.password.trim();
      }

      updateUser.mutate({ id: editingUser.id, payload }, {
        onSuccess: () => {
          setShowForm(false);
          setEditingUser(null);
          toast.success('Cập nhật thông tin nhân sự thành công!');
        },
        onError: (err: unknown) => {
          toast.error(getApiErrorMessage(err, 'Cập nhật nhân sự thất bại!'));
        }
      });
    } else {
      if (!form.password.trim()) {
        toast.error('Vui lòng nhập mật khẩu cho nhân sự mới!');
        return;
      }
      createUser.mutate({
        ...form,
        username,
        fullName,
        phone: phone || undefined,
        email: email || undefined,
        roles: [form.roles[0]],
      }, {
        onSuccess: () => {
          setShowForm(false);
          setForm(emptyForm);
          toast.success('Thêm nhân sự mới thành công!');
        },
        onError: (err: unknown) => {
          toast.error(getApiErrorMessage(err, 'Thêm nhân sự thất bại!'));
        }
      });
    }
  };

  const handleDelete = async (user: User) => {
    if (isProtectedAdmin(user)) {
      toast.info('Tài khoản admin hệ thống được bảo vệ và không thể xóa.');
      return;
    }
    if (user.deleted) {
      toast.info('Tài khoản này đã được xóa mềm.');
      return;
    }
    if (await confirm({
      title: 'Xóa mềm tài khoản',
      description: `Tài khoản "${user.username}" sẽ bị vô hiệu hóa và chuyển vào trạng thái đã xóa mềm. Bạn có chắc muốn tiếp tục?`,
      confirmLabel: 'Xóa mềm',
      variant: 'danger',
    })) {
      deleteUser.mutate(user.id, {
        onSuccess: () => toast.success('Xóa nhân sự thành công!'),
        onError: (err: unknown) => toast.error(getApiErrorMessage(err, 'Xóa nhân sự thất bại!'))
      });
    }
  };

  const handleRestore = async (user: User) => {
    if (isProtectedAdmin(user)) return;
    if (!(await confirm({
      title: 'Khôi phục tài khoản',
      description: `Tài khoản "${user.username}" sẽ được kích hoạt lại. Bạn có chắc muốn tiếp tục?`,
      confirmLabel: 'Khôi phục',
      variant: 'success',
    }))) return;
    restoreUser.mutate(user.id, {
      onSuccess: () => toast.success('Khôi phục tài khoản thành công!'),
      onError: (err: unknown) => toast.error(getApiErrorMessage(err, 'Khôi phục tài khoản thất bại!'))
    });
  };

  const handleHardDelete = async (user: User) => {
    if (isProtectedAdmin(user)) {
      toast.info('Tài khoản admin hệ thống được bảo vệ và không thể xóa vĩnh viễn.');
      return;
    }
    const confirmation = await prompt({
      title: 'Xóa vĩnh viễn tài khoản',
      description: `Thao tác này không thể hoàn tác và sẽ xóa dữ liệu liên quan đến "${user.username}". Nhập đúng username để xác nhận.`,
      inputLabel: 'Username xác nhận',
      placeholder: user.username,
      required: true,
      confirmLabel: 'Xóa vĩnh viễn',
      variant: 'danger',
      validate: (value) => value === user.username ? undefined : `Nhập chính xác "${user.username}" để tiếp tục.`,
    });
    if (confirmation !== user.username) {
      if (confirmation !== null) toast.info('Username xác nhận không khớp.');
      return;
    }
    hardDeleteUser.mutate(user.id, {
      onSuccess: () => toast.success('Đã xóa vĩnh viễn tài khoản và dữ liệu liên quan.'),
      onError: (err: unknown) => toast.error(getApiErrorMessage(err, 'Xóa vĩnh viễn thất bại!'))
    });
  };

  const stats = useMemo(() => ({
    total: users?.length || 0,
    active: users?.filter(u => normalizeUserStatus(u.status) === 'ACTIVE').length || 0,
    pending: users?.filter(u => normalizeUserStatus(u.status) === 'PENDING').length || 0,
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

      {/* The permission contract is visible to administrators so an account's
          access is explicit instead of being inferred from button colors. */}
      <section className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          type="button"
          onClick={() => setShowPermissionMatrix((visible) => !visible)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--color-surface-alt)] transition-colors"
          aria-expanded={showPermissionMatrix}
        >
          <div>
            <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Ma trận quyền theo vai trò</h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Mỗi tài khoản chọn một vai trò; API và giao diện dùng cùng một quy tắc quyền.
            </p>
          </div>
          <ChevronDownIcon className={`size-5 shrink-0 text-[var(--color-text-muted)] transition-transform ${showPermissionMatrix ? 'rotate-180' : ''}`} />
        </button>
        {showPermissionMatrix && (
          <div className="grid gap-3 border-t border-[var(--color-border)] p-4 lg:grid-cols-2">
            {(Object.entries(ROLE_PERMISSION_MATRIX) as [UserRole, (typeof ROLE_PERMISSION_MATRIX)[UserRole]][]).map(([role, definition]) => (
              <div key={role} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)]/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[var(--color-primary-light)] px-2.5 py-1 text-xs font-bold text-[var(--color-primary)]">{role}</span>
                  <span className="text-xs font-medium text-[var(--color-text-muted)]">{definition.permissions.length} nhóm quyền</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--color-text-primary)]">{definition.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{definition.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {definition.permissions.map((permission) => (
                    <span key={permission} className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-[11px] text-[var(--color-text-secondary)]" title={permission}>
                      {PERMISSION_LABELS[permission]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
              {paginatedUsers.map((user, idx) => {
                const statusInfo = STATUS_STYLE[normalizeUserStatus(user.status)];
                const protectedAdmin = isProtectedAdmin(user);
                const softDeleted = Boolean(user.deleted);
                return (
                  <tr key={user.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-sm font-bold text-[var(--color-primary)]">
                          {(user.fullName || user.username).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-[var(--color-text-primary)]">{user.fullName || user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-text-secondary)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span>@{user.username}</span>
                        {protectedAdmin && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-sans text-[10px] font-semibold text-emerald-600" title="Tài khoản này được hệ thống bảo vệ">
                            <ShieldCheckIcon className="h-3 w-3" />
                            Tài khoản hệ thống
                          </span>
                        )}
                      </div>
                    </td>
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
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${softDeleted ? 'bg-red-500/10 text-red-600' : statusInfo.cls}`}>
                        {softDeleted ? 'Đã xóa mềm' : statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-[var(--color-text-muted)]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {protectedAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-600" title="Không thể chỉnh sửa hoặc xóa tài khoản hệ thống">
                            <ShieldCheckIcon className="h-4 w-4" />
                            Được bảo vệ
                          </span>
                        ) : softDeleted ? (
                          <>
                            <button type="button" onClick={() => handleRestore(user)} className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors" title="Khôi phục">
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleHardDelete(user)} className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors" title="Xóa vĩnh viễn">
                              <ExclamationTriangleIcon className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => openEdit(user)} className="p-1.5 rounded-md text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${user.username}`}>
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => handleDelete(user)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors" title="Xóa" aria-label={`Xóa ${user.username}`}>
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={currentPage}
        pageSize={PAGE_SIZE}
        total={filtered.length}
        onPageChange={setPage}
        itemLabel="nhân sự"
        ariaLabel="Phân trang nhân sự"
      />

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
          <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl animate-in zoom-in-95 duration-200 sm:max-h-[calc(100vh-2rem)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border)] px-5 py-4 sm:px-6 sm:py-5">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                {editingUser ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
              </h2>
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="rounded-lg p-2 transition-colors hover:bg-[var(--color-bg)]" aria-label="Đóng biểu mẫu">
                <XMarkIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
              </button>
            </div>
            <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
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
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Họ tên <span className="text-rose-500">*</span></label>
                <input
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
                    Email
                    <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-muted)]">Không bắt buộc · đúng định dạng nếu nhập</span>
                  </label>
                  <input
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--color-text-primary)]">
                    Số điện thoại
                    <span className="mt-0.5 block text-xs font-normal text-[var(--color-text-muted)]">Không bắt buộc · ví dụ 0901234567</span>
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0901234567"
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Vai trò <span className="text-rose-500">*</span> <span className="text-xs font-normal text-[var(--color-text-muted)]">(chọn một)</span></label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ROLE_OPTIONS.map(role => {
                    const isSelected = form.roles?.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setForm(f => ({ ...f, roles: [role] }));
                        }}
                        aria-pressed={isSelected}
                        className={`min-h-10 rounded-lg border px-3 py-2 text-xs font-bold transition-all ${isSelected
                            ? 'bg-[var(--color-primary)] text-white shadow-sm'
                            : 'border-[var(--color-border)] bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
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
              <div className="flex gap-3 border-t border-[var(--color-border)] pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingUser(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
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
