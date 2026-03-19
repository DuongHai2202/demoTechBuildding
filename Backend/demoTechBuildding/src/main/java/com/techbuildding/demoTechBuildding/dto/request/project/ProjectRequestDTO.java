package com.techbuildding.demoTechBuildding.dto.request.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating/updating a project.
 */
@Getter
@Setter
@Schema(description = "Request DTO for creating or updating a project")
public class ProjectRequestDTO implements Serializable {

    @NotBlank(message = "Project name must not be blank")
    @Schema(description = "Project name", example = "Chung cư Sunrise City")
    private String name;

    @Schema(description = "Project code", example = "PRJ-001")
    private String projectCode;

    @Schema(description = "Project description", example = "Dự án xây dựng chung cư cao cấp tại Quận 7")
    private String description;

    @Schema(description = "Project address", example = "123 Nguyễn Hữu Thọ, Quận 7, TP.HCM")
    private String address;

    @NotNull(message = "Latitude must not be null")
    @Schema(description = "GPS latitude of project center", example = "10.7322")
    private BigDecimal latitude;

    @NotNull(message = "Longitude must not be null")
    @Schema(description = "GPS longitude of project center", example = "106.7225")
    private BigDecimal longitude;

    @Schema(description = "Geofencing radius in meters (default 100m)", example = "150")
    private Integer radiusMeters = 100;

    @Schema(description = "Project start date", example = "2026-04-01")
    private LocalDate startDate;

    @Schema(description = "Project end date", example = "2026-12-31")
    private LocalDate endDate;

    @Schema(description = "Project status: PLANNING, IN_PROGRESS, COMPLETED, SUSPENDED", example = "PLANNING")
    private String status;
}
