import { useState, useEffect } from 'react';
import { CameraIcon, MapPinIcon, CheckCircleIcon, ArrowRightStartOnRectangleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
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
  
  // Daily Reset Logic: Force refresh check-in status when day changes
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Check every minute if the day has changed
    const interval = setInterval(() => {
      const liveDate = new Date().toISOString().split('T')[0];
      if (liveDate !== currentDate) {
        setCurrentDate(liveDate);
      }
    }, 60000); 
    return () => clearInterval(interval);
  }, [currentDate]);

  const { position, error: geoError, isLoading: isGeoLoading, refetch: refetchGeo, permissionStatus } = useGeolocation();
  const { data: todayRecord, isLoading: isRecordLoading } = useTodayRecord(user?.id || 0, Number(selectedProjectId) || 0, currentDate);

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
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card-theme)] group hover:border-[var(--color-primary)] transition-all">
        <label className="text-[10px] font-black text-[var(--color-text-disabled)] uppercase tracking-widest mb-3 block px-1">Chọn dự án đang thi công</label>
        <select
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm font-bold text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-primary-500/20 transition-all hover:border-[var(--color-primary-light)]"
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
                    isWithinGeofence === true ? (
                       <div className="space-y-1">
                         <p className="text-sm text-[var(--color-success)] font-black uppercase tracking-tight">Hợp lệ (Trong vùng dự án)</p>
                         <p className="text-[11px] font-bold text-[var(--color-text-muted)] bg-[var(--color-surface-alt)] px-3 py-1 rounded-full inline-block">Cách tâm: {distanceToProject?.toFixed(1)}m</p>
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
                    ) : (
                       <p className="text-xs text-orange-600 font-black uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">Dự án chưa cấu hình Tọa độ</p>
                    )
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
              Cập nhật vị trí
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
                  Hệ thống AI sẽ quét khuôn mặt để đảm bảo chính chủ.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                   <span className="px-2 py-0.5 rounded bg-[var(--color-surface-alt)] text-[9px] font-black text-[var(--color-text-disabled)] uppercase tracking-tighter">Bảo mật</span>
                   <span className="px-2 py-0.5 rounded bg-[var(--color-surface-alt)] text-[9px] font-black text-[var(--color-text-disabled)] uppercase tracking-tighter">AI Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedProjectId && (
        <div className="pt-6">
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
            disabled={!position || !!geoError || isCompleted}
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
