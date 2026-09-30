import axios from 'axios';

export interface ApiErrorPayload {
  status?: number;
  code?: string;
  message?: string;
  supportCode?: string;
  /** Kept for responses from an older backend build. */
  errorCode?: string;
  fieldErrors?: Record<string, string>;
}

export interface ApiErrorInfo {
  status?: number;
  code?: string;
  message: string;
  supportCode?: string;
  fieldErrors: Record<string, string>;
}

const CODE_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác.',
  AUTH_ACCOUNT_PENDING: 'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP trước khi đăng nhập.',
  AUTH_ACCOUNT_INACTIVE: 'Tài khoản đang bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.',
  AUTHENTICATION_REQUIRED: 'Vui lòng đăng nhập để sử dụng chức năng này.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  ACCESS_DENIED: 'Bạn không có quyền thực hiện thao tác này. Nếu cần, hãy liên hệ quản trị viên để được cấp quyền.',
  PROTECTED_RESOURCE: 'Dữ liệu hệ thống này được bảo vệ và không thể thay đổi.',
  VALIDATION_FAILED: 'Vui lòng kiểm tra lại các trường thông tin được đánh dấu.',
  REQUEST_INVALID: 'Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại thông tin.',
  REQUEST_MALFORMED: 'Dữ liệu gửi lên không đúng định dạng. Vui lòng tải lại trang và thử lại.',
  REQUEST_METHOD_NOT_ALLOWED: 'Thao tác này không được hỗ trợ ở chức năng hiện tại.',
  REQUEST_MEDIA_TYPE_UNSUPPORTED: 'Định dạng dữ liệu gửi lên chưa được hỗ trợ.',
  DUPLICATE_RESOURCE: 'Dữ liệu đã tồn tại. Vui lòng kiểm tra lại thông tin trùng lặp.',
  RESOURCE_NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu hoặc dữ liệu đã bị xóa.',
  ROUTE_NOT_FOUND: 'Không tìm thấy chức năng hoặc địa chỉ yêu cầu. Vui lòng tải lại trang và thử lại.',
  OTP_INVALID: 'Mã OTP không đúng hoặc đã hết hạn. Vui lòng kiểm tra email và nhập lại mã mới.',
  OTP_SERVICE_UNAVAILABLE: 'Dịch vụ xác thực tạm thời chưa sẵn sàng. Vui lòng thử lại sau ít phút.',
  DATABASE_UNAVAILABLE: 'Hệ thống tạm thời không kết nối được cơ sở dữ liệu. Vui lòng thử lại sau ít phút.',
  SERVICE_UNAVAILABLE: 'Hệ thống tạm thời không thể hoàn tất yêu cầu. Vui lòng thử lại sau ít phút.',
  INTERNAL_ERROR: 'Hệ thống đang gặp sự cố tạm thời. Thông tin của bạn chưa được thay đổi. Vui lòng thử lại sau.',
};

function readPayload(error: unknown): { status?: number; payload: ApiErrorPayload } {
  if (!axios.isAxiosError(error)) {
    return { payload: {} };
  }

  const responseData = error.response?.data;
  if (!responseData || typeof responseData !== 'object') {
    return { status: error.response?.status, payload: {} };
  }

  return {
    status: error.response?.status,
    payload: responseData as ApiErrorPayload,
  };
}

function removeLegacySupportCode(message: string) {
  return message
    .replace(/\s*Mã\s+(?:lỗi|tham chiếu|hỗ trợ)\s*:\s*ERR-[A-Z0-9-]+\.?\s*$/i, '')
    .trim();
}

function normalizeLegacyMessage(message: string, status?: number, code?: string) {
  const cleaned = removeLegacySupportCode(message);

  // REQUEST_INVALID is also used for safe business-rule rejections (for
  // example, revoking a late check-in permission after the employee already
  // used that permission). Keep that user-facing explanation instead of
  // replacing it with the generic validation message. Server failures still
  // use INTERNAL_ERROR/SERVICE_UNAVAILABLE and never expose stack traces.
  if (code === 'REQUEST_INVALID' && cleaned) {
    return cleaned;
  }

  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }

  const normalized = cleaned.toLowerCase();

  if (normalized.includes('bad credentials') || normalized.includes('invalid username or password')) {
    return CODE_MESSAGES.AUTH_INVALID_CREDENTIALS;
  }
  if (normalized.includes('account is not activated') || normalized.includes('not activated')) {
    return CODE_MESSAGES.AUTH_ACCOUNT_PENDING;
  }
  if (normalized.includes('user not found') && status === 401) {
    return CODE_MESSAGES.AUTH_INVALID_CREDENTIALS;
  }
  if (normalized.includes('invalid or expired otp')) {
    return CODE_MESSAGES.OTP_INVALID;
  }
  if (status === 401) {
    return CODE_MESSAGES.AUTH_INVALID_CREDENTIALS;
  }
  if (status === 403) {
    return CODE_MESSAGES.ACCESS_DENIED;
  }
  if (status === 503) {
    return CODE_MESSAGES.SERVICE_UNAVAILABLE;
  }
  if (status && status >= 500) {
    return CODE_MESSAGES.INTERNAL_ERROR;
  }

  return cleaned || 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.';
}

export function getApiErrorInfo(error: unknown, fallback?: string): ApiErrorInfo {
  const { status, payload } = readPayload(error);
  const resolvedStatus = payload.status ?? status;
  const code = typeof payload.code === 'string' ? payload.code : undefined;
  const rawMessage = typeof payload.message === 'string' ? payload.message : '';
  const message = rawMessage
    ? normalizeLegacyMessage(rawMessage, resolvedStatus, code)
    : (code && CODE_MESSAGES[code]) || fallback || normalizeLegacyMessage('', resolvedStatus, code);

  return {
    status: resolvedStatus,
    code,
    message,
    supportCode: payload.supportCode || payload.errorCode || undefined,
    fieldErrors: payload.fieldErrors && typeof payload.fieldErrors === 'object'
      ? payload.fieldErrors
      : {},
  };
}

export function getApiErrorMessage(error: unknown, fallback?: string) {
  return getApiErrorInfo(error, fallback).message;
}
