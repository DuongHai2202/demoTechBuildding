import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { isAxiosError } from 'axios';
import { api } from '../../../services/axiosInstance';
import { useAuthStore } from '../../auth/stores/authStore';
import { useLogFailure } from '../api/attendanceApi';
import { loadFaceModels } from '../../../utils/faceModels';

interface FaceVerificationModalProps {
  projectId: number;
  location?: { latitude: number; longitude: number; accuracy: number };
  onSuccess: (file: File) => void;
  onCancel: () => void;
}

export function FaceVerificationModal({ projectId, location, onSuccess, onCancel }: FaceVerificationModalProps) {
  const user = useAuthStore((s) => s.user);
  const logFailureMutation = useLogFailure();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState('Đang khởi tạo AI (5-10s)...');
  const [matchStatus, setMatchStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [modelError, setModelError] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [descriptorLoading, setDescriptorLoading] = useState(true);
  const [descriptorError, setDescriptorError] = useState(false);
  const [descriptorErrorMessage, setDescriptorErrorMessage] = useState('Không thể tải dữ liệu sinh trắc học. Vui lòng thử lại.');
  const [savedDescriptorStr, setSavedDescriptorStr] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDescriptor = async () => {
      try {
        setDescriptorLoading(true);
        setDescriptorError(false);
        setDescriptorErrorMessage('Không thể tải dữ liệu sinh trắc học. Vui lòng thử lại.');
        const response = await api.get<{ data?: { registered?: boolean; descriptor?: string | null } }>('/users/me/face-descriptor');
        if (cancelled) return;
        const descriptor = response.data?.data?.descriptor;
        setSavedDescriptorStr(typeof descriptor === 'string' && descriptor.trim() ? descriptor : null);
      } catch (error) {
        console.error('Error loading face verification data:', error);
        if (!cancelled) {
          const statusCode = isAxiosError(error) ? error.response?.status : undefined;
          setDescriptorError(true);
          setDescriptorErrorMessage(
            statusCode === 401
              ? 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại rồi thử xác thực.'
              : statusCode === 403
                ? 'Tài khoản hiện không có quyền truy cập dữ liệu khuôn mặt. Vui lòng liên hệ quản trị viên.'
                : 'Không thể tải dữ liệu sinh trắc học. Kiểm tra kết nối rồi thử lại.'
          );
          setSavedDescriptorStr(null);
        }
      } finally {
        if (!cancelled) setDescriptorLoading(false);
      }
    };

    loadDescriptor();
    return () => {
      cancelled = true;
    };
  }, [loadAttempt]);

  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      try {
        setModelError(false);
        setStatus('Đang tải mô hình AI nội bộ...');
        await loadFaceModels();
        if (cancelled) return;
        setIsModelLoaded(true);
        setStatus('Đang quét khuôn mặt...');
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    const verifyFace = async () => {
      // Stop verifying if we already have a successful match
      if (matchStatus === 'success') return;
      
      if (descriptorLoading) {
        setStatus('Đang tải dữ liệu sinh trắc học của tài khoản...');
        return;
      }
      if (!isModelLoaded || !webcamRef.current || !webcamRef.current.video) return;
      if (descriptorError) {
        setStatus(descriptorErrorMessage);
        setMatchStatus('failed');
        return;
      }
      if (!savedDescriptorStr) {
        setStatus('Bạn chưa có dữ liệu sinh trắc học! Vui lòng liên hệ Admin.');
        setMatchStatus('failed');
        return;
      }
      
      const video = webcamRef.current.video;
      if (video.readyState !== 4) return;
      
      try {
        const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
                                       .withFaceLandmarks()
                                       .withFaceDescriptor();
                                       
        if (detection) {
          const savedArr = JSON.parse(savedDescriptorStr);
          if (
            !Array.isArray(savedArr) ||
            savedArr.length !== 128 ||
            savedArr.some((value) => typeof value !== 'number' || !Number.isFinite(value))
          ) {
            throw new Error('Saved face descriptor is invalid');
          }
          const savedFloat32 = new Float32Array(savedArr);
          const distance = faceapi.euclideanDistance(detection.descriptor, savedFloat32);
          
          if (distance < 0.45) { // Threshold: < 0.45 is typically a good strict match
             setMatchStatus('success');
             setStatus(`Khớp khuôn mặt (${((1 - distance)*100).toFixed(1)}%). Đang check-in...`);
             clearInterval(interval);
             
             // Auto capture proof selfie
             const canvas = document.createElement('canvas');
             canvas.width = video.videoWidth;
             canvas.height = video.videoHeight;
             const ctx = canvas.getContext('2d');
             if (ctx) {
               ctx.drawImage(video, 0, 0);
               canvas.toBlob((blob) => {
                 if (blob) {
                   const file = new File([blob], 'ai_selfie.jpg', { type: 'image/jpeg' });
                   setTimeout(() => {
                     onSuccess(file);
                   }, 1000);
                 }
               }, 'image/jpeg', 0.8);
             } else {
               // Fallback if canvas fails
               setTimeout(() => onSuccess(new File([""], "empty.jpg")), 1000);
             }
          } else {
             setMatchStatus('failed');
             setStatus(`Khuôn mặt người lạ (Độ lệch: ${distance.toFixed(2)}). Xin thử lại.`);
          }
        } else {
          setStatus('Không tìm thấy khuôn mặt rõ ràng tĩnh...');
        }
      } catch (error) {
         console.error('Face verification failed:', error);
         setMatchStatus('failed');
         setStatus('Dữ liệu khuôn mặt không hợp lệ hoặc không thể xác thực. Vui lòng đăng ký lại.');
      }
    };
    
    if (isModelLoaded && matchStatus === 'pending' && !descriptorLoading) {
       interval = setInterval(verifyFace, 1500); 
    }
    
    return () => clearInterval(interval);
  }, [descriptorError, descriptorErrorMessage, descriptorLoading, isModelLoaded, savedDescriptorStr, onSuccess, matchStatus]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[2px] p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface)] shadow-2xl overflow-hidden animate-slide-up">
        <div className={`p-4 text-center transition-colors ${matchStatus === 'success' ? 'bg-[var(--color-success)]' : matchStatus === 'failed' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'}`}>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Xác thực Sinh trắc học</h2>
        </div>
        
        <div className="p-6 pb-4">
          <div className={`relative mx-auto w-full aspect-square max-w-[250px] overflow-hidden rounded-full border-4 shadow-inner transition-colors duration-500
            ${matchStatus === 'success' ? 'border-[var(--color-success)]' : matchStatus === 'failed' ? 'border-[var(--color-danger)]' : 'border-[var(--color-primary)]'}
            bg-black/5`}>
            
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
                  setMatchStatus('failed');
                  setStatus('Không thể truy cập camera. Hãy cấp quyền camera cho trình duyệt rồi thử lại.');
                }}
                className={`absolute inset-0 h-full w-full object-cover transition-all ${matchStatus === 'success' ? 'brightness-110' : ''}`}
              />
            )}

            {/* Scanning Laser Overlay API */}
            {isModelLoaded && matchStatus === 'pending' && (
              <div className="absolute inset-0 z-10 pointer-events-none rounded-full overflow-hidden">
                 <div className="w-full h-1 bg-[var(--color-primary)] opacity-70 animate-scan-vertical shadow-[0_0_15px_3px_var(--color-primary)]"></div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center text-sm font-semibold min-h-[40px] px-2 text-[var(--color-text-primary)]">
             {status}
          </div>

          {(modelError || cameraError || descriptorError) && (
            <button
              type="button"
              onClick={() => {
                setCameraError(false);
                setDescriptorError(false);
                setMatchStatus('pending');
                setIsModelLoaded(false);
                setLoadAttempt((attempt) => attempt + 1);
              }}
              className="mx-auto mt-3 block text-sm font-semibold text-[var(--color-primary)] underline"
            >
              Thử tải lại
            </button>
          )}
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                if (matchStatus === 'failed') {
                  logFailureMutation.mutate({
                    userId: user?.id || 0,
                    projectId: projectId,
                    reason: `Xác thực khuôn mặt thất bại (${status})`,
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    accuracy: location?.accuracy,
                  });
                }
                onCancel();
              }} 
              className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors underline"
            >
              Hủy xác thực
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
