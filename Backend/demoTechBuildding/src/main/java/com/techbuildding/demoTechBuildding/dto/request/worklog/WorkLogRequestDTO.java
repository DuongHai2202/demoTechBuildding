package com.techbuildding.demoTechBuildding.dto.request.worklog;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;

@Getter
@Setter
@Schema(description = "Request DTO for creating a work log")
public class WorkLogRequestDTO implements Serializable {

    @NotNull(message = "Project ID is required")
    private Integer projectId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Log date is required")
    private LocalDate logDate;

    private String weatherCondition;
    private Integer workerCount;
    private String content;
    private String status;
}
