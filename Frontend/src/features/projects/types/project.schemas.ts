import { z } from 'zod';
import type { ProjectStatus } from './project.types';

const statusValues: [ProjectStatus, ...ProjectStatus[]] = [
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
  'SUSPENDED'
];

export const projectSchema = z.object({
  name: z.string().min(3, 'Tên dự án phải có ít nhất 3 ký tự'),
  projectCode: z.string().optional().or(z.literal('')),
  description: z.string().optional(),
  address: z.string().min(5, 'Địa chỉ phải cụ thể hơn'),
  latitude: z.number(),
  longitude: z.number(),
  radiusMeters: z.number().min(10, 'Bán kính tối thiểu 10m').default(100),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().optional().or(z.literal('')),
  status: z.enum(statusValues).default('PLANNING'),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
