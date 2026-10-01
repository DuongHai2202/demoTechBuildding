package com.techbuildding.demoTechBuildding.dto.response.attendance;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for returning attendance log details.
 */
@Getter
@Setter
public class AttendanceResponseDTO implements Serializable {

    private Long id;

    // User info
    private Long userId;
    private String username;
    private String fullName;

    // Project info
    private Integer projectId;
    private String projectName;

    // Planned shift snapshot
    private Long shiftAssignmentId;
    private String shiftCode;
    private String shiftName;
    private Boolean overtimeEligible;
    private LocalDateTime scheduledStartAt;
    private LocalDateTime scheduledEndAt;
    private Integer breakMinutes;
    private Long lateMinutes;
    private Long earlyLeaveMinutes;
    private Long overtimeMinutes;
    private String overtimeStatus;
    private Long overtimeApprovedMinutes;
    private String overtimeReviewedBy;
    private LocalDateTime overtimeReviewedAt;
    private String overtimeReviewNote;

    // Check-in
    private LocalDateTime checkInAt;
    private BigDecimal gpsLatIn;
    private BigDecimal gpsLongIn;
    private String selfieUrlIn;

    // Check-out
    private LocalDateTime checkOutAt;
    private BigDecimal gpsLatOut;
    private BigDecimal gpsLongOut;
    private String selfieUrlOut;

    // Summary
    private Float distanceInMeters;
    private Float distanceOutMeters;
    private Double gpsAccuracyIn;
    private Double gpsAccuracyOut;
    private String status;

    // Computed duration. Minutes are the authoritative display/calculation unit.
    private Long workingMinutes;
    private Double workingHours;
    private String durationText;

    private String remarks;

    // Manual correction audit
    private String correctionReason;
    private String correctedBy;
    private LocalDateTime correctedAt;

    /** Effective server/demo time used to render an open attendance record. */
    private LocalDateTime effectiveTime;
}
