import { useState, useEffect } from 'react';
import { CameraIcon, MapPinIcon, CheckCircleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useProjects } from '../../projects/api/projectApi';
import { useCheckIn, useCheckOut, useTodayRecord, useLogFailure } from '../api/attendanceApi';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { useAuthStore } from '../../auth/stores/authStore';
import { Button } from '../../../components/ui/Button';
import { PermissionModal } from './PermissionModal';
import { FaceVerificationModal } from './FaceVerificationModal';
import { calculateDistance } from '../../../utils/geo';

export interface CheckInFormProps {
  selectedProjectId: number | '';
  onProjectChange: (id: number | '') => void;
}

export function CheckInForm({ selectedProjectId, onProjectChange }: CheckInFormProps) {
  const user = useAuthStore((s) => s.user);
  const { data: projects } = useProjects();

  const [actionError, setActionError] = useState<string | null>(null);

  const { position, error: geoError, isLoading: isGeoLoading, refetch: refetchGeo, permissionStatus } = useGeolocation();
  const { data: todayRecord, isLoading: isRecordLoading } = useTodayRecord(user?.id || 0, Number(selectedProjectId) || 0);

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const logFailureMutation = useLogFailure();

  const [permissionRequest, setPermissionRequest] = useState<{
    isOpen: boolean;
    type: 'location' | 'camera';
  }>({ isOpen: false, type: 'location' });
  const [showFaceVerifyModal, setShowFaceVerifyModal] = useState(false);

  // Auto-prompt Permission Primer on mount
  useEffect(() => {
    if (permissionStatus === 'prompt' && !sessionStorage.getItem('geo_prompt_shown')) {
      sessionStorage.setItem('geo_prompt_shown', 'true');
      setPermissionRequest({ isOpen: true, type: 'location' });
    }
  }, [permissionStatus]);

  const selectedProjectObj = projects?.find(p => p.id === Number(selectedProjectId));
  
  let distanceToProject: number | null = null;
  let isWithinGeofence: boolean | null = null;

  if (selectedProjectObj?.latitude && selectedProjectObj?.longitude && position) {
    distanceToProject = calculateDistance(
      position.latitude, position.longitude,
      selectedProjectObj.latitude, selectedProjectObj.longitude
    );
    const radius = selectedProjectObj.radiusMeters || 100;
    isWithinGeofence = distanceToProject <= radius;
  }



  const handleAction = async () => {
    if (!selectedProjectId || !position) return;
    setActionError(null);

    if (!user?.hasFaceRegistered) {
      setActionError('Bạn phải đăng ký Dữ liệu Sinh trắc học (Khuôn mặt) vào hồ sơ mới được phép chấm công.');
      logFailureMutation.mutate({
        userId: user?.id || 0,
        projectId: Number(selectedProjectId),
        reason: 'Chưa đăng ký khuôn mặt',
        latitude: position.latitude,
        longitude: position.longitude
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
        longitude: position.longitude
      });
      return;
    }

    const isCheckingOut = !!todayRecord && !todayRecord.checkOutAt;

    if (isCheckingOut) {
      if (!window.confirm("Bạn có chắc chắn muốn Kết thúc ca làm việc (Check-out) không?")) {
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
      onError: (err: any) => {
        setActionError(err.response?.data?.message || 'Có lỗi xảy ra khi chấm công.');
      }
    };

    if (isCheckingOut) {
      checkOutMutation.mutate({
        userId,
        projectId: Number(selectedProjectId),
        data: { latitude: position.latitude, longitude: position.longitude },
        selfie: selfieFile
      }, options);
    } else {
      checkInMutation.mutate({
        userId,
        data: {
          projectId: Number(selectedProjectId),
          latitude: position.latitude,
          longitude: position.longitude
        },
        selfie: selfieFile
      }, options);
    }
  };

  const isCheckedIn = !!todayRecord && !todayRecord.checkOutAt;
  const isCompleted = !!todayRecord && !!todayRecord.checkOutAt;

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
    if (geoError?.includes('quyền truy cập') || permissionStatus === 'denied') {
      // Graceful block UX: Open modal with 'isDenied' instructing them to use URL bar lock icon
      setPermissionRequest({ isOpen: true, type: 'location' });
    } else if (!localStorage.getItem('location_granted') && permissionStatus !== 'granted') {
      setPermissionRequest({ isOpen: true, type: 'location' });
    } else {
      refetchGeo();
    }
  };
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)]">
        <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 block">Chọn dự án đang thi công</label>
        <select
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
          value={selectedProjectId}
          onChange={(e) => onProjectChange(Number(e.target.value))}
          disabled={isCheckedIn || isCompleted}
        >
          <option value="">-- Chọn dự án --</option>
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {isCompleted && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 flex items-center gap-3">
          <CheckCircleIcon className="size-6 shrink-0" />
          <p className="text-sm font-medium">Bạn đã hoàn thành ca làm việc hôm nay cho dự án này. Hẹn gặp lại vào ngày mai!</p>
        </div>
      )}

      {selectedProjectId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GPS Status Card */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              {isGeoLoading && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[var(--color-success)]/40 animate-ping opacity-75" />
                  <div className="absolute -inset-2 rounded-full bg-[var(--color-success)]/20 animate-pulse opacity-50" />
                </>
              )}
              <div className={`relative p-3 rounded-full ${geoError ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success)]'}`}>
                <MapPinIcon className={`size-8 ${isGeoLoading ? 'animate-bounce' : ''}`} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">Trạng thái định vị</p>
              {isGeoLoading ? (
                <div className="flex flex-col items-center space-y-1 mt-2">
                  <p className="text-sm text-[var(--color-success)] font-extrabold animate-pulse">Đang làm mới tọa độ...</p>
                  <p className="text-[10px] text-[var(--color-text-muted)] italic">Hệ thống đang dò sóng GPS mới nhất</p>
                </div>
              ) : geoError ? (
                <p className="text-sm text-[var(--color-danger)] font-medium mt-2">{geoError}</p>
              ) : (
                <div className="space-y-1 mt-2">
                  {selectedProjectObj ? (
                    isWithinGeofence === true ? (
                       <>
                         <p className="text-sm text-[var(--color-success)] font-bold">Hợp lệ (Trong vùng dự án)</p>
                         <p className="text-xs text-[var(--color-text-muted)]">Cách công trường: {distanceToProject?.toFixed(1)}m</p>
                       </>
                    ) : isWithinGeofence === false ? (
                       <>
                         <p className="text-sm text-[var(--color-danger)] font-bold">Không hợp lệ</p>
                         <p className="text-xs text-[var(--color-danger)] opacity-80">
                            Bạn đang cách tâm dự án {distanceToProject?.toFixed(1)}m<br/>(Bán kính cho phép: {selectedProjectObj.radiusMeters || 100}m)
                         </p>
                       </>
                    ) : (
                       <p className="text-xs text-yellow-600 font-bold">Dự án chưa cấu hình Tọa độ</p>
                    )
                  ) : (
                    <>
                      <p className="text-xs text-[var(--color-success)] font-medium font-bold">Đã bắt được tọa độ</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">Vui lòng chọn dự án bên trên.</p>
                    </>
                  )}
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-2 opacity-50">
                    Sẽ tự cập nhật nếu phát hiện di chuyển (-/+{position?.accuracy.toFixed(0)}m)
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleGeoRequest}
              className="text-xs text-[var(--color-primary)] hover:underline disabled:opacity-50"
              type="button"
              disabled={isGeoLoading}
            >
              Cập nhật vị trí
            </button>
          </div>

          {/* AI Scanner Status Card */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative size-24 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full overflow-hidden flex items-center justify-center shadow-inner">
              <CameraIcon className="size-10 animate-pulse" />
            </div>

            <div className="space-y-1 mt-2">
              <p className="font-semibold text-[var(--color-text-primary)]">Xác nhận khuôn mặt</p>
              <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed px-2">
                AI sẽ tự động bật Camera và quét Sinh trắc học khi bạn ấn nút Bắt đầu / Kết thúc ca làm.
              </p>
            </div>
          </div>
        </div>
      )}

      {selectedProjectId && (
        <div className="pt-4">
          {actionError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              ⚠️ {actionError}
            </div>
          )}
          <Button
            className="w-full h-14 text-lg font-bold shadow-lg"
            variant={isCheckedIn ? 'danger' : 'primary'}
            onClick={handleAction}
            isLoading={checkInMutation.isPending || checkOutMutation.isPending || isRecordLoading || logFailureMutation.isPending}
            disabled={!position || !!geoError || isCompleted}
          >
            {isCheckedIn ? (
              <>
                <ArrowRightStartOnRectangleIcon className="size-6 mr-2" />
                Kết thúc ca làm (CHECK-OUT)
              </>
            ) : isCompleted ? (
              <>
                <CheckCircleIcon className="size-6 mr-2" />
                Đã hoàn thành công việc
              </>
            ) : (
              <>
                <CheckCircleIcon className="size-6 mr-2" />
                Bắt đầu ca làm (CHECK-IN)
              </>
            )}
          </Button>

          {isCheckedIn && todayRecord && (
            <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
              Bạn đã bắt đầu ca làm lúc: <span className="font-bold text-[var(--color-text-primary)]">{new Date(todayRecord.checkInAt).toLocaleTimeString('vi-VN')}</span>
            </p>
          )}
        </div>
      )}

      <PermissionModal
        isOpen={permissionRequest.isOpen}
        type={permissionRequest.type}
        isDenied={permissionRequest.type === 'location' ? (geoError?.includes('quyền truy cập') || permissionStatus === 'denied') : false}
        onClose={() => setPermissionRequest({ ...permissionRequest, isOpen: false })}
        onPermissionResponse={handlePermissionResponse}
      />
      {showFaceVerifyModal && (
        <FaceVerificationModal
          projectId={Number(selectedProjectId)}
          onSuccess={proceedWithAction}
          onCancel={() => setShowFaceVerifyModal(false)}
        />
      )}
    </div>
  );
}
