package com.techbuildding.demoTechBuildding.dto.response.attendance;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AttendanceDemoClockResponseDTO {

    private boolean featureEnabled;
    private boolean enabled;
    private LocalDateTime actualTime;
    private LocalDateTime effectiveTime;
    private LocalDateTime demoTime;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
    private String updatedBy;
    private String message;
}
