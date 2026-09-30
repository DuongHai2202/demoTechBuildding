import { lazy, Suspense, Component, useCallback, useEffect, useMemo, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
  CameraIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

import { useAuthStore } from '../../features/auth/stores/authStore';
import type { RoleRequest, UserRole } from '../../features/users/types/user.types';
import { api } from '../../services/axiosInstance';
import { getApiErrorMessage } from '../../services/apiError';
import type { ApiResponse } from '../../types/api.types';

const LazyFaceRegistrationModal = lazy(async () => {
  const module = await import('../../features/auth/components/FaceRegistrationModal');
  return { default: module.FaceRegistrationModal };
});

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  { value: 'STAFF', label: 'Nhân viên hiện trường', description: 'Chấm công, nhật ký và công việc được phân công.' },
  { value: 'PM', label: 'Quản lý dự án', description: 'Theo dõi dự án, duyệt hồ sơ và phân công nhân sự.' },
  { value: 'PARTNER', label: 'Đối tác / Nhà thầu', description: 'Theo dõi gói thầu và gửi hồ sơ dự thầu.' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Quản trị viên',
  PM: 'Quản lý dự án',
  STAFF: 'Nhân viên',
  PARTNER: 'Đối tác / Nhà thầu',
  GUEST: 'Khách chờ duyệt',
};

const STATUS_LABELS: Record<RoleRequest['status'], string> = {
  PENDING: 'Đang chờ duyệt',
  APPROVED: 'Đã phê duyệt',
  REJECTED: 'Cần bổ sung thông tin',
};

interface PendingApprovalBoundaryState {
  hasError: boolean;
}

class PendingApprovalErrorBoundary extends Component<
  { children: ReactNode },
  PendingApprovalBoundaryState
> {
  state: PendingApprovalBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PendingApprovalBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Technical details stay in logs; never render a stack trace to end users.
    console.error('[PendingApprovalPage]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
          <section className="w-full max-w-lg rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-card-theme)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
              <ExclamationTriangleIcon className="size-7" aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-xl font-extrabold text-[var(--color-text-primary)]">Không thể mở trang yêu cầu</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
              Giao diện tạm thời gặp sự cố. Tải lại trang để tiếp tục; dữ liệu tài khoản của bạn không bị thay đổi.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              <ArrowPathIcon className="size-4" aria-hidden="true" />
              Tải lại trang
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default function PendingApprovalPageWrapper() {
  return (
    <PendingApprovalErrorBoundary>
      <PendingApprovalPage />
    </PendingApprovalErrorBoundary>
  );
}

function formatDate(value?: string) {
  if (!value) return 'Vừa gửi';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa gửi';
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function getStatusTone(status: RoleRequest['status']) {
  switch (status) {
    case 'APPROVED':
      return {
        icon: CheckCircleIcon,
        className: 'border-[var(--color-success)]/25 bg-[var(--color-success-bg)] text-[var(--color-success)]',
      };
    case 'REJECTED':
      return {
        icon: XCircleIcon,
        className: 'border-[var(--color-warning)]/35 bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
      };
    default:
      return {
        icon: ClockIcon,
        className: 'border-[var(--color-primary)]/20 bg-[var(--color-primary-light)] text-[var(--color-primary)]',
      };
  }
}

function PendingApprovalPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [requestedRole, setRequestedRole] = useState<UserRole>('STAFF');
  const [reason, setReason] = useState('');
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    setRequestError(null);
    try {
      const response = await api.get<ApiResponse<RoleRequest[]>>('/role-requests/me');
      setRequests(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      setRequestError(getApiErrorMessage(error, 'Chưa thể tải lịch sử yêu cầu. Bạn vẫn có thể gửi yêu cầu mới.'));
    } finally {
      setIsLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const latestRequest = requests[0] ?? null;
  const pendingRequest = useMemo(
    () => requests.find((request) => request.status === 'PENDING') ?? null,
    [requests],
  );
  const selectedRole = ROLE_OPTIONS.find((option) => option.value === requestedRole) ?? ROLE_OPTIONS[0];
  const isApproved = latestRequest?.status === 'APPROVED';
  const canSubmit = !pendingRequest && !isApproved;
  const reasonLength = reason.trim().length;
  const currentRole = String(user?.roles?.[0] ?? 'GUEST').toUpperCase() as UserRole;

  const handleLogout = () => {
    logout();
    window.location.assign('/login');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (trimmedReason.length < 10) {
      setFormError('Vui lòng mô tả ít nhất 10 ký tự để quản trị viên hiểu nhu cầu của bạn.');
      return;
    }
    if (trimmedReason.length > 500) {
      setFormError('Lý do xin quyền không được vượt quá 500 ký tự.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await api.post<ApiResponse<RoleRequest>>('/role-requests', {
        roleName: requestedRole,
        reason: trimmedReason,
      });
      const createdRequest = response.data.data;
      setRequests((previous) => [createdRequest, ...previous.filter((request) => request.id !== createdRequest.id)]);
      setReason('');
      toast.success('Đã gửi yêu cầu mở quyền cho quản trị viên.');
    } catch (error) {
      const message = getApiErrorMessage(error, 'Chưa thể gửi yêu cầu. Vui lòng thử lại sau.');
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.14),transparent_46%),radial-gradient(circle_at_85%_10%,rgba(14,165,233,0.10),transparent_38%)]" />

      <header className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-sm font-extrabold text-white shadow-sm">TB</div>
            <div>
              <p className="text-base font-extrabold tracking-tight text-[var(--color-text-primary)]">TechBuilding</p>
              <p className="text-xs text-[var(--color-text-muted)]">Không gian quản lý thi công</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[var(--color-text-primary)]">{user?.fullName || 'Tài khoản của bạn'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">@{user?.username || 'chưa xác định'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <ArrowRightStartOnRectangleIcon className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <section className="space-y-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                <ShieldCheckIcon className="size-4" aria-hidden="true" />
                Quyền truy cập
              </div>
              <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
                Xin mở quyền sử dụng hệ thống
              </h1>
              <p className="mt-4 text-base leading-7 text-[var(--color-text-muted)]">
                Tài khoản đã được tạo thành công. Hãy gửi nhu cầu sử dụng để quản trị viên cấp đúng vai trò và dự án cho bạn.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-theme)] sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-primary)]">
                  <UserCircleIcon className="size-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Trạng thái tài khoản</p>
                  <p className="mt-1 text-lg font-extrabold text-[var(--color-text-primary)]">{user?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Chưa được cấp quyền làm việc'}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    Vai trò hiện tại: <span className="font-semibold text-[var(--color-text-secondary)]">{ROLE_LABELS[currentRole]}</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <ProgressStep number="1" title="Tài khoản đã tạo" description="Thông tin đăng ký của bạn đã được lưu." complete />
                <ProgressStep number="2" title="Gửi yêu cầu mở quyền" description="Chọn vai trò phù hợp với công việc." complete={Boolean(latestRequest)} active={!latestRequest} />
                <ProgressStep number="3" title="Quản trị viên phê duyệt" description="Sau khi duyệt, bạn có thể đăng nhập và sử dụng chức năng được cấp." complete={latestRequest?.status === 'APPROVED'} active={latestRequest?.status === 'PENDING'} />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--color-primary)]/15 bg-[var(--color-primary-light)]/70 p-5">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="mt-0.5 size-5 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Bạn chưa cần đăng ký lại tài khoản</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    Chỉ cần gửi yêu cầu một lần. Quản trị viên sẽ xem xét và thông báo kết quả trong hệ thống.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-theme)] sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-primary)]">Bước tiếp theo</p>
                <h2 className="mt-1 text-xl font-extrabold text-[var(--color-text-primary)]">Gửi yêu cầu mở tài khoản</h2>
                <p className="mt-1 text-sm leading-6 text-[var(--color-text-muted)]">Thông tin này giúp quản trị viên xác nhận đúng quyền cho bạn.</p>
              </div>
              <div className="hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] sm:flex">
                <PaperAirplaneIcon className="size-5" aria-hidden="true" />
              </div>
            </div>

            {requestError && (
              <div role="alert" className="mt-5 flex items-start gap-3 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                <ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0 text-[var(--color-warning)]" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold">Chưa tải được lịch sử yêu cầu</p>
                  <p className="mt-0.5 leading-6">{requestError}</p>
                </div>
                <button type="button" onClick={() => void loadRequests()} className="shrink-0 font-bold text-[var(--color-primary)] hover:underline">Thử lại</button>
              </div>
            )}

            {isLoadingRequests ? (
              <div className="mt-6 animate-pulse space-y-3" aria-label="Đang tải trạng thái yêu cầu">
                <div className="h-20 rounded-2xl bg-[var(--color-surface-alt)]" />
                <div className="h-11 rounded-xl bg-[var(--color-surface-alt)]" />
                <div className="h-28 rounded-xl bg-[var(--color-surface-alt)]" />
              </div>
            ) : pendingRequest ? (
              <RequestStatusCard request={pendingRequest} />
            ) : isApproved && latestRequest ? (
              <ApprovedCard request={latestRequest} onLogout={handleLogout} />
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {latestRequest?.status === 'REJECTED' && (
                  <div className="rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-4 py-4">
                    <div className="flex items-start gap-3">
                      <XCircleIcon className="mt-0.5 size-5 shrink-0 text-[var(--color-warning)]" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">Yêu cầu trước cần được bổ sung</p>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{latestRequest.adminNote || 'Quản trị viên đề nghị bạn gửi lại thông tin rõ hơn.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="requested-role" className="mb-2 block text-sm font-bold text-[var(--color-text-primary)]">Vai trò mong muốn <span className="text-[var(--color-danger)]">*</span></label>
                  <select
                    id="requested-role"
                    value={requestedRole}
                    onChange={(event) => setRequestedRole(event.target.value as UserRole)}
                    className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 text-sm font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                  >
                    {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{selectedRole.description}</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="request-reason" className="block text-sm font-bold text-[var(--color-text-primary)]">Lý do xin quyền <span className="text-[var(--color-danger)]">*</span></label>
                    <span className={`text-xs ${reasonLength > 500 ? 'font-bold text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}`}>{reasonLength}/500</span>
                  </div>
                  <textarea
                    id="request-reason"
                    required
                    minLength={10}
                    maxLength={500}
                    rows={5}
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Ví dụ: Tôi là kỹ sư hiện trường, cần chấm công và cập nhật nhật ký cho dự án Green Valley."
                    className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-3 text-sm leading-6 text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
                  />
                  <p className="mt-2 text-xs text-[var(--color-text-muted)]">Nêu rõ công việc hoặc dự án bạn cần tham gia để yêu cầu được xử lý nhanh hơn.</p>
                </div>

                {formError && (
                  <div role="alert" className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
                    <ExclamationTriangleIcon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                    <span className="leading-6">{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !canSubmit}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? <ArrowPathIcon className="size-5 animate-spin" aria-hidden="true" /> : <PaperAirplaneIcon className="size-5" aria-hidden="true" />}
                  {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu cho quản trị viên'}
                </button>
              </form>
            )}

            {latestRequest?.status === 'APPROVED' && user?.hasFaceRegistered === false && (
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary-light)]/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CameraIcon className="mt-0.5 size-5 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">Chuẩn bị xác thực khuôn mặt</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">Bạn có thể đăng ký trước để sẵn sàng chấm công sau khi đăng nhập lại.</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowFaceModal(true)} className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-primary)]/30 px-3 text-sm font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-surface)]">Đăng ký khuôn mặt</button>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card-theme)] sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">Theo dõi xử lý</p>
              <h2 className="mt-1 text-lg font-extrabold text-[var(--color-text-primary)]">Lịch sử yêu cầu của bạn</h2>
            </div>
            <button type="button" onClick={() => void loadRequests()} className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary)] hover:underline" disabled={isLoadingRequests}>
              <ArrowPathIcon className={`size-4 ${isLoadingRequests ? 'animate-spin' : ''}`} aria-hidden="true" />
              Cập nhật
            </button>
          </div>

          {isLoadingRequests ? (
            <div className="mt-5 h-16 animate-pulse rounded-2xl bg-[var(--color-surface-alt)]" />
          ) : requests.length === 0 ? (
            <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-9 text-center">
              <ClockIcon className="size-8 text-[var(--color-text-disabled)]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]">Bạn chưa gửi yêu cầu nào</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Điền biểu mẫu phía trên để bắt đầu.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {requests.map((request) => <RequestHistoryItem key={request.id} request={request} />)}
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-[var(--color-text-muted)]">Nếu bạn cần hỗ trợ gấp, hãy liên hệ quản trị viên và cung cấp tên đăng nhập <span className="font-bold">@{user?.username || 'của bạn'}</span>.</p>
      </main>

      {showFaceModal && (
        <Suspense fallback={null}>
          <LazyFaceRegistrationModal onComplete={() => setShowFaceModal(false)} />
        </Suspense>
      )}
    </div>
  );
}

function ProgressStep({ number, title, description, complete, active = false }: { number: string; title: string; description: string; complete?: boolean; active?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${complete ? 'bg-[var(--color-success)] text-white' : active ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]'}`}>
        {complete ? <CheckCircleIcon className="size-4" aria-hidden="true" /> : number}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className={`text-sm font-bold ${complete || active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[var(--color-text-muted)]">{description}</p>
      </div>
    </div>
  );
}

function RequestStatusCard({ request }: { request: RoleRequest }) {
  const tone = getStatusTone(request.status);
  const Icon = tone.icon;
  return (
    <div className={`mt-6 rounded-2xl border p-5 ${tone.className}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-6 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-base font-extrabold">{STATUS_LABELS[request.status]}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">Yêu cầu vai trò <span className="font-bold">{ROLE_LABELS[request.requestedRoleName]}</span> đã được ghi nhận. Quản trị viên sẽ phản hồi trong hệ thống.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 border-t border-current/10 pt-4 text-xs text-[var(--color-text-secondary)] sm:grid-cols-2">
        <div><span className="text-[var(--color-text-muted)]">Gửi lúc</span><p className="mt-1 font-bold">{formatDate(request.createdAt)}</p></div>
        <div><span className="text-[var(--color-text-muted)]">Vai trò</span><p className="mt-1 font-bold">{ROLE_LABELS[request.requestedRoleName]}</p></div>
      </div>
    </div>
  );
}

function ApprovedCard({ request, onLogout }: { request: RoleRequest; onLogout: () => void }) {
  return (
    <div className="mt-6 rounded-2xl border border-[var(--color-success)]/25 bg-[var(--color-success-bg)] p-5">
      <div className="flex items-start gap-3">
        <CheckCircleIcon className="mt-0.5 size-6 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
        <div>
          <p className="text-base font-extrabold text-[var(--color-text-primary)]">Yêu cầu đã được phê duyệt</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">Bạn đã được cấp vai trò <span className="font-bold">{ROLE_LABELS[request.requestedRoleName]}</span>. Hãy đăng xuất và đăng nhập lại để tải quyền mới.</p>
        </div>
      </div>
      <button type="button" onClick={onLogout} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-success)] px-4 text-sm font-bold text-white transition hover:brightness-95">
        Đăng nhập lại
        <ChevronRightIcon className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function RequestHistoryItem({ request }: { request: RoleRequest }) {
  const tone = getStatusTone(request.status);
  const Icon = tone.icon;
  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <div className="flex items-start gap-3">
        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${tone.className}`}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-[var(--color-text-primary)]">{ROLE_LABELS[request.requestedRoleName]}</p>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{formatDate(request.createdAt)}</span>
          </div>
          <p className="mt-1 text-xs font-semibold text-[var(--color-primary)]">{STATUS_LABELS[request.status]}</p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--color-text-muted)]">{request.reason}</p>
          {request.adminNote && <p className="mt-2 rounded-lg bg-[var(--color-surface)] px-3 py-2 text-xs leading-5 text-[var(--color-text-secondary)]"><span className="font-bold">Phản hồi:</span> {request.adminNote}</p>}
        </div>
      </div>
    </article>
  );
}
