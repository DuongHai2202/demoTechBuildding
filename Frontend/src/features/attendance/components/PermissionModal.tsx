import { MapPinIcon, CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/ui/Button';

export interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'location' | 'camera';
  onPermissionResponse: (response: 'allow' | 'allow_once' | 'deny') => void;
  isDenied?: boolean;
}

export function PermissionModal({ isOpen, onClose, type, onPermissionResponse, isDenied }: PermissionModalProps) {
  if (!isOpen) return null;

  const isLocation = type === 'location';
  const Icon = isLocation ? MapPinIcon : CameraIcon;
  const title = isDenied ? 'Quyền bị chặn' : (isLocation ? 'Yêu cầu truy cập Vị trí' : 'Yêu cầu truy cập Camera');
  const description = isDenied 
    ? `Bạn đã từ chối quyền truy cập ${isLocation ? 'vị trí' : 'camera'} trước đây. Vui lòng bấm vào biểu tượng Ổ khóa (🔒) trên thanh địa chỉ trình duyệt và chọn "Cho phép". Hệ thống sẽ tự động nhận diện khi bạn thao tác xong!`
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
          <p className="text-[var(--color-text-muted)] text-sm mb-8 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-col gap-3">
            {isDenied ? (
              <Button 
                variant="primary" 
                className="w-full py-3 font-semibold"
                onClick={onClose}
              >
                Đã hiểu
              </Button>
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
