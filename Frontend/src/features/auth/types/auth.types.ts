export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName?: string;
  phone?: string;
  email?: string;
}

export interface VerifyOtpRequest {
  username: string;
  otpCode: string;
}

export interface RegisterResponse {
  user: {
    username: string;
    email?: string;
  };
  demoOtp?: string | null;
  otpExpiresInSeconds: number;
  emailQueued: boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
