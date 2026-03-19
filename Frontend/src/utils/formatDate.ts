import dayjs from 'dayjs';

export function formatDate(date: string | Date, format = 'DD/MM/YYYY'): string {
  return dayjs(date).format(format);
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function formatRelative(date: string | Date): string {
  const now = dayjs();
  const target = dayjs(date);
  const diffDays = now.diff(target, 'day');

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return target.format('DD/MM/YYYY');
}
