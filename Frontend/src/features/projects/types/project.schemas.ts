import { z } from 'zod';
import type { ProjectStatus } from './project.types';
import { isValidDateValue, optionalCode, optionalDate, requiredDate, requiredNumber, requiredText } from '../../../utils/validation';

const statusValues: [ProjectStatus, ...ProjectStatus[]] = [
  'PLANNING',
  'IN_PROGRESS',
  'COMPLETED',
  'SUSPENDED'
];

export const projectSchema = z.object({
  name: requiredText('Tên dự án phải có ít nhất 3 ký tự', 3),
  projectCode: optionalCode(),
  description: z.string().trim().optional(),
  address: requiredText('Địa chỉ phải cụ thể hơn', 5),
  latitude: requiredNumber('Vĩ độ không hợp lệ', -90, 90),
  longitude: requiredNumber('Kinh độ không hợp lệ', -180, 180),
  radiusMeters: requiredNumber('Bán kính phải từ 10 đến 5000 mét', 10, 5000),
  startDate: requiredDate().refine(isValidDateValue, 'Ngày bắt đầu không hợp lệ'),
  endDate: optionalDate(),
  status: z.enum(statusValues),
}).superRefine((data, context) => {
  if (data.endDate && data.endDate < data.startDate) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu' });
  }
});

export type ProjectFormData = z.infer<typeof projectSchema>;
