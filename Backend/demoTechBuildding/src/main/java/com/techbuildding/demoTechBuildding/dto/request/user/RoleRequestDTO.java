package com.techbuildding.demoTechBuildding.dto.request.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequestDTO {
    private String roleName; // The name of the role being requested (PM, STAFF, etc.)
    private String reason;
}
