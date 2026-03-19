package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_attendance_logs")
public class AttendanceLog extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "check_in_at")
    private LocalDateTime checkInAt;

    @Column(name = "check_out_at")
    private LocalDateTime checkOutAt;

    @Column(name = "gps_lat_in", precision = 10, scale = 8)
    private BigDecimal gpsLatIn;

    @Column(name = "gps_long_in", precision = 11, scale = 8)
    private BigDecimal gpsLongIn;

    @Column(name = "gps_lat_out", precision = 10, scale = 8)
    private BigDecimal gpsLatOut;

    @Column(name = "gps_long_out", precision = 11, scale = 8)
    private BigDecimal gpsLongOut;

    @Column(name = "distance_in_meters")
    private Float distanceInMeters;

    @Column(name = "selfie_url_in")
    private String selfieUrlIn;

    @Column(name = "selfie_url_out")
    private String selfieUrlOut;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "remarks")
    private String remarks;
}
