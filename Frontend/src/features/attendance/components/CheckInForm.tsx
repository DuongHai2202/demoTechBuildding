import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, MapPinIcon, CheckCircleIcon, ArrowRightStartOnRectangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useProjects } from '../../projects/api/projectApi';
import { useAttendanceEffectiveClock, useCheckIn, useCheckOut, useTodayRecord, useLogFailure, useCurrentShift } from '../api/attendanceApi';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useAuthStore } from '../../auth/stores/authStore';
import { Button } from '../../../components/ui/Button';
import { PermissionModal } from './PermissionModal';
import { FaceVerificationModal } from './FaceVerificationModal';
import { FaceRegistrationModal } from '../../auth/components/FaceRegistrationModal';
import { calculateDistance } from '../../../utils/geo';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import { getLocalDateInputValue } from '../utils/attendanceTime';
import { getApiErrorMessage } from '../../../services/apiError';

export interface CheckInFormProps {
  selectedProjectId: number | '';
  onProjectChange: (id: number | '') => void;
}

export function CheckInForm({ selectedProjectId, onProjectChange }: CheckInFormProps) {
  const MAX_GPS_ACCURACY_METERS = 150;
  const { confirm } = useActionDialog();
  const user = useAuthStore((s) => s.user);
  const isManager = user?.roles?.some((role) => ['ADMIN', 'PM'].includes(role)) ?? false;
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const navigate = useNavigate();

  const [actionError, setActionError] = useState<string | null>(null);
  
  // Daily Reset Logic: Force refresh check-in status when day changes
  const [currentDate, setCurrentDate] = useState(() => getLocalDateInputValue());
  const { data: effectiveClock, isLoading: isClockLoading } = useAttendanceEffectiveClock();
  const effectiveDate = effectiveClock?.businessDate || currentDate;

  useEffect(() => {
    // Check every minute if the day has changed
    const interval = setInterval(() => {
      const liveDate = getLocalDateInputValue();
      if (liveDate !== currentDate) {
        setCurrentDate(liveDate);
      }
    }, 60000); 
    return () => clearInterval(interval);
  }, [currentDate]);

  const {
    position,
    error: geoError,
    errorCode: geoErrorCode,
    isLoading: isGeoLoading,
    refetch: refetchGeo,
    permissionStatus,
    isSupported: isGeolocationSupported,
  } = useGeolocation();
  const selectedProjectObj = projects?.find(p => p.id === Number(selectedProjectId));
  const isSelectedProjectAccessible = !projectsLoading && !!selectedProjectObj;
  const { data: todayRecord, isLoading: isRecordLoading } = useTodayRecord(
    user?.id || 0,
    Number(selectedProjectId) || 0,
    effectiveDate,
    { enabled: isSelectedProjectAccessible },
  );
  const { data: currentShift, isLoading: isShiftLoading } = useCurrentShift(
    user?.id || 0,
    Number(selectedProjectId) || 0,
    effectiveDate,
    { enabled: isSelectedProjectAccessible },
  );

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const logFailureMutation = useLogFailure();

  const [permissionRequest, setPermissionRequest] = useState<{
    isOpen: boolean;
    type: 'location' | 'camera';
  }>({ isOpen: false, type: 'location' });
  const [showFaceVerifyModal, setShowFaceVerifyModal] = useState(false);
  const [showFaceRegistrationModal, setShowFaceRegistrationModal] = useState(false);

  // Auto-prompt Permission Primer on mount
  useEffect(() => {
    if (permissionStatus === 'prompt' && !sessionStorage.getItem('geo_prompt_shown')) {
      sessionStorage.setItem('geo_prompt_shown', 'true');
      const timer = window.setTimeout(() => {
        setPermissionRequest({ isOpen: true, type: 'location' });
      }, 0);
      return () => window.clearTimeout(timer);
    }
  }, [permissionStatus]);

  const hasAssignedProjects = (projects?.length ?? 0) > 0;

  useEffect(() => {
    if (projects && selectedProjectId && !projects.some((project) => project.id === Number(selectedProjectId))) {
      onProjectChange('');
    }
  }, [projects, selectedProjectId, onProjectChange]);
  const projectLatitude = selectedProjectObj && selectedProjectObj.latitude != null ? Number(selectedProjectObj.latitude) : NaN;
  const projectLongitude = selectedProjectObj && selectedProjectObj.longitude != null ? Number(selectedProjectObj.longitude) : NaN;
  const hasProjectCoordinates = Number.isFinite(projectLatitude) && Number.isFinite(projectLongitude);
  const canManageProjectLocation = user?.roles?.some((role) => ['ADMIN', 'PM'].includes(role)) ?? false;
  
  let distanceToProject: number | null = null;
  let isWithinGeofence: boolean | null = null;

  if (hasProjectCoordinates && position) {
    distanceToProject = calculateDistance(
      position.latitude, position.longitude,
      projectLatitude, projectLongitude
    );
    const radius = selectedProjectObj?.radiusMeters || 100;
    isWithinGeofence = distanceToProject <= radius;
  }

  const hasAcceptableGpsAccuracy = Boolean(
    position && Number.isFinite(position.accuracy) && position.accuracy <= MAX_GPS_ACCURACY_METERS
  );



  const handleAction = async () => {
    if (!selectedProjectId || !position) return;
    setActionError(null);

    const isCheckingOutNow = !!todayRecord
      && todayRecord.status !== 'ABSENT'
      && !todayRecord.checkOutAt;
    if (!isCheckingOutNow && !isManager) {
      if (isClockLoading || !effectiveClock) {
        setActionError('Đang đồng bộ thời gian máy chủ. Vui lòng chờ một chút rồi thử lại.');
        return;
      }
      if (isShiftLoading) {
        setActionError('Đang tải thông tin ca làm việc. Vui lòng chờ một chút rồi thử lại.');
        return;
      }
      if (!currentShift) {
        setActionError('Bạn chưa được phân công ca làm việc cho dự án này trong hôm nay.');
        return;
      }
      if (!currentShift.eligibleForCheckIn) {
        setActionError(currentShift.windowMessage || 'Hiện chưa nằm trong khung thời gian được phép chấm công.');
        return;
      }
    }

    if (!hasProjectCoordinates) {
      setActionError('Dự án chưa có tọa độ GPS. Hãy bổ sung vị trí dự án trước khi chấm công.');
      return;
    }

    if (!hasAcceptableGpsAccuracy) {
      setActionError(`Độ chính xác GPS hiện tại chưa đủ tốt (tối đa ${MAX_GPS_ACCURACY_METERS}m). Hãy cập nhật vị trí rồi thử lại.`);
      logFailureMutation.mutate({
        userId: user?.id || 0,
        projectId: Number(selectedProjectId),
        reason: `GPS không đủ chính xác (±${position.accuracy.toFixed(1)}m)`,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
      });
      return;
    }

    if (isWithinGeofence === false) {
      setActionError('Bạn đang ở ngoài vùng dự án cho phép. Lần thử này đã được ghi lại.');
      logFailureMutation.mutate({
        userId: user?.id || 0,
        projectId: Number(selectedProjectId),
        reason: `Ngoài vùng dự án (${distanceToProject?.toFixed(1)}m)`,
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
      });
      return;
    }

    if (!user?.hasFaceRegistered) {
      setActionError('Bạn phải đăng ký dữ liệu sinh trắc học (khuôn mặt) trong hồ sơ trước khi chấm công.');
      logFailureMutation.mutate({
        userId: user?.id || 0,
        projectId: Number(selectedProjectId),
        reason: 'Chưa đăng ký khuôn mặt',
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
      });
      return;
    }

    const isCheckingOut = !!todayRecord
      && todayRecord.status !== 'ABSENT'
      && !todayRecord.checkOutAt;

    if (isCheckingOut) {
      if (!(await confirm({
        title: 'Kết thúc ca làm việc',
        description: 'Hệ thống sẽ ghi nhận thời điểm check-out và kết thúc ca hôm nay. Bạn có chắc muốn tiếp tục?',
        confirmLabel: 'Kết thúc ca',
        variant: 'warning',
      }))) {
        return;
      }
    }

    setShowFaceVerifyModal(true);
  };

  const proceedWithAction = (selfieFile: File) => {
    setShowFaceVerifyModal(false);
    if (!position) return;

    const userId = user?.id || 0;
    const isCheckingOut = !!todayRecord && !todayRecord.checkOutAt;

    const options = {
      onSuccess: () => {
        setActionError(null);
      },
      onError: (err: unknown) => {
        setActionError(getApiErrorMessage(err, 'Có lỗi xảy ra khi chấm công.'));
      }
    };

    if (isCheckingOut) {
      checkOutMutation.mutate({
        userId,
        projectId: Number(selectedProjectId),
        data: { latitude: position.latitude, longitude: position.longitude, accuracy: position.accuracy },
        selfie: selfieFile
      }, options);
    } else {
      checkInMutation.mutate({
        userId,
        data: {
          projectId: Number(selectedProjectId),
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
        },
        selfie: selfieFile
      }, options);
    }
  };

  // An automatically-created ABSENT log can be reopened by an ADMIN/PM.
  // In that case the next action is a new check-in, not a checkout and not a
  // completed day. A manually closed absence remains blocking.
  const isLateCheckInReopened = currentShift?.lateCheckInApproved === true
    && currentShift.attendanceStatus === 'ABSENT';
  const isCheckedIn = !!todayRecord && todayRecord.status !== 'ABSENT' && !todayRecord.checkOutAt;
  const isAbsent = todayRecord?.status === 'ABSENT' && !isLateCheckInReopened;
  const isCompleted = !!todayRecord && (
    !!todayRecord.checkOutAt
    || (todayRecord.status === 'ABSENT' && !isLateCheckInReopened)
  );

  const handlePermissionResponse = (response: 'allow' | 'allow_once' | 'deny') => {
    const type = permissionRequest.type;
    setPermissionRequest({ ...permissionRequest, isOpen: false });

    if (response === 'deny') {
      // Just close, errors will be handled by the respective hooks/calls
      return;
    }

    if (response === 'allow') {
      localStorage.setItem(`${type}_granted`, 'true');
    }

    if (type === 'location') {
      refetchGeo();
    }
  };

  const handleGeoRequest = () => {
    if (!isGeolocationSupported || geoErrorCode === 1 || permissionStatus === 'denied') {
      setPermissionRequest({ isOpen: true, type: 'location' });
    } else if (permissionStatus !== 'granted') {
      setPermissionRequest({ isOpen: true, type: 'location' });
    } else {
      refetchGeo();
    }
  };

  const retryLocationPermission = () => {
    setPermissionRequest((current) => ({ ...current, isOpen: false }));
    refetchGeo();
  };

  const openFaceRegistration = () => {
    setActionError(null);
    setShowFaceRegistrationModal(true);
  };

  const openProfileFaceSetup = () => {
    sessionStorage.setItem('attendance_return_project', String(selectedProjectId));
    navigate('/settings?section=profile&action=register-face&from=attendance');
  };

  const openProjectLocationSetup = () => {
    if (selectedProjectObj) {
      sessionStorage.setItem('attendance_return_project', String(selectedProjectObj.id));
      navigate(`/projects/${selectedProjectObj.id}/edit?focus=location&from=attendance`);
    }
  };
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)] group hover:border-[var(--color-primary)] transition-all">
        <label className="mb-3 block px-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-disabled)]">Chọn dự án đang thi công</label>
        {projectsLoading ? (
          <div className="h-12 animate-pulse rounded-xl bg-[var(--color-surface-alt)]" aria-label="Đang tải dự án" />
        ) : !hasAssignedProjects ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
            <ExclamationCircleIcon className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">Bạn chưa được phân công vào dự án nào</p>
              <p className="mt-1 text-xs leading-relaxed">Liên hệ PM hoặc quản trị viên để được thêm vào dự án. Khi chưa có dự án, hệ thống sẽ không cho tạo lượt chấm công.</p>
            </div>
          </div>
        ) : (
          <select
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm font-bold text-[var(--color-text-primary)] outline-none transition-all hover:border-[var(--color-primary-light)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            value={selectedProjectId}
            onChange={(e) => onProjectChange(e.target.value ? Number(e.target.value) : '')}
            disabled={isCheckedIn || isCompleted}
          >
            <option value="">-- Chọn dự án --</option>
            {projects?.map((p) => {
              const hasCoordinates = p.latitude != null && p.longitude != null;
              return <option key={p.id} value={p.id} disabled={!hasCoordinates}>{p.projectCode ? `${p.projectCode} · ` : ''}{p.name}{hasCoordinates ? '' : ' (Chưa cấu hình GPS)'}</option>;
            })}
          </select>
        )}
      </div>

      {isAbsent && (
        <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger-bg)] p-4 text-[var(--color-danger)]">
          <ExclamationCircleIcon className="mt-0.5 size-6 shrink-0" />
          <div>
            <p className="text-sm font-bold">Ca làm việc đã được ghi nhận vắng</p>
            <p className="mt-1 text-xs leading-relaxed">Bạn đã quá 30 phút kể từ giờ bắt đầu ca hoặc chưa checkout đúng quy định. Liên hệ quản trị viên nếu cần điều chỉnh.</p>
          </div>
        </div>
      )}

      {isCompleted && !isAbsent && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 flex items-center gap-3">
          <CheckCircleIcon className="size-6 shrink-0" />
          <p className="text-sm font-medium">Bạn đã hoàn thành ca làm việc hôm nay cho dự án này. Hẹn gặp lại vào ngày mai!</p>
        </div>
      )}

      {selectedProjectId && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-[var(--shadow-card-theme)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <CheckCircleIcon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Ca làm việc hôm nay</p>
                {isShiftLoading ? (
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">Đang tải lịch phân ca…</p>
                ) : currentShift ? (
                  <>
                    <p className="mt-1 text-base font-bold text-[var(--color-text-primary)]">{currentShift.shiftName} · {currentShift.shiftCode}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      {currentShift.startTime.slice(0, 5)} – {currentShift.endTime.slice(0, 5)}{currentShift.crossesMidnight ? ' hôm sau' : ''}
                      {currentShift.breakMinutes > 0 ? ` · Nghỉ ${currentShift.breakMinutes} phút` : ''}
                    </p>
                    {currentShift.attendanceStatus === 'ABSENT' && !currentShift.lateCheckInApproved && (
                      <p className="mt-2 text-sm font-semibold text-[var(--color-danger)]">Đã phân ca · đã ghi nhận vắng</p>
                    )}
                    {currentShift.attendanceStatus === 'ABSENT' && currentShift.lateCheckInApproved && (
                      <p className="mt-2 text-sm font-semibold text-[var(--color-info)]">Đã mở chấm công đặc thù · cần xác thực để bắt đầu</p>
                    )}
                    {currentShift.attendanceStatus === 'COMPLETED' && (
                      <p className="mt-2 text-sm font-semibold text-[var(--color-success)]">Đã phân ca · đã hoàn thành</p>
                    )}
                  </>
                ) : todayRecord ? (
                  <p className="mt-1 text-sm font-semibold text-[var(--color-danger)]">
                    {isAbsent ? 'Đã phân ca nhưng đã ghi nhận vắng' : 'Đã có dữ liệu chấm công trong ngày này'}
                  </p>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-[var(--color-warning)]">Chưa được phân ca cho ngày này</p>
                )}
              </div>
            </div>
            {!isManager && currentShift && (
              <div className={`rounded-lg border px-3 py-2 text-xs font-semibold ${currentShift.eligibleForCheckIn ? 'border-[var(--color-success)]/30 bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`}>
                {currentShift.eligibleForCheckIn ? 'Đang trong khung chấm công' : currentShift.windowMessage}
              </div>
            )}
            {isManager && <span className="text-xs font-semibold text-[var(--color-info)]">Quản lý có quyền vận hành</span>}
          </div>
        </div>
      )}

      {selectedProjectId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GPS Status Card - Premium */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-[var(--shadow-card-theme)] relative overflow-hidden group hover:border-[var(--color-primary-light)] transition-all">
            <div className="relative">
              {isGeoLoading && (
                <div className="absolute inset-0 rounded-full bg-[var(--color-success)]/20 animate-ping opacity-75" />
              )}
              <div className={`relative p-4 rounded-2xl ${geoError ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'} transition-colors duration-500`}>
                <MapPinIcon className={`size-8 ${isGeoLoading ? 'animate-bounce' : ''}`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em]">Trạng thái định vị</p>
              {isGeoLoading ? (
                <div className="flex flex-col items-center space-y-1">
                  <p className="text-sm text-[var(--color-success)] font-black uppercase tracking-tight animate-pulse">Đang định vị...</p>
                  <p className="text-[10px] text-[var(--color-text-disabled)] italic font-bold">Hệ thống đang dò sóng GPS mới nhất</p>
                </div>
              ) : geoError ? (
                <p className="text-sm text-[var(--color-danger)] font-black tracking-tight">{geoError}</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedProjectObj ? (
                    !hasProjectCoordinates ? (
                      <p className="text-xs text-orange-600 font-black uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Dự án chưa cấu hình tọa độ</p>
                    ) : !position ? (
                      <div className="space-y-1">
                        <p className="text-sm text-[var(--color-warning)] font-black uppercase tracking-tight">Chưa nhận được vị trí thiết bị</p>
                        <p className="text-[10px] font-bold text-[var(--color-text-muted)]">Bấm “Cập nhật vị trí” để xác định khoảng cách đến công trường.</p>
                      </div>
                    ) : isWithinGeofence === true ? (
                       <div className="space-y-1">
                         <p className="text-sm text-[var(--color-success)] font-black uppercase tracking-tight">Hợp lệ (Trong vùng dự án)</p>
            <div className="flex flex-wrap justify-center gap-2">
              <p className="text-[11px] font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-alt)] px-3 py-1 rounded-full inline-block">Cách tâm: {distanceToProject?.toFixed(1)}m</p>
              {position && <p className={`text-[11px] font-bold px-3 py-1 rounded-full inline-block ${hasAcceptableGpsAccuracy ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'}`}>Độ chính xác: {position.accuracy.toFixed(0)}m</p>}
            </div>
                       </div>
                    ) : isWithinGeofence === false ? (
                       <div className="space-y-1">
                         <p className="text-sm text-[var(--color-danger)] font-black uppercase tracking-tight">Nằm ngoài vùng dự án</p>
                         <div className="p-3 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/10">
                            <p className="text-[11px] font-black text-[var(--color-danger)] uppercase tracking-tighter">
                               Bạn đang cách tâm {distanceToProject?.toFixed(1)}m
                            </p>
                            <p className="text-[9px] font-bold text-[var(--color-danger)]/60 mt-0.5">
                               (Yêu cầu bán kính: {selectedProjectObj.radiusMeters || 100}m)
                            </p>
                         </div>
                       </div>
                    ) : null
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-[var(--color-success)] font-black uppercase tracking-tight">Đã sẵn sàng</p>
                      <p className="text-[10px] font-bold text-[var(--color-text-disabled)] uppercase">Vui lòng chọn dự án bên trên</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={handleGeoRequest}
              className="text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest hover:bg-[var(--color-primary-light)] px-4 py-2 rounded-lg transition-all disabled:opacity-30"
              type="button"
              disabled={isGeoLoading}
            >
              {permissionStatus === 'denied' ? 'Thử lại quyền vị trí' : 'Cập nhật vị trí'}
            </button>
          </div>

          {/* AI Scanner Status Card - Premium */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-[var(--shadow-card-theme)] group hover:border-[var(--color-primary-light)] transition-all">
            <div className="relative size-20 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-3xl overflow-hidden flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
              <CameraIcon className="size-10 animate-pulse" />
              <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-primary)]/30 animate-scan" />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-[0.2em]">Xác thực sinh trắc học</p>
              <div className="space-y-1 px-4">
            <p className="text-[11px] font-bold text-[var(--color-text-muted)] leading-relaxed">
                  Hệ thống sẽ kiểm tra khuôn mặt và lưu ảnh minh chứng cho lượt chấm công.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                   <span className="px-2 py-0.5 rounded bg-[var(--color-surface-alt)] text-[9px] font-black text-[var(--color-text-disabled)] uppercase tracking-tighter">Bảo mật</span>
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${user?.hasFaceRegistered ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]' : 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'}`}>
                     {user?.hasFaceRegistered ? 'Đã đăng ký mặt' : 'Chưa đăng ký mặt'}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProjectId && (
        <div className="pt-6">
          {!hasProjectCoordinates && selectedProjectObj && (
            <div className="mb-6 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-amber-900">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="mt-0.5 size-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">Dự án chưa có tọa độ GPS</p>
                  <p className="mt-1 text-xs leading-relaxed">
                    Không thể xác nhận geofence nên hệ thống sẽ khóa chấm công để bảo vệ tính toàn vẹn dữ liệu.
                  </p>
                  {canManageProjectLocation ? (
                    <button
                      type="button"
                      onClick={openProjectLocationSetup}
                      className="mt-3 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700"
                    >
                      Mở cấu hình GPS dự án
                    </button>
                  ) : (
                    <p className="mt-3 text-xs font-semibold">Vui lòng báo PM/Admin bổ sung vị trí dự án.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!user?.hasFaceRegistered && (
            <div className="mb-6 rounded-xl border border-[var(--color-primary)]/25 bg-[var(--color-primary-light)]/40 p-4">
              <div className="flex items-start gap-3">
                <CameraIcon className="mt-0.5 size-5 shrink-0 text-[var(--color-primary)]" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--color-text-primary)]">Chưa đăng ký khuôn mặt</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                    Hoàn tất đăng ký một lần để hệ thống xác thực chính chủ khi vào ca hoặc tan ca.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={openFaceRegistration}
                      className="rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                    >
                      Đăng ký ngay
                    </button>
                    <button
                      type="button"
                      onClick={openProfileFaceSetup}
                      className="rounded-lg border border-[var(--color-primary)]/40 px-3 py-2 text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
                    >
                      Mở hồ sơ cá nhân
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {actionError && (
            <div className="mb-6 p-4 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20 text-[var(--color-danger)] text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
              <ExclamationCircleIcon className="size-5 opacity-70" />
              {actionError}
            </div>
          )}
          <Button
            className="w-full h-16 text-lg font-black uppercase tracking-[0.2em] shadow-[var(--shadow-modal-theme)] rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            variant={isCheckedIn ? 'danger' : 'primary'}
            onClick={handleAction}
            isLoading={checkInMutation.isPending || checkOutMutation.isPending || isRecordLoading || logFailureMutation.isPending}
            disabled={!position || !!geoError || !hasProjectCoordinates || !hasAcceptableGpsAccuracy || isCompleted || (!isCheckedIn && !isManager && (isShiftLoading || !currentShift?.eligibleForCheckIn))}
          >
            {isCheckedIn ? (
              <>
                <ArrowRightStartOnRectangleIcon className="size-6 mr-3 stroke-[2.5]" />
                Kết thúc ca làm
              </>
            ) : isCompleted ? (
              <>
                <CheckCircleIcon className="size-6 mr-3 stroke-[2.5]" />
                Đã xong việc
              </>
            ) : (
              <>
                <CheckCircleIcon className="size-6 mr-3 stroke-[2.5]" />
                Bắt đầu ca làm
              </>
            )}
          </Button>

          {isCheckedIn && todayRecord && (
            <div className="mt-5 flex items-center justify-center gap-2">
               <div className="size-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
               <p className="text-[11px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest">
                 Bạn đã bắt đầu ca làm lúc: <span className="text-[var(--color-text-primary)]">{new Date(todayRecord.checkInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
               </p>
            </div>
          )}
        </div>
      )}

      <PermissionModal
        isOpen={permissionRequest.isOpen}
        type={permissionRequest.type}
        isDenied={permissionRequest.type === 'location' ? (!isGeolocationSupported || geoErrorCode === 1 || permissionStatus === 'denied') : false}
        onRetry={permissionRequest.type === 'location' ? retryLocationPermission : undefined}
        onClose={() => setPermissionRequest({ ...permissionRequest, isOpen: false })}
        onPermissionResponse={handlePermissionResponse}
      />
      {showFaceVerifyModal && (
        <FaceVerificationModal
          projectId={Number(selectedProjectId)}
          location={position ? {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy,
          } : undefined}
          onSuccess={proceedWithAction}
          onCancel={() => setShowFaceVerifyModal(false)}
        />
      )}
      {showFaceRegistrationModal && (
        <FaceRegistrationModal onComplete={() => setShowFaceRegistrationModal(false)} />
      )}
    </div>
  );
}
