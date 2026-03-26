import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { api } from '../../../services/axiosInstance';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../../../components/ui/Button';

export function FaceRegistrationModal({ onComplete }: { onComplete: () => void }) {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState('Đang khởi tạo AI (5-10s)...');
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Use jsdelivr CDN to avoid CORS/MIME issues with straight Github Raw
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        setIsModelLoaded(true);
        setStatus('Sẵn sàng. Vui lòng đưa rõ khuôn mặt vào giữa khung hình.');
      } catch (e) {
        console.error('Error loading AI models:', e);
        setStatus('Lỗi tải dữ liệu AI. Vui lòng kiểm tra mạng.');
      }
    };
    loadModels();
  }, []);

  const detectFace = async () => {
    if (!webcamRef.current || !webcamRef.current.video) return;

    try {
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
    setIsScanning(true);
    try {
      const descriptorArray = Array.from(faceDescriptor);
      await api.post('/users/me/face-descriptor', {
        faceDescriptor: JSON.stringify(descriptorArray) // Pass as JSON string to endpoint
      });
      const profileRes = await api.get('/auth/my-profile');
      useAuthStore.getState().setUser(profileRes.data.data);
      setStatus('Ghi nhận thành công!');
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.response?.data?.message || 'Lưu thất bại. Thử lại sau.';
      setStatus(errorMsg);
      setIsScanning(false);
    }
  };

  const resetCapture = () => {
    setFaceDescriptor(null);
    setStatus('Vui lòng đưa khuôn mặt vào giữa khung hình...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] shadow-2xl overflow-hidden animate-slide-up">
        <div className="bg-[var(--color-primary)] p-4 text-center">
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
          
          <div className="mt-6 text-center text-sm font-medium text-[var(--color-text-secondary)] min-h-[40px]">
             {status}
          </div>
          
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
            {!isScanning && !faceDescriptor && (
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
