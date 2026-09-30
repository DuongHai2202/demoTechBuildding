package com.techbuildding.demoTechBuildding.dto.response.shift;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalTime;

@Getter
@Setter
public class ShiftTemplateResponseDTO implements Serializable {
    private Long id;
    private Integer projectId;
    private String projectName;
    private String code;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean crossesMidnight;
    private Integer breakMinutes;
    private Integer earlyCheckInMinutes;
    private Integer lateCheckInMinutes;
    private boolean overtimeEligible;
    private String status;
}
