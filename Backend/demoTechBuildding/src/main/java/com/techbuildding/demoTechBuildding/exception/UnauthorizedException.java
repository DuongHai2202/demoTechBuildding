package com.techbuildding.demoTechBuildding.exception;

/**
 * Raised when an authenticated session or refresh token is no longer valid.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
