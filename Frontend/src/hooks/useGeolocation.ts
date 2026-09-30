import { useCallback, useEffect, useState } from 'react';

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  errorCode: number | null;
  isLoading: boolean;
  permissionStatus: PermissionState | null;
  isSupported: boolean;
  refetch: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
    setError(null);
    setErrorCode(null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    setErrorCode(err.code);
    let errorMsg = 'Lỗi định vị không xác định.';
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        errorMsg = 'Quyền vị trí đang bị chặn. Hãy bật lại quyền cho trang này rồi bấm cập nhật vị trí.';
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
      setErrorCode(null);
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
        return () => {
          result.onchange = null;
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
        setError('Quyền vị trí đang bị chặn. Mở cài đặt quyền của trình duyệt để cho phép trang này.');
        setErrorCode(1);
      } else {
        setError(null);
        setErrorCode(null);
      }
    }
  }, [permissionStatus, handleSuccess, handleError]);

  const refetch = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị.');
      setErrorCode(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, [handleSuccess, handleError]);

  return { position, error, errorCode, isLoading, permissionStatus, isSupported, refetch };
}
