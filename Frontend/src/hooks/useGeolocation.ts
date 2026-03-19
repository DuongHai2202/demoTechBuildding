import { useCallback, useEffect, useState } from 'react';

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  isLoading: boolean;
  permissionStatus: PermissionState | null;
  refetch: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
    setError(null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMsg = 'Lỗi định vị không xác định.';
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        errorMsg = 'Bạn cần cấp quyền truy cập vị trí để chấm công. Nếu đã lỡ từ chối, hãy bật lại ở thanh địa chỉ hoặc cài đặt trình duyệt.';
        break;
      case 2: // POSITION_UNAVAILABLE
        errorMsg = 'Thông tin vị trí không khả dụng. Kiểm tra GPS của bạn.';
        break;
      case 3: // TIMEOUT
        errorMsg = 'Yêu cầu lấy vị trí hết thời gian chờ.';
        break;
      default:
        errorMsg = err.message;
    }
    setError(errorMsg);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ Geolocation');
      setIsLoading(false);
      return;
    }

    const initPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        result.onchange = () => {
          setPermissionStatus(result.state);
        };
      } catch (e) {
        setPermissionStatus('prompt');
      }
    };
    initPermission();
  }, []);

  useEffect(() => {
    if (!permissionStatus) return;

    if (permissionStatus === 'granted') {
      setError(null);
      setIsLoading(true);
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setIsLoading(false);
      if (permissionStatus === 'denied') {
        setError('Quyền truy cập vị trí bị chặn.');
      } else {
        setError('Cầu cấp quyền vị trí.');
      }
    }
  }, [permissionStatus, handleSuccess, handleError]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [handleSuccess, handleError]);

  return { position, error, isLoading, permissionStatus, refetch };
}
