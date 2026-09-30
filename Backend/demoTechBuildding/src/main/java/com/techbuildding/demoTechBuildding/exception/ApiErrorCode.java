package com.techbuildding.demoTechBuildding.exception;

/**
 * Stable categories returned in the API response. These values are safe for
 * clients to branch on; they are deliberately separate from support codes,
 * which are only used to find a server-side log entry.
 */
public final class ApiErrorCode {

    public static final String VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String REQUEST_INVALID = "REQUEST_INVALID";
    public static final String REQUEST_MALFORMED = "REQUEST_MALFORMED";
    public static final String REQUEST_METHOD_NOT_ALLOWED = "REQUEST_METHOD_NOT_ALLOWED";
    public static final String REQUEST_MEDIA_TYPE_UNSUPPORTED = "REQUEST_MEDIA_TYPE_UNSUPPORTED";
    public static final String AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS";
    public static final String AUTH_ACCOUNT_PENDING = "AUTH_ACCOUNT_PENDING";
    public static final String AUTH_ACCOUNT_INACTIVE = "AUTH_ACCOUNT_INACTIVE";
    public static final String AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED";
    public static final String SESSION_EXPIRED = "SESSION_EXPIRED";
    public static final String ACCESS_DENIED = "ACCESS_DENIED";
    public static final String PROTECTED_RESOURCE = "PROTECTED_RESOURCE";
    public static final String DUPLICATE_RESOURCE = "DUPLICATE_RESOURCE";
    public static final String RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";
    public static final String ROUTE_NOT_FOUND = "ROUTE_NOT_FOUND";
    public static final String OTP_INVALID = "OTP_INVALID";
    public static final String OTP_SERVICE_UNAVAILABLE = "OTP_SERVICE_UNAVAILABLE";
    public static final String DATABASE_UNAVAILABLE = "DATABASE_UNAVAILABLE";
    public static final String SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";

    private ApiErrorCode() {
    }
}
