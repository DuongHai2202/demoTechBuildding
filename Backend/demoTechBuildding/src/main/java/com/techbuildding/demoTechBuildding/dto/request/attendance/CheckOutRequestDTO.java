package com.techbuildding.demoTechBuildding.dto.request.attendance;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * DTO for check-out request.
 */
@Getter
@Setter
@Schema(description = "Request DTO for check-out (GPS coordinates required)")
public class CheckOutRequestDTO implements Serializable {

    @NotNull(message = "GPS latitude must not be null")
    @Schema(description = "User's current latitude", example = "10.7322")
    private BigDecimal latitude;

    @NotNull(message = "GPS longitude must not be null")
    @Schema(description = "User's current longitude", example = "106.7225")
    private BigDecimal longitude;

    @NotNull(message = "GPS accuracy must not be null")
    @DecimalMin(value = "0.0", message = "GPS accuracy must not be negative")
    @DecimalMax(value = "10000.0", message = "GPS accuracy is invalid")
    @Schema(description = "GPS accuracy in meters", example = "12.5")
    private BigDecimal accuracy;
}
