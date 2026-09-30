package com.techbuildding.demoTechBuildding.dto.response.shift;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
public class ShiftAssignmentResponseDTO implements Serializable {
    private Long id;
    private Integer projectId;
    private String projectName;
    private Long userId;
    private String username;
    private String fullName;
    private Long shiftTemplateId;
    private String shiftCode;
    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean crossesMidnight;
    private Integer breakMinutes;
    private Integer earlyCheckInMinutes;
    private Integer lateCheckInMinutes;
    private boolean overtimeEligible;
    private LocalDate workDate;
    private LocalDateTime scheduledStartAt;
    private LocalDateTime scheduledEndAt;
    private String status;
    private String notes;
    private boolean lateCheckInApproved;
    private LocalDateTime lateCheckInApprovedAt;
    private String lateCheckInApprovalNote;
    private boolean attendanceClaimed;
    private String attendanceStatus;
    private boolean current;
    private boolean eligibleForCheckIn;
    private String windowMessage;
}
