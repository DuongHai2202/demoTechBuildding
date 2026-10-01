import { useMemo, useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';

import { useAuthStore } from '../../auth/stores/authStore';
import {
  useAttendanceDemoClock,
  useResetAttendanceDemoClock,
  useUpdateAttendanceDemoClock,
} from '../api/attendanceApi';
import { getApiErrorMessage } from '../../../services/apiError';

function toInputValue(value: string | null | undefined): string {
  return value ? value.slice(0, 16) : '';
}

function formatServerTime(value: string | null | undefined): string {
  if (!value) return '—';
  return value.replace('T', ' ').slice(0, 16);
}

const DEMO_PRESETS = [
  { time: '08:00', label: 'Bắt đầu ca', detail: 'Full ca' },
  { time: '08:30', label: 'Muộn 30 phút', detail: 'Vẫn hợp lệ' },
  { time: '08:31', label: 'Quá 30 phút', detail: 'Ghi vắng' },
  { time: '17:30', label: 'Kết thúc ca', detail: 'Không tăng ca' },
  { time: '18:30', label: '+1 giờ', detail: 'Tăng ca' },
  { time: '21:00', label: '+3 giờ 30', detail: 'Tăng ca tối đa' },
] as const;

type FeedbackTone = 'success' | 'error';

export function AttendanceDemoClockPanel() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes('ADMIN') ?? false;
  const clockQuery = useAttendanceDemoClock({ enabled: isAdmin });
  const updateClock = useUpdateAttendanceDemoClock();
  const resetClock = useResetAttendanceDemoClock();
  const [demoTime, setDemoTime] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone | null>(null);

  const featureDisabled = clockQuery.data && !clockQuery.data.featureEnabled;
  const inputDemoTime = demoTime || toInputValue(clockQuery.data?.demoTime || clockQuery.data?.effectiveTime || clockQuery.data?.actualTime);
  const canSubmit = Boolean(inputDemoTime) && !featureDisabled && !updateClock.isPending && !resetClock.isPending;
  const demoEnabled = Boolean(clockQuery.data?.enabled);
  const autoStopValue = demoEnabled
    ? clockQuery.data?.expiresAt
      ? formatServerTime(clockQuery.data.expiresAt)
      : 'Đang hoạt động'
    : 'Chưa kích hoạt';
  const autoStopHint = demoEnabled ? 'Phiên demo hiện tại' : 'Tự tắt sau 2 giờ khi bật';
  const statusDescription = featureDisabled
    ? 'Backend đang tắt chế độ demo'
    : clockQuery.isError
      ? 'Không đọc được trạng thái từ backend'
    : demoEnabled
      ? 'Các request chấm công đang dùng giờ này'
      : 'Các request đang dùng giờ thật';
  const statusLabel = useMemo(() => {
    if (clockQuery.isLoading) return 'Đang kiểm tra';
    if (featureDisabled) return 'Demo chưa bật';
    if (clockQuery.isError) return 'Không đọc được';
    if (demoEnabled) return 'Đang dùng giờ demo';
    return 'Đang dùng giờ thật';
  }, [demoEnabled, featureDisabled, clockQuery.isError, clockQuery.isLoading]);

  if (!isAdmin) return null;

  const setTimePreset = (time: string) => {
    const date = inputDemoTime.slice(0, 10);
    if (date) setDemoTime(`${date}T${time}`);
  };

  const setFeedback = (tone: FeedbackTone, text: string) => {
    setFeedbackTone(tone);
    setMessage(text);
  };

  const handleUpdate = () => {
    if (!canSubmit) return;
    setMessage('');
    setFeedbackTone(null);
    updateClock.mutate(
      { demoTime: inputDemoTime, enabled: true },
      {
        onSuccess: (data) => setFeedback('success', data.message),
        onError: (error) => setFeedback('error', getApiErrorMessage(error, 'Không thể bật giờ demo.')),
      },
    );
  };

  const handleReset = () => {
    setMessage('');
    setFeedbackTone(null);
    resetClock.mutate(undefined, {
      onSuccess: (data) => {
        setDemoTime('');
        setFeedback('success', data.message);
      },
      onError: (error) => setFeedback('error', getApiErrorMessage(error, 'Không thể tắt giờ demo.')),
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-warning)]/30 bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
      <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-warning-bg)] text-[var(--color-warning)] ring-1 ring-[var(--color-warning)]/20">
              <ClockIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-[var(--color-text-primary)]">Đồng hồ demo chấm công</h2>
              </div>
              <p className="mt-1 max-w-3xl text-xs leading-5 text-[var(--color-text-secondary)]">
                Đổi giờ server tạm thời để kiểm thử đúng các mốc vào ca, đi muộn và tăng ca. Không sửa timestamp đã lưu; giờ demo tự tắt sau 2 giờ.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:pt-1">
            <div className="text-right">
              <div className={`flex items-center justify-end gap-1.5 text-xs font-bold ${demoEnabled ? 'text-[var(--color-success)]' : 'text-[var(--color-text-secondary)]'}`}>
                <span className={`size-2 rounded-full ${demoEnabled ? 'bg-[var(--color-success)]' : 'bg-[var(--color-text-muted)]'}`} />
                {statusLabel}
              </div>
              <span className="mt-1 block text-[11px] text-[var(--color-text-muted)]">{statusDescription} · chỉ Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {featureDisabled && (
          <div className="flex items-start gap-2 rounded-xl border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)]/55 px-3 py-2.5 text-xs leading-5 text-[var(--color-text-secondary)]">
            <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
            <span>Backend chưa bật chế độ demo. Ở môi trường local hãy đặt <code className="font-semibold">ATTENDANCE_DEMO_CLOCK_ENABLED=true</code> rồi khởi động lại backend.</span>
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.05fr)_minmax(300px,1fr)]">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/35 p-3.5">
            <label htmlFor="attendance-demo-time" className="text-xs font-bold text-[var(--color-text-primary)]">Mốc thời gian cần mô phỏng</label>
            <input
              id="attendance-demo-time"
              type="datetime-local"
              value={inputDemoTime}
              onChange={(event) => setDemoTime(event.target.value)}
              disabled={Boolean(featureDisabled)}
              className="mt-2 h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <p className="mt-2 text-[11px] leading-5 text-[var(--color-text-muted)]">Chọn ngày và giờ, sau đó bấm <strong className="text-[var(--color-text-secondary)]">Bật giờ demo</strong>. Mốc này áp dụng cho toàn bộ request chấm công trên server local.</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/35 px-3 py-2.5">
              <span className="block text-[11px] font-semibold text-[var(--color-text-muted)]">Giờ thật server</span>
              <strong className="mt-1 block text-sm text-[var(--color-text-primary)]">{formatServerTime(clockQuery.data?.actualTime)}</strong>
            </div>
            <div className={`rounded-xl border px-3 py-2.5 ${demoEnabled ? 'border-[var(--color-primary)]/25 bg-[var(--color-primary-light)]' : 'border-[var(--color-border)] bg-[var(--color-surface-alt)]/35'}`}>
              <span className="block text-[11px] font-semibold text-[var(--color-text-muted)]">Giờ đang áp dụng</span>
              <strong className={`mt-1 block text-sm ${demoEnabled ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>{formatServerTime(clockQuery.data?.effectiveTime)}</strong>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/35 px-3 py-2.5">
              <span className="block text-[11px] font-semibold text-[var(--color-text-muted)]">Tự động tắt</span>
              <strong className="mt-1 block text-sm text-[var(--color-text-primary)]">{autoStopValue}</strong>
              <span className="mt-0.5 block text-[10px] text-[var(--color-text-muted)]">{autoStopHint}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/25 p-3.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-bold text-[var(--color-text-primary)]">Mốc kiểm thử nhanh</h3>
              <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">Chọn một mốc để điền vào ô thời gian; vẫn cần bấm “Bật giờ demo”.</p>
            </div>
            <span className="text-[11px] text-[var(--color-text-muted)]">Theo logic ca hành chính</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
            {DEMO_PRESETS.map(({ time, label, detail }) => (
              <button
                key={time}
                type="button"
                onClick={() => setTimePreset(time)}
                disabled={Boolean(featureDisabled)}
                title={`${label}: ${detail}`}
                className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-2 text-left transition hover:border-[var(--color-primary)]/45 hover:bg-[var(--color-primary-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="block text-sm font-bold text-[var(--color-primary)]">{time}</span>
                <span className="mt-0.5 block truncate text-[11px] font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]">{label}</span>
                <span className="mt-0.5 block truncate text-[10px] text-[var(--color-text-muted)]">{detail}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)]/25 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-[11px] leading-5 text-[var(--color-text-muted)]">
            <InformationCircleIcon className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
            <span>Chỉ dùng khi demo local. Khi có người dùng thật, hãy tắt giờ demo để không làm sai thời điểm chấm công.</span>
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:shrink-0">
            <button type="button" onClick={handleReset} disabled={resetClock.isPending || !demoEnabled} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-surface-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/25 disabled:cursor-not-allowed disabled:opacity-50">
              <StopIcon className="size-4" />
              Tắt giờ demo
            </button>
            <button type="button" onClick={handleUpdate} disabled={!canSubmit} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/35 disabled:cursor-not-allowed disabled:opacity-50">
              <PlayIcon className="size-4" />
              {updateClock.isPending ? 'Đang bật...' : 'Bật giờ demo'}
            </button>
          </div>
        </div>

        {(message || clockQuery.error) && (
          <div role="alert" className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium leading-5 ${feedbackTone === 'success' ? 'border-[var(--color-success)]/30 bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'border-[var(--color-danger)]/30 bg-[var(--color-danger-bg)] text-[var(--color-danger)]'}`}>
            {feedbackTone === 'success' ? <CheckCircleIcon className="mt-0.5 size-4 shrink-0" /> : <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0" />}
            <span>{message || getApiErrorMessage(clockQuery.error, 'Không thể đọc trạng thái đồng hồ demo.')}</span>
          </div>
        )}
      </div>
    </section>
  );
}
