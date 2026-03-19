package com.techbuildding.demoTechBuildding.dto.response.project;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO for returning project member info.
 */
@Getter
@Setter
public class ProjectMemberResponseDTO implements Serializable {

    private Integer id;
    private Long userId;
    private String username;
    private String fullName;
    private String assignedRole;
    private boolean active;
    private LocalDateTime joinedAt;
}
