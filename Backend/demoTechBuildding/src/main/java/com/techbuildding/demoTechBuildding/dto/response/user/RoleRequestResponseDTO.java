package com.techbuildding.demoTechBuildding.dto.response.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequestResponseDTO {
    private Long id;
    private String username;
    private String fullName;
    private String requestedRoleName;
    private String reason;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
}
