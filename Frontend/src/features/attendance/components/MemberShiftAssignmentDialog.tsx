import { useState } from 'react';
import { CalendarDaysIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/Button';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import {
  useCancelShiftAssignment,
  useApproveLateCheckIn,
  useCreateFullDayShiftAssignment,
  useCreateShiftAssignment,
  useRevokeLateCheckIn,
  useShiftAssignments,
  useShiftTemplates,
} from '../api/attendanceApi';
import { getLocalDateInputValue } from '../utils/attendanceTime';
import { getApiErrorMessage } from '../../../services/apiError';

interface MemberShiftAssignmentDialogProps {
  projectId: number;
  userId: number;
  fullName: string;
  username: string;
  onClose: () => void;
}

const FULL_DAY_VALUE = 'FULL_DAY';

function formatTime(value: string) {
  return value?.slice(0, 5) || '—';
}

export function MemberShiftAssignmentDialog({
  projectId,
  userId,
  fullName,
  username,
  onClose,
}: MemberShiftAssignmentDialogProps) {
  const { confirm } = useActionDialog();
  const [workDate, setWorkDate] = useState(getLocalDateInputValue());
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: templates, isLoading: templatesLoading } = useShiftTemplates(projectId);
  const { data: assignments, isLoading: assignmentsLoading } = useShiftAssignments({
    from: workDate,
    to: workDate,
    projectId,
    userId,
  });
  const createAssignment = useCreateShiftAssignment();
  const createFullDayAssignment = useCreateFullDayShiftAssignment();
  const cancelAssignment = useCancelShiftAssignment();
  const approveLateCheckIn = useApproveLateCheckIn();
  const revokeLateCheckIn = useRevokeLateCheckIn();

  const fullDayTemplate = templates?.find((template) =>
    !template.crossesMidnight && formatTime(template.startTime) === '08:00' && formatTime(template.endTime) === '17:30'
      && template.overtimeEligible,
  );
  const selectedTemplate = selectedTemplateId === FULL_DAY_VALUE
    ? fullDayTemplate
    : templates?.find((template) => template.id === Number(selectedTemplateId));
  const isFullDay = selectedTemplateId === FULL_DAY_VALUE;
  const isSaving = createAssignment.isPending || createFullDayAssignment.isPending;

  const resetForm = () => {
    setSelectedTemplateId('');
    setNotes('');
    setFormError(null);
  };

  const handleSuccess = (message: string) => {
    resetForm();
    toast.success(message);
  };

  const submit = () => {
    setFormError(null);
    if (!selectedTemplateId || !workDate) {
      setFormError('Vui lòng chọn mẫu ca và ngày làm việc.');
      return;
    }

    if (isFullDay) {
      if (!fullDayTemplate) {
        setFormError('Dự án cần có mẫu Ca hành chính 08:00–17:30 và bật tính tăng ca để phân Full ca.');
        return;
      }
      createFullDayAssignment.mutate({
        projectId,
        userId,
        shiftTemplateId: fullDayTemplate.id,
        workDate,
        notes: notes.trim() || undefined,
      }, {
        onSuccess: () => handleSuccess(`Đã phân Full ca cho ${fullName}.`),
        onError: (error) => setFormError(getApiErrorMessage(error, 'Không thể phân Full ca. Vui lòng kiểm tra lại dữ liệu.')),
      });
      return;
    }

    createAssignment.mutate({
      projectId,
      userId,
      shiftTemplateId: Number(selectedTemplateId),
      workDate,
      notes: notes.trim() || undefined,
    }, {
      onSuccess: () => handleSuccess(`Đã phân ${selectedTemplate?.name || 'ca'} cho ${fullName}.`),
      onError: (error) => setFormError(getApiErrorMessage(error, 'Không thể phân ca. Vui lòng kiểm tra lại dữ liệu.')),
    });
  };

  const cancel = async (assignmentId: number, shiftName: string) => {
    if (!(await confirm({
      title: 'Hủy phân ca',
      description: `Lượt ${shiftName} của ${fullName} sẽ chuyển sang trạng thái đã hủy và vẫn được giữ trong lịch sử.`,
      confirmLabel: 'Hủy phân ca',
      variant: 'warning',
    }))) return;

    cancelAssignment.mutate(assignmentId, {
      onSuccess: () => toast.success('Đã hủy phân ca.'),
      onError: (error) => setFormError(getApiErrorMessage(error, 'Không thể hủy phân ca.')),
    });
  };

  const approveLate = (assignmentId: number, shiftName: string) => {
    const reason = window.prompt(
      `Lý do đặc thù để mở chấm công cho ${fullName} · ${shiftName}:`,
      'Demo với giảng viên',
    )?.trim();
    if (!reason) return;

    approveLateCheckIn.mutate({ assignmentId, reason }, {
      onSuccess: () => toast.success('Đã mở chấm công đặc thù cho ca này.'),
      onError: (error) => setFormError(getApiErrorMessage(error, 'Không thể mở chấm công đặc thù.')),
    });
  };

  const revokeLate = async (assignmentId: number) => {
    if (!(await confirm({
      title: 'Thu hồi quyền chấm công muộn',
      description: 'Nhân viên sẽ quay lại quy tắc chấm công muộn tối đa 30 phút cho ca này.',
      confirmLabel: 'Thu hồi quyền',
      variant: 'warning',
    }))) return;

    revokeLateCheckIn.mutate(assignmentId, {
      onSuccess: () => toast.success('Đã thu hồi quyền chấm công muộn.'),
      onError: (error) => setFormError(getApiErrorMessage(error, 'Không thể thu hồi quyền chấm công muộn.')),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-shift-dialog-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <ClockIcon className="size-5" />
            </div>
            <div>
              <h2 id="member-shift-dialog-title" className="text-lg font-bold text-[var(--color-text-primary)]">Phân ca cho nhân sự</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{fullName} · @{username}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]" aria-label="Đóng">
            <XMarkIcon className="size-5" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">
            <span>Ngày làm việc</span>
            <span className="relative">
              <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]" />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)]">
            <span>Mẫu ca</span>
            <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)} disabled={templatesLoading} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]">
              <option value="">Chọn ca</option>
              {fullDayTemplate && <option value={FULL_DAY_VALUE}>Ca hành chính · Full ca (08:00–17:30 · 1 checkout)</option>}
              {(templates || []).filter((template) => template.id !== fullDayTemplate?.id).map((template) => <option key={template.id} value={template.id}>{template.name} · {template.code} ({formatTime(template.startTime)}–{formatTime(template.endTime)}{template.crossesMidnight ? ' hôm sau' : ''})</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-[var(--color-text-secondary)] sm:col-span-2">
            <span>Ghi chú <span className="font-normal text-[var(--color-text-muted)]">(tùy chọn)</span></span>
            <input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} placeholder="Ví dụ: Đội MEP, khu A" className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-primary)]" />
          </label>
        </div>

        {selectedTemplate && <p className="mx-6 mb-4 rounded-lg bg-[var(--color-surface-alt)] px-4 py-3 text-xs text-[var(--color-text-muted)]">Khung giờ {formatTime(selectedTemplate.startTime)}–{formatTime(selectedTemplate.endTime)}. Cho phép chấm sớm {selectedTemplate.earlyCheckInMinutes} phút, chấm muộn tối đa {selectedTemplate.lateCheckInMinutes} phút.</p>}
        <p className="mx-6 mb-4 rounded-lg border border-[var(--color-warning)]/25 bg-[var(--color-warning-bg)] px-4 py-3 text-xs leading-5 text-[var(--color-text-secondary)]">
          <strong>Chấm công đặc thù:</strong> Admin/PM có thể mở lại một ca tự động ghi vắng do quá 30 phút khi có lý do hợp lệ. Hệ thống vẫn bắt buộc GPS và Face ID; lý do sẽ được lưu vào lịch sử.
        </p>
        {isFullDay && <p className="mx-6 mb-4 rounded-lg bg-[var(--color-primary-light)]/50 px-4 py-3 text-xs font-medium text-[var(--color-text-secondary)]">Full ca là một lượt liên tục 08:00–17:30: chỉ cần một check-in và một checkout. Nghỉ 90 phút chỉ dùng khi tính công; tăng ca được xét sau 17:30 từ 60 đến tối đa 210 phút.</p>}
        {formError && <p className="mx-6 mb-4 rounded-lg border border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-danger)]">{formError}</p>}

        <div className="border-t border-[var(--color-border)] px-6 py-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Lịch ca trong ngày</h3>
            <span className="text-xs text-[var(--color-text-muted)]">{assignments?.length || 0} lượt</span>
          </div>
          {assignmentsLoading ? (
            <p className="rounded-lg bg-[var(--color-surface-alt)] px-4 py-4 text-sm text-[var(--color-text-muted)]">Đang tải lịch ca…</p>
          ) : assignments && assignments.length > 0 ? (
            <div className="space-y-2">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border)] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{assignment.shiftName}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatTime(assignment.startTime)}–{formatTime(assignment.endTime)}{assignment.crossesMidnight ? ' hôm sau' : ''}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {assignment.lateCheckInApproved ? (
                      <>
                        <span className="rounded-full bg-[var(--color-success-bg)] px-2 py-1 text-[11px] font-semibold text-[var(--color-success)]" title={assignment.lateCheckInApprovalNote || undefined}>
                          Đã mở chấm đặc thù
                        </span>
                        {assignment.attendanceClaimed ? (
                          <span
                            className="text-xs font-medium text-[var(--color-text-muted)]"
                            title="Không thể thu hồi vì nhân viên đã sử dụng quyền chấm công hoặc ca đã được chốt vắng."
                          >
                            Đã sử dụng
                          </span>
                        ) : (
                          <button type="button" onClick={() => revokeLate(assignment.id)} disabled={revokeLateCheckIn.isPending} className="text-xs font-semibold text-[var(--color-warning)] hover:underline disabled:opacity-50">Thu hồi</button>
                        )}
                      </>
                    ) : (
                      <button type="button" onClick={() => approveLate(assignment.id, assignment.shiftName)} disabled={approveLateCheckIn.isPending || assignment.attendanceStatus === 'COMPLETED' || assignment.attendanceStatus === 'CHECKED_IN'} className="text-xs font-semibold text-[var(--color-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50" title={assignment.attendanceStatus === 'COMPLETED' || assignment.attendanceStatus === 'CHECKED_IN' ? 'Ca đã có lượt chấm công, không thể mở lại' : 'Mở chấm công đặc thù và nhập lý do'}>Mở chấm đặc thù</button>
                    )}
                    {assignment.attendanceStatus === 'ABSENT' && !assignment.lateCheckInApproved && <span className="text-[11px] font-medium text-[var(--color-danger)]">Đã vắng</span>}
                    <button type="button" onClick={() => cancel(assignment.id, assignment.shiftName)} disabled={cancelAssignment.isPending} className="text-xs font-semibold text-[var(--color-danger)] hover:underline disabled:opacity-50">Hủy</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-[var(--color-surface-alt)] px-4 py-4 text-sm text-[var(--color-text-muted)]">Chưa có ca nào trong ngày này.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <Button type="button" variant="secondary" onClick={onClose}>Đóng</Button>
          <Button type="button" onClick={submit} isLoading={isSaving}>Lưu phân ca</Button>
        </div>
      </div>
    </div>
  );
}
