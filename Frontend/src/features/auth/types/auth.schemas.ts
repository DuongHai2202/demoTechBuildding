import { z } from 'zod';
import { optionalPhone, requiredText } from '../../../utils/validation';

export const loginSchema = z.object({
  username: requiredText('Tên đăng nhập phải có ít nhất 3 ký tự', 3).regex(/^[a-zA-Z0-9._-]+$/, 'Tên đăng nhập chỉ gồm chữ cái, số, dấu chấm, gạch ngang hoặc gạch dưới'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: requiredText('Tên đăng nhập phải có ít nhất 3 ký tự', 3).regex(/^[a-zA-Z0-9._-]+$/, 'Tên đăng nhập chỉ gồm chữ cái, số, dấu chấm, gạch ngang hoặc gạch dưới'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: requiredText('Họ và tên phải có ít nhất 2 ký tự', 2),
  phone: optionalPhone(),
  email: z.string().trim().email('Email không đúng định dạng').optional().or(z.literal('')),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  otpCode: z.string().regex(/^\d{6}$/, 'Mã OTP phải có đúng 6 chữ số'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
