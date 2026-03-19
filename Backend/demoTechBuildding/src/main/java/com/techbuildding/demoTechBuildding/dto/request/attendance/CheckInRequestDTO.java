package com.techbuildding.demoTechBuildding.dto.request.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for check-in request.
 * Selfie image is sent as a multipart file separately.
 */
@Getter
@Setter
@Schema(description = "Request DTO for check-in (GPS coordinates required)")
public class CheckInRequestDTO implements Serializable {

    @NotNull(message = "Project ID must not be null")
    @Schema(description = "Project ID to check in", example = "1")
    private Integer projectId;

    @NotNull(message = "GPS latitude must not be null")
    @Schema(description = "User's current latitude", example = "10.7322")
    private BigDecimal latitude;

    @NotNull(message = "GPS longitude must not be null")
    @Schema(description = "User's current longitude", example = "106.7225")
    private BigDecimal longitude;
}
