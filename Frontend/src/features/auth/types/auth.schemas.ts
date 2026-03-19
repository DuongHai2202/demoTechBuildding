import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  otpCode: z.string().length(6, 'Mã OTP phải có đúng 6 ký tự số'),
});

export type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;
