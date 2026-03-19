import React, { Component, useState } from 'react';
import type { ErrorInfo } from 'react';
import { useAuthStore } from '../../features/auth/stores/authStore';
import { toast } from 'sonner';
import { api } from '../../services/axiosInstance';
import { CheckCircleIcon, PaperAirplaneIcon, ClockIcon } from '@heroicons/react/24/outline';
import { FaceRegistrationModal } from '../../features/auth/components/FaceRegistrationModal';

class PendingApprovalErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error(error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 text-red-500 bg-red-50 h-screen overflow-auto">
          <h1 className="text-2xl font-bold mb-4">React App Crashed</h1>
          <pre className="whitespace-pre-wrap">{this.state.error?.stack || this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PendingApprovalPageWrapper() {
  return <PendingApprovalErrorBoundary><PendingApprovalPage /></PendingApprovalErrorBoundary>;
}

function PendingApprovalPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [reason, setReason] = useState('');
  const [requestedRole, setRequestedRole] = useState('STAFF');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/role-requests', {
        roleName: requestedRole,
        reason: reason
      });
      setSubmitted(true);
      if (user && !user.hasFaceRegistered) {
        setShowFaceModal(true);
      }
    } catch (error) {
      console.error('Failed to submit request', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card-theme)] border border-[var(--color-border)]">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            {submitted ? (
              <CheckCircleIcon className="h-12 w-12" />
            ) : (
              <ClockIcon className="h-12 w-12" />
            )}
          </div>
          <h1 className="mt-6 text-2xl font-bold text-[var(--color-text-primary)]">
            {submitted ? 'Yêu cầu đã gửi!' : 'Chờ phê duyệt'}
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] text-sm leading-relaxed">
            {submitted 
              ? 'Yêu cầu của bạn đã được gửi tới quản trị viên. Vui lòng quay lại sau khi tài khoản được kích hoạt.'
              : `Chào ${user?.fullName}, tài khoản của bạn hiện đang ở vai trò Khách. Vui lòng gửi yêu cầu để được truy cập các tính năng chính.`}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Vai trò mong muốn
              </label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="STAFF">Kỹ thuật / Hiện trường</option>
                <option value="PM">Quản lý dự án (PM)</option>
                <option value="PARTNER">Đối tác / Nhà thầu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
                Lý do xin quyền
              </label>
              <textarea
                required
                placeholder="VD: Tôi là kỹ sư hiện trường dự án SkyLine..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[100px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-[var(--color-primary-dark)] active:scale-95 disabled:opacity-50"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </form>
        ) : null}

        <button
          onClick={() => logout()}
          className="mt-6 w-full text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      {showFaceModal && (
        <FaceRegistrationModal onComplete={() => setShowFaceModal(false)} />
      )}
    </div>
  );
}
