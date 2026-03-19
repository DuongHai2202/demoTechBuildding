package com.techbuildding.demoTechBuildding.dto.request.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

/**
 * DTO for assigning a user to a project.
 */
@Getter
@Setter
@Schema(description = "Request DTO for assigning a user to a project")
public class AssignMemberRequestDTO implements Serializable {

    @NotNull(message = "User ID must not be null")
    @Schema(description = "User ID to assign", example = "1")
    private Long userId;

    @NotBlank(message = "Assigned role must not be blank")
    @Schema(description = "Role in project: PM, ENGINEER, WORKER, SUPERVISOR", example = "WORKER")
    private String assignedRole;
}
