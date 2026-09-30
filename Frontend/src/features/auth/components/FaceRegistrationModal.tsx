import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { api } from '../../../services/axiosInstance';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../../../components/ui/Button';
import { loadFaceModels } from '../../../utils/faceModels';
import type { ApiResponse } from '../../../types/api.types';
import type { User } from '../../users/types/user.types';
import { getApiErrorMessage } from '../../../services/apiError';

export function FaceRegistrationModal({ onComplete }: { onComplete: () => void }) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState('Đang khởi tạo AI (5-10s)...');
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [modelError, setModelError] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onComplete();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      try {
        setModelError(false);
        setStatus('Đang tải mô hình AI nội bộ...');
        await loadFaceModels();
        if (cancelled) return;
        setIsModelLoaded(true);
        setStatus('Sẵn sàng. Vui lòng đưa rõ khuôn mặt vào giữa khung hình.');
      } catch (e) {
        console.error('Error loading AI models:', e);
        if (!cancelled) {
          setModelError(true);
          setStatus('Không tải được mô hình nhận diện nội bộ. Vui lòng thử lại.');
        }
      }
    };
    loadModels();

    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  const detectFace = async () => {
    if (!webcamRef.current || !webcamRef.current.video) return;

    try {
      setSaveError(null);
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;

      setIsScanning(true);
      setStatus('Đang phân tích khuôn mặt...');
      
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                     .withFaceLandmarks()
                                     .withFaceDescriptor();

      if (detection) {
        setFaceDescriptor(detection.descriptor);
        setStatus('Đã khoanh vùng xong! Bạn có muốn lưu khuôn mặt này?');
      } else {
        setStatus('Không tìm thấy khuôn mặt tĩnh. Xin hãy đứng yên tại vùng sáng.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Lỗi xử lý camera.');
    } finally {
      setIsScanning(false);
    }
  };

  const saveFace = async () => {
    if (!faceDescriptor) return;
    setStatus('Đang lưu mã hóa sinh trắc học...');
    setSaveError(null);
    setIsScanning(true);
    try {
      const descriptorArray = Array.from(faceDescriptor);
      const saveResponse = await api.post<ApiResponse<User>>('/users/me/face-descriptor', {
        faceDescriptor: JSON.stringify(descriptorArray) // Pass as JSON string to endpoint
      });

      // The save endpoint already returns the freshly mapped account. Use it
      // immediately so the attendance/settings UI does not keep showing the
      // stale persisted user object. Fall back to a profile refresh for older
      // backend builds that do not expose hasFaceRegistered on the save result.
      let savedUser = saveResponse.data.data;
      if (!savedUser?.hasFaceRegistered) {
        const profileRes = await api.get<ApiResponse<User>>('/auth/my-profile');
        savedUser = profileRes.data.data;
      }
      if (!savedUser?.hasFaceRegistered) {
        throw new Error('Máy chủ chưa xác nhận dữ liệu khuôn mặt đã được lưu. Vui lòng thử lại.');
      }

      useAuthStore.getState().setUser(savedUser);
      setStatus('Ghi nhận thành công!');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (e: unknown) {
      const errorMsg = getApiErrorMessage(e, 'Lưu khuôn mặt thất bại. Vui lòng thử lại sau.');
      setSaveError(errorMsg);
      // A descriptor that failed to persist must not remain in the captured
      // state, otherwise the user sees a green check and assumes registration
      // completed even though the account is still unregistered.
      setFaceDescriptor(null);
      setStatus(errorMsg);
      setIsScanning(false);
    }
  };

  const resetCapture = () => {
    setFaceDescriptor(null);
    setStatus('Vui lòng đưa khuôn mặt vào giữa khung hình...');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onComplete();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[var(--color-surface)] shadow-2xl animate-slide-up">
        <div className="relative bg-[var(--color-primary)] p-4 text-center">
          <button
            type="button"
            onClick={onComplete}
            className="absolute right-3 top-3 rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/80"
            aria-label="Đóng đăng ký khuôn mặt"
            title="Đóng"
          >
            <XMarkIcon className="size-5" aria-hidden="true" />
          </button>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">Đăng ký khuôn mặt</h2>
          <p className="text-white/80 text-sm mt-1">Hệ thống sẽ dùng mã hóa này để chấm công</p>
        </div>
        
        <div className="p-6">
          <div className="relative mx-auto w-full aspect-square max-w-[300px] overflow-hidden rounded-full border-4 border-[var(--color-primary)] bg-black/5 shadow-inner">
            {!isModelLoaded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-[var(--color-primary)] border-r-transparent"></div>
              </div>
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                onUserMedia={() => setCameraError(false)}
                onUserMediaError={(error) => {
                  console.error('Camera error:', error);
                  setCameraError(true);
                  setStatus('Không thể truy cập camera. Hãy cấp quyền camera cho trình duyệt rồi thử lại.');
                }}
                className={`absolute inset-0 h-full w-full object-cover transition-all ${faceDescriptor ? 'grayscale brightness-75 blur-sm' : ''}`}
              />
            )}
            
            {/* Guide Grid */}
            {!faceDescriptor && isModelLoaded && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-4/5 w-3/5 rounded-full border-2 border-dashed border-white/50 animate-pulse"></div>
              </div>
            )}
            
            {/* Captured Marker */}
            {faceDescriptor && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <svg className="h-20 w-20 text-[var(--color-success)] fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className={`mt-6 min-h-[40px] text-center text-sm font-medium ${saveError ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
             {status}
          </div>

          {saveError && (
            <div
              role="alert"
              className="mt-3 rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger-bg)] px-3 py-2 text-center text-xs font-semibold leading-relaxed text-[var(--color-danger)]"
            >
              Khuôn mặt chưa được đăng ký. Vui lòng chụp lại bằng khuôn mặt đúng tài khoản.
            </div>
          )}

          {(modelError || cameraError) && (
            <button
              type="button"
              onClick={() => {
                setCameraError(false);
                setIsModelLoaded(false);
                setLoadAttempt((attempt) => attempt + 1);
              }}
              className="mx-auto mt-3 block text-sm font-semibold text-[var(--color-primary)] underline"
            >
              Thử tải lại
            </button>
          )}
          
          <div className="mt-6 flex flex-col gap-3">
            {!faceDescriptor ? (
               <Button onClick={detectFace} disabled={!isModelLoaded || isScanning} fullWidth>
                 {isScanning ? 'Đang phân tích...' : 'Quét khuôn mặt'}
               </Button>
            ) : (
              <>
                <Button onClick={saveFace} disabled={isScanning} fullWidth className="bg-[var(--color-success)] hover:bg-[var(--color-success-dark)]">
                  {isScanning ? 'Đang lưu trữ...' : 'Lưu Khuôn Mặt'}
                </Button>
                <button onClick={resetCapture} disabled={isScanning} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors underline font-semibold">
                  Chụp lại
                </button>
              </>
            )}
            {!isScanning && !faceDescriptor && !modelError && !cameraError && (
              <button onClick={onComplete} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors mt-2">
                Bỏ qua bước này
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
