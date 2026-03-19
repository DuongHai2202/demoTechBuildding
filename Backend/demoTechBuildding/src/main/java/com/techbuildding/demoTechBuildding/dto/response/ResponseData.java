package com.techbuildding.demoTechBuildding.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.io.Serializable;

/**
 * Standard API response wrapper for successful operations.
 *
 * @param <T> the type of data payload
 */
@Getter
public class ResponseData<T> implements Serializable {

    private final int status;
    private final String message;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;

    // Constructor without data (e.g., delete operations)
    public ResponseData(int status, String message) {
        this.status = status;
        this.message = message;
    }

    // Constructor with data payload
    public ResponseData(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }
}
