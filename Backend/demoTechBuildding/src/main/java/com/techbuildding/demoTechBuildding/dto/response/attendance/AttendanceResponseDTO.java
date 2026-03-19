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
    private String status;

    // Computed: total working hours
    private Double workingHours;

    private String remarks;
}
