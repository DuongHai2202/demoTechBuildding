import { useEffect, useMemo, useRef, useState } from 'react';
import { BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useNotifications, useMarkAllAsRead, useMarkAsRead } from '../api/notificationApi';
import { useAuthStore } from '../../auth/stores/authStore';
import {
  getNotificationDestination,
  NotificationItem,
} from './NotificationItem';

type NotificationFilter = 'all' | 'unread';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const user = useAuthStore((state) => state.user);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const knownNotificationIdsRef = useRef<Set<number> | null>(null);
  const notificationOwnerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useNotifications(Boolean(user?.id));
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  useEffect(() => {
    if (notificationOwnerRef.current !== (user?.id ?? null)) {
      notificationOwnerRef.current = user?.id ?? null;
      knownNotificationIdsRef.current = null;
    }

    if (!user?.id) {
      return;
    }

    // The query starts with an empty fallback while the first response is in
    // flight. Wait until that response arrives so old notifications are not
    // shown as new toast messages after login.
    if (isLoading) return;

    const currentIds = new Set(notifications.map((notification) => notification.id));
    // Do not toast historical notifications on the first load after login.
    if (knownNotificationIdsRef.current === null) {
      knownNotificationIdsRef.current = currentIds;
      return;
    }

    notifications
      .filter((notification) => !notification.isRead && !knownNotificationIdsRef.current?.has(notification.id))
      .slice(0, 3)
      .forEach((notification) => {
        toast.info(notification.title, {
          description: notification.message,
          duration: 7_000,
          action: notification.targetUrl
            ? {
                label: 'Mở',
                onClick: () => navigate(getNotificationDestination(notification.targetUrl)),
              }
            : undefined,
        });
      });

    knownNotificationIdsRef.current = currentIds;
  }, [isLoading, navigate, notifications, user?.id]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const visibleNotifications = useMemo(
    () => notifications
      .filter((notification) => filter === 'all' || !notification.isRead)
      .slice(0, 6),
    [filter, notifications],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleNotificationClick = (notification: (typeof notifications)[number]) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id, {
        onError: () => toast.error('Không thể cập nhật trạng thái thông báo.'),
      });
    }
    setIsOpen(false);
    navigate(getNotificationDestination(notification.targetUrl));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu tất cả là đã đọc.'),
      onError: () => toast.error('Không thể cập nhật thông báo. Vui lòng thử lại.'),
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative rounded-xl p-2 text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-alt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <BellIcon className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-[var(--color-bg)]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 flex max-h-[min(620px,calc(100vh-96px))] w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
          role="dialog"
          aria-label="Trung tâm thông báo"
        >
          <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[var(--color-text-primary)]">Thông báo</h3>
                <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã xem hết thông báo'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0 || markAllAsRead.isPending}
                className="rounded-lg px-2 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {markAllAsRead.isPending ? 'Đang cập nhật…' : 'Đánh dấu đã đọc'}
              </button>
            </div>

            <div className="mt-3 flex gap-1 rounded-lg bg-[var(--color-bg)] p-1" role="tablist" aria-label="Bộ lọc thông báo">
              {(['all', 'unread'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={filter === option}
                  onClick={() => setFilter(option)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    filter === option
                      ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {option === 'all' ? 'Tất cả' : 'Chưa đọc'}
                  {option === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-32 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3 p-4" aria-label="Đang tải thông báo">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex animate-pulse gap-3">
                    <span className="size-10 shrink-0 rounded-xl bg-[var(--color-surface-alt)]" />
                    <span className="flex-1 space-y-2 pt-1">
                      <span className="block h-3 w-3/4 rounded bg-[var(--color-surface-alt)]" />
                      <span className="block h-3 w-full rounded bg-[var(--color-surface-alt)]" />
                      <span className="block h-3 w-1/3 rounded bg-[var(--color-surface-alt)]" />
                    </span>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Không tải được thông báo</p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Kiểm tra kết nối rồi thử lại.</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-alt)]"
                >
                  <ArrowPathIcon className="size-4" aria-hidden="true" />
                  Thử lại
                </button>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                <BellIcon className="size-10 text-[var(--color-text-muted)] opacity-25" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-[var(--color-text-secondary)]">
                  {filter === 'unread' ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Thông báo mới sẽ xuất hiện tại đây.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {visibleNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-2.5">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] disabled:opacity-50"
            >
              <ArrowPathIcon className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
              Làm mới
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/notifications');
              }}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
