import { useEffect, useState, type ImgHTMLAttributes } from 'react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/axiosInstance';

interface AuthenticatedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  fileUrl?: string;
  fallbackLabel?: string;
}

/**
 * Loads a stored image through the authenticated API instead of placing the
 * MinIO URL directly in an <img>. This works both locally and after deployment
 * where a stored localhost URL is not reachable from the user's browser.
 */
export function AuthenticatedImage({
  fileUrl,
  alt = 'Ảnh đã lưu',
  className = '',
  fallbackLabel = 'Ảnh không tải được',
  onClick,
  ...imgProps
}: AuthenticatedImageProps) {
  const [objectUrl, setObjectUrl] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    let generatedUrl: string | undefined;

    setObjectUrl(undefined);
    setFailed(false);

    if (!fileUrl) {
      setFailed(true);
      return () => undefined;
    }

    if (fileUrl.startsWith('blob:') || fileUrl.startsWith('data:')) {
      setObjectUrl(fileUrl);
      return () => undefined;
    }

    api.get('/files/preview', {
      params: { url: fileUrl },
      responseType: 'blob',
    })
      .then((response) => {
        if (!active) return;

        const contentType = String(response.headers['content-type'] || '');
        if (!contentType.startsWith('image/') || !response.data?.size) {
          throw new Error('Stored response is not a valid image');
        }

        generatedUrl = URL.createObjectURL(response.data);
        setObjectUrl(generatedUrl);
      })
      .catch((error) => {
        if (!active) return;
        console.debug('Unable to load stored image preview', {
          status: error?.response?.status,
        });
        setFailed(true);
      });

    return () => {
      active = false;
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [fileUrl]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel}
        className={`flex h-full min-h-20 w-full flex-col items-center justify-center gap-1 bg-slate-50 px-2 text-center text-[10px] text-slate-400 dark:bg-slate-800/60 dark:text-slate-500 ${className}`}
      >
        <PhotoIcon className="h-5 w-5" />
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  if (!objectUrl) {
    return (
      <div
        aria-label="Đang tải ảnh"
        className={`flex h-full min-h-20 w-full items-center justify-center bg-slate-100/80 dark:bg-slate-800/60 ${className}`}
      >
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <img
      {...imgProps}
      src={objectUrl}
      alt={alt}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          window.open(objectUrl, '_blank', 'noopener,noreferrer');
        }
      }}
    />
  );
}
