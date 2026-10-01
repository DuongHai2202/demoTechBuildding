import { z } from 'zod';

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{1,49}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_PATTERN = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export const requiredText = (message: string, min = 1) =>
  z.string().trim().min(min, message);

export const optionalText = () => z.string().trim().optional();

export const optionalCode = () => optionalText().refine(
  (value) => value === undefined || value === '' || CODE_PATTERN.test(value),
  'Mã chỉ gồm chữ cái, số và các ký tự - . / _ (tối đa 50 ký tự)'
);

export const requiredDate = (message = 'Vui lòng chọn ngày') =>
  z.string().regex(DATE_PATTERN, message);

export const optionalDate = () => z.string().trim().optional().refine(
  (value) => !value || (DATE_PATTERN.test(value) && isValidDateValue(value)),
  'Ngày không đúng định dạng YYYY-MM-DD'
);

export const optionalPhone = () => optionalText().refine(
  (value) => value === undefined || value === '' || PHONE_PATTERN.test(value.replace(/\s+/g, '')),
  'Số điện thoại phải có 10 số, ví dụ 0901234567 hoặc +84901234567'
);

export const requiredNumber = (message: string, min?: number, max?: number) => {
  let schema = z.number({ error: message }).finite(message);
  if (min !== undefined) schema = schema.min(min, message);
  if (max !== undefined) schema = schema.max(max, message);
  return schema;
};

export const optionalNumber = (message: string, min?: number, max?: number) =>
  z.preprocess(
    (value) => value === '' || value === null || value === undefined ? undefined : Number(value),
    z.number().finite(message).min(min ?? Number.NEGATIVE_INFINITY, message).max(max ?? Number.POSITIVE_INFINITY, message).optional()
  );

export const isValidDateValue = (value: string | undefined) => {
  if (!value || !DATE_PATTERN.test(value)) return false;

  // Validate calendar dates in UTC components instead of converting local
  // midnight with toISOString(). In UTC+7, local `00:00` becomes the previous
  // UTC date and valid dates such as 2026-10-29 were incorrectly rejected.
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};
