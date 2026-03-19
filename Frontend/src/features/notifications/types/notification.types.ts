export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'DANGER';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  targetUrl: string | null;
  createdAt: string;
}
