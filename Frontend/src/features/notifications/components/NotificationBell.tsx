import { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../api/notificationApi';
import { useAuthStore } from '../../auth/stores/authStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useNavigate } from 'react-router-dom';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: notifications = [] } = useNotifications(user?.id || 0);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (id: number, targetUrl: string | null) => {
    markAsRead.mutate(id);
    setIsOpen(false);
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'text-green-500 bg-green-50';
      case 'DANGER': return 'text-red-500 bg-red-50';
      case 'WARNING': return 'text-yellow-500 bg-yellow-50';
      default: return 'text-blue-500 bg-blue-50';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)] transition-colors"
      >
        <BellIcon className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--color-bg)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-[480px] flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 bg-[var(--color-surface-alt)]">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate(user?.id || 0)}
                className="text-[11px] font-medium text-[var(--color-primary)] hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <BellIcon className="size-10 text-[var(--color-text-muted)] opacity-20 mb-2" />
                <p className="text-xs text-[var(--color-text-muted)]">Chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id, n.targetUrl)}
                    className={`group relative flex gap-3 p-4 transition-colors cursor-pointer hover:bg-[var(--color-surface-alt)] ${
                      !n.isRead ? 'bg-[var(--color-primary-light)]/30' : ''
                    }`}
                  >
                    <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${getIconColor(n.type)}`}>
                      <BellIcon className="size-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight truncate ${!n.isRead ? 'font-bold text-[var(--color-text-primary)]' : 'font-medium text-[var(--color-text-muted)]'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="size-2 shrink-0 rounded-full bg-[var(--color-primary)] mt-1.5" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)] line-clamp-2">
                        {n.message}
                      </p>
                      <p className="mt-2 text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                        {dayjs(n.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="border-t border-[var(--color-border)] p-2 bg-[var(--color-surface-alt)] text-center">
              <button className="text-[11px] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
