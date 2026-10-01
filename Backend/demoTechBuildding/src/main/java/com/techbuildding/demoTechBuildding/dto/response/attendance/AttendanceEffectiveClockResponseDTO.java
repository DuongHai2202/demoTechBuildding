package com.techbuildding.demoTechBuildding.dto.response.attendance;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Public, non-sensitive clock value used by the attendance screen. */
@Getter
@AllArgsConstructor
public class AttendanceEffectiveClockResponseDTO implements Serializable {

    private LocalDateTime effectiveTime;
    private LocalDate businessDate;
}
