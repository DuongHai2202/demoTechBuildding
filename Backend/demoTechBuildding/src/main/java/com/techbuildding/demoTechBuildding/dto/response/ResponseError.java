package com.techbuildding.demoTechBuildding.dto.response;

import lombok.Getter;

import java.io.Serializable;

/**
 * Standard API response wrapper for error/failure operations.
 * Unlike {@link ResponseData}, this class does not contain a data payload.
 */
@Getter
public class ResponseError implements Serializable {

    private final int status;
    private final String message;

    public ResponseError(int status, String message) {
        this.status = status;
        this.message = message;
    }
}
