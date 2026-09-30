import { MapPinIcon, CameraIcon, XMarkIcon, Cog6ToothIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/Button';

export interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'location' | 'camera';
  onPermissionResponse: (response: 'allow' | 'allow_once' | 'deny') => void;
  onRetry?: () => void;
  isDenied?: boolean;
}

export function PermissionModal({ isOpen, onClose, type, onPermissionResponse, onRetry, isDenied }: PermissionModalProps) {
  if (!isOpen) return null;

  const isLocation = type === 'location';
  const Icon = isLocation ? MapPinIcon : CameraIcon;
  const title = isDenied ? `Quyền ${isLocation ? 'vị trí' : 'camera'} đang bị chặn` : (isLocation ? 'Yêu cầu truy cập vị trí' : 'Yêu cầu truy cập camera');
  const description = isDenied
    ? `Trình duyệt đã chặn quyền ${isLocation ? 'vị trí' : 'camera'} của trang này. Website không thể tự mở lại quyền bị chặn; bạn cần đổi quyền trong thanh địa chỉ rồi bấm kiểm tra lại.`
    : (isLocation
      ? 'Chúng tôi cần vị trí của bạn để xác nhận bạn đang có mặt tại khu vực công trường.'
      : 'Chụp ảnh selfie giúp minh chứng sự hiện diện của bạn tại công trường.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--color-surface)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="relative p-6 text-center">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-[var(--color-surface-alt)] text-[var(--color-text-muted)] transition-colors"
          >
            <XMarkIcon className="size-5" />
          </button>

          <div className="mx-auto size-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Icon className="size-8 text-[var(--color-primary)]" />
          </div>

          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{title}</h3>
          <p className="text-[var(--color-text-muted)] text-sm mb-5 leading-relaxed">
            {description}
          </p>

          {isDenied && isLocation && (
            <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4 text-left">
              <p className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)]">
                <Cog6ToothIcon className="size-5 text-[var(--color-primary)]" />
                Cách bật lại vị trí
              </p>
              <ol className="mt-3 space-y-3 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                <li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">1</span><span>Bấm biểu tượng <strong>khóa / thông tin</strong> ở bên trái địa chỉ trang.</span></li>
                <li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">2</span><span>Mở mục <strong>Vị trí</strong> và chọn <strong>Cho phép</strong>.</span></li>
                <li className="flex gap-3"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">3</span><span>Đóng popup này, sau đó bấm <strong>Kiểm tra lại</strong> hoặc tải lại trang.</span></li>
              </ol>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isDenied ? (
              <>
                <Button
                  variant="primary"
                  className="w-full py-3 font-semibold"
                  onClick={onRetry || onClose}
                >
                  <ArrowPathIcon className="mr-2 size-4" />
                  Kiểm tra lại quyền
                </Button>
                <Button
                  variant="secondary"
                  className="w-full py-3 font-semibold"
                  onClick={onClose}
                >
                  Đã hiểu
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="primary" 
                  className="w-full py-3 font-semibold"
                  onClick={() => onPermissionResponse('allow')}
                >
                  Cho phép
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full py-3 font-semibold"
                  onClick={() => onPermissionResponse('allow_once')}
                >
                  Cho phép chỉ lần này
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full py-3 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onPermissionResponse('deny')}
                >
                  Từ chối
                </Button>
              </>
            )}
          </div>

          <p className="mt-6 text-[10px] text-[var(--color-text-muted)] italic">
            Quyền truy cập là bắt buộc để thực hiện chức năng chấm công theo quy định.
          </p>
        </div>
      </div>
    </div>
  );
}
