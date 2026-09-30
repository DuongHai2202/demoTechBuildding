import { useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  BellAlertIcon,
  CheckIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '../features/notifications/api/notificationApi';
import {
  getNotificationDestination,
  NotificationItem,
} from '../features/notifications/components/NotificationItem';
import type { Notification } from '../features/notifications/types/notification.types';
import { useAuthStore } from '../features/auth/stores/authStore';
import { Pagination } from '../components/ui/Pagination';

const PAGE_SIZE = 10;

type NotificationFilter = 'all' | 'unread';

export default function NotificationsPage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [page, setPage] = useState(1);

  const {
    data: notifications = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useNotifications(Boolean(user?.id));
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => filter === 'all' || !notification.isRead),
    [filter, notifications],
  );

  useEffect(() => {
    setPage(1);
  }, [filter, notifications]);

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedNotifications = filteredNotifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id, {
        onError: () => toast.error('Không thể cập nhật trạng thái thông báo.'),
      });
    }
    navigate(getNotificationDestination(notification.targetUrl));
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () => toast.success('Đã đánh dấu tất cả thông báo là đã đọc.'),
      onError: () => toast.error('Không thể cập nhật thông báo. Vui lòng thử lại.'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-primary)]">Trung tâm làm việc</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Thông báo</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            Theo dõi các cập nhật, yêu cầu phê duyệt và việc cần xử lý trong hệ thống.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-alt)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowPathIcon className={`size-4 ${isFetching ? 'animate-spin' : ''}`} aria-hidden="true" />
            Làm mới
          </button>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markAllAsRead.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckIcon className="size-4" aria-hidden="true" />
            {markAllAsRead.isPending ? 'Đang cập nhật…' : 'Đánh dấu đã đọc'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
            <InboxIcon className="size-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-2xl font-bold text-[var(--color-text-primary)]">{notifications.length}</span>
            <span className="block text-sm text-[var(--color-text-muted)]">Tổng thông báo</span>
          </span>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <BellAlertIcon className="size-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-2xl font-bold text-[var(--color-text-primary)]">{unreadCount}</span>
            <span className="block text-sm text-[var(--color-text-muted)]">Chưa đọc</span>
          </span>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckIcon className="size-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-2xl font-bold text-[var(--color-text-primary)]">{notifications.length - unreadCount}</span>
            <span className="block text-sm text-[var(--color-text-muted)]">Đã đọc</span>
          </span>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">Danh sách thông báo</h2>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
              Bấm vào một dòng để mở phần việc liên quan.
            </p>
          </div>
          <div className="flex gap-1 rounded-xl bg-[var(--color-bg)] p-1" role="tablist" aria-label="Bộ lọc thông báo">
            {(['all', 'unread'] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={filter === option}
                onClick={() => setFilter(option)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                  filter === option
                    ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {option === 'all' ? 'Tất cả' : `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4 p-6" aria-label="Đang tải thông báo">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex animate-pulse gap-3">
                <span className="size-11 shrink-0 rounded-xl bg-[var(--color-surface-alt)]" />
                <span className="flex-1 space-y-2 pt-1">
                  <span className="block h-4 w-1/3 rounded bg-[var(--color-surface-alt)]" />
                  <span className="block h-3 w-4/5 rounded bg-[var(--color-surface-alt)]" />
                  <span className="block h-3 w-1/5 rounded bg-[var(--color-surface-alt)]" />
                </span>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <BellAlertIcon className="size-12 text-red-500/70" aria-hidden="true" />
            <h3 className="mt-4 text-base font-bold text-[var(--color-text-primary)]">Không tải được thông báo</h3>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">
              Phiên đăng nhập hoặc kết nối API có thể đã hết hạn. Hãy thử tải lại dữ liệu.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-surface-alt)]"
            >
              <ArrowPathIcon className="size-4" aria-hidden="true" />
              Thử lại
            </button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <InboxIcon className="size-12 text-[var(--color-text-muted)] opacity-30" aria-hidden="true" />
            <h3 className="mt-4 text-base font-bold text-[var(--color-text-primary)]">
              {filter === 'unread' ? 'Không còn thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">
              {filter === 'unread' ? 'Bạn đã xử lý hết các thông báo cần chú ý.' : 'Các cập nhật mới sẽ được hiển thị tại đây.'}
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-[var(--color-border)]">
              {paginatedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
            <Pagination
              page={currentPage}
              pageSize={PAGE_SIZE}
              total={filteredNotifications.length}
              onPageChange={setPage}
              itemLabel="thông báo"
              ariaLabel="Phân trang thông báo"
            />
          </>
        )}
      </section>
    </div>
  );
}
