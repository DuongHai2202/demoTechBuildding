import { useMemo, useState } from 'react';
import { CalendarDaysIcon, ClockIcon, UserPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import { Button } from '../../../components/ui/Button';
import { useProjectMembers } from '../../projects/api/projectApi';
import {
  useCancelShiftAssignment,
  useCreateFullDayShiftAssignment,
  useCreateShiftAssignment,
  useShiftAssignments,
  useShiftTemplates,
} from '../api/attendanceApi';
import type { ShiftTemplate } from '../types/shift.types';
import { getLocalDateInputValue } from '../utils/attendanceTime';
import { getApiErrorMessage } from '../../../services/apiError';

interface ShiftAssignmentPanelProps {
  projectId: number;
}

function formatTime(value: string) {
  return value?.slice(0, 5) || '—';
}

function overtimePolicyText(template: ShiftTemplate) {
  const start = formatTime(template.startTime);
  const end = formatTime(template.endTime);
  const isAfternoon = !template.crossesMidnight && start === '13:00' && end === '17:30';
  const isFullDay = !template.crossesMidnight && start === '08:00' && end === '17:30';
  if (template.overtimeEligible && (isAfternoon || isFullDay)) {
    return isAfternoon
      ? 'Chỉ xét tăng ca khi đã hoàn tất ca sáng 08:00–12:00; thời gian sau 17:30 tối thiểu 60 phút và tối đa 210 phút.'
      : 'Full ca được checkout một lần lúc kết thúc ca; thời gian sau 17:30 được xét tăng ca tối thiểu 60 phút và tối đa 210 phút.';
  }
  return 'Ca này không tự phát sinh tăng ca. Ca đêm và ca làm một buổi không được tính tăng ca.';
}

const FULL_DAY_VALUE = 'FULL_DAY';

export function ShiftAssignmentPanel({ projectId }: ShiftAssignmentPanelProps) {
  const { confirm } = useActionDialog();
  const today = getLocalDateInputValue();
  const [workDate, setWorkDate] = useState(today);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: members, isLoading: membersLoading } = useProjectMembers(projectId);
  const { data: templates, isLoading: templatesLoading } = useShiftTemplates(projectId);
  const { data: assignments, isLoading: assignmentsLoading } = useShiftAssignments({
    from: workDate,
    to: workDate,
    projectId,
  });
  const createAssignment = useCreateShiftAssignment();
  const createFullDayAssignment = useCreateFullDayShiftAssignment();
  const cancelAssignment = useCancelShiftAssignment();

  const activeMembers = useMemo(
    () => (members || []).filter((member) => member.active !== false),
    [members],
  );

  const fullDayTemplate = templates?.find((template) =>
    !template.crossesMidnight && formatTime(template.startTime) === '08:00' && formatTime(template.endTime) === '17:30'
      && template.overtimeEligible,
  );
  const selectedTemplate = selectedTemplateId === FULL_DAY_VALUE
    ? fullDayTemplate
    : templates?.find((template) => template.id === Number(selectedTemplateId));
  const isFullDay = selectedTemplateId === FULL_DAY_VALUE;
  const isFullDayReady = Boolean(fullDayTemplate);

  const submit = () => {
    setFormError(null);
    if (!selectedUserId || !selectedTemplateId || !workDate) {
      setFormError('Vui lòng chọn nhân viên, mẫu ca và ngày làm việc.');
      return;
    }

    if (isFullDay) {
      if (!fullDayTemplate) {
        setFormError('Dự án cần có mẫu Ca hành chính 08:00–17:30 và bật tính tăng ca để phân Full ca.');
        return;
      }
      createFullDayAssignment.mutate({
        projectId,
        userId: Number(selectedUserId),
        shiftTemplateId: fullDayTemplate.id,
        workDate,
        notes: notes.trim() || undefined,
      }, {
        onSuccess: () => {
          setSelectedUserId('');
          setSelectedTemplateId('');
          setNotes('');
        },
        onError: (error) => {
          setFormError(getApiErrorMessage(error, 'Không thể phân Full ca. Vui lòng kiểm tra lại dữ liệu.'));
        },
      });
      return;
    }

    createAssignment.mutate({
      projectId,
      userId: Number(selectedUserId),
      shiftTemplateId: Number(selectedTemplateId),
      workDate,
      notes: notes.trim() || undefined,
    }, {
      onSuccess: () => {
        setSelectedUserId('');
        setSelectedTemplateId('');
        setNotes('');
      },
      onError: (error) => {
        setFormError(getApiErrorMessage(error, 'Không thể tạo phân ca. Vui lòng kiểm tra lại dữ liệu.'));
      },
    });
  };

  const remove = async (assignmentId: number) => {
    if (!(await confirm({
      title: 'Hủy phân ca',
      description: 'Phân ca sẽ được chuyển sang trạng thái đã hủy và không bị xóa khỏi lịch sử.',
      confirmLabel: 'Hủy phân ca',
      variant: 'warning',
    }))) return;
    cancelAssignment.mutate(assignmentId, {
      onError: (error) => {
        setFormError(getApiErrorMessage(error, 'Không thể hủy phân ca.'));
      },
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card-theme)]">
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <ClockIcon className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Lịch phân ca</h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Phân ca theo từng nhân viên và ngày; bản ghi đã hủy vẫn được giữ để kiểm toán.</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-[var(--color-info)]">Chỉ Admin/PM được thao tác</span>
      </div>

      <div className="grid gap-3 border-b border-[var(--color-border)] p-5 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] lg:items-end">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
          <span>Nhân viên</span>
          <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} disabled={membersLoading} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]">
            <option value="">Chọn nhân viên</option>
            {activeMembers.map((member) => <option key={member.userId} value={member.userId}>{member.fullName} · @{member.username}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
          <span>Mẫu ca</span>
          <select value={selectedTemplateId} onChange={(event) => setSelectedTemplateId(event.target.value)} disabled={templatesLoading} className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]">
            <option value="">Chọn ca</option>
            {isFullDayReady && <option value={FULL_DAY_VALUE}>Ca hành chính · Full ca (08:00–17:30 · 1 checkout)</option>}
            {(templates || []).filter((template) => template.id !== fullDayTemplate?.id).map((template) => <option key={template.id} value={template.id}>{template.name} · {template.code} ({formatTime(template.startTime)}–{formatTime(template.endTime)}{template.crossesMidnight ? ' hôm sau' : ''})</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
          <span>Ngày làm việc</span>
          <span className="relative">
            <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]" />
          </span>
        </label>
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
          <span>Ghi chú <span className="font-normal">(tùy chọn)</span></span>
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ví dụ: Khu A, tầng 3" className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-disabled)] focus:border-[var(--color-primary)]" />
        </label>
        <Button onClick={submit} isLoading={createAssignment.isPending || createFullDayAssignment.isPending} className="h-10 whitespace-nowrap">
          <UserPlusIcon className="mr-2 size-4" />
          Phân ca
        </Button>
      </div>

      {selectedTemplate && <p className="border-b border-[var(--color-border)] px-5 py-3 text-xs text-[var(--color-text-muted)]">Ca này có thời gian nghỉ {selectedTemplate.breakMinutes} phút, cho phép chấm sớm {selectedTemplate.earlyCheckInMinutes} phút và chấm muộn tối đa {selectedTemplate.lateCheckInMinutes} phút. {overtimePolicyText(selectedTemplate)}</p>}
      {isFullDay && <p className="border-b border-[var(--color-border)] bg-[var(--color-primary-light)]/40 px-5 py-3 text-xs font-medium text-[var(--color-text-secondary)]">Full ca là một lượt liên tục 08:00–17:30: chỉ cần một check-in và một checkout. Nghỉ 90 phút chỉ dùng khi tính công; tăng ca được xét sau 17:30 từ 60 đến tối đa 210 phút.</p>}
      {formError && <p className="border-b border-[var(--color-danger)]/20 bg-[var(--color-danger-bg)] px-5 py-3 text-sm font-semibold text-[var(--color-danger)]">{formError}</p>}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/60 text-xs font-semibold text-[var(--color-text-muted)]">
            <tr><th className="px-5 py-3">Nhân viên</th><th className="px-5 py-3">Ca</th><th className="px-5 py-3">Khung giờ</th><th className="px-5 py-3">Ghi chú</th><th className="px-5 py-3 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {assignmentsLoading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">Đang tải lịch phân ca…</td></tr>
            ) : assignments && assignments.length > 0 ? assignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-[var(--color-surface-alt)]/40">
                <td className="px-5 py-3"><p className="font-semibold text-[var(--color-text-primary)]">{assignment.fullName}</p><p className="text-xs text-[var(--color-text-muted)]">@{assignment.username}</p></td>
                <td className="px-5 py-3"><p className="font-semibold text-[var(--color-text-primary)]">{assignment.shiftName}</p><p className="text-xs text-[var(--color-text-muted)]">{assignment.shiftCode}</p></td>
                <td className="px-5 py-3 font-medium text-[var(--color-text-secondary)]">{formatTime(assignment.startTime)} – {formatTime(assignment.endTime)}{assignment.crossesMidnight ? ' hôm sau' : ''}</td>
                <td className="max-w-56 truncate px-5 py-3 text-[var(--color-text-muted)]">{assignment.notes || '—'}</td>
                <td className="px-5 py-3 text-right"><button type="button" onClick={() => remove(assignment.id)} disabled={cancelAssignment.isPending} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] disabled:opacity-50"><XMarkIcon className="size-4" />Hủy</button></td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]">Chưa có nhân viên nào được phân ca trong ngày này.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
