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

    /** Nullable for legacy/manager override records created before shift planning. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_assignment_id")
    private ShiftAssignment shiftAssignment;

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

    @Column(name = "distance_out_meters")
    private Float distanceOutMeters;

    @Column(name = "gps_accuracy_in")
    private Double gpsAccuracyIn;

    @Column(name = "gps_accuracy_out")
    private Double gpsAccuracyOut;

    @Column(name = "selfie_url_in")
    private String selfieUrlIn;

    @Column(name = "selfie_url_out")
    private String selfieUrlOut;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "scheduled_start_at")
    private LocalDateTime scheduledStartAt;

    @Column(name = "scheduled_end_at")
    private LocalDateTime scheduledEndAt;

    @Column(name = "break_minutes")
    private Integer breakMinutes;

    @Column(name = "late_minutes")
    private Long lateMinutes;

    @Column(name = "early_leave_minutes")
    private Long earlyLeaveMinutes;

    @Column(name = "overtime_minutes")
    private Long overtimeMinutes;

    /** NONE when there is no overtime, otherwise PENDING/APPROVED/REJECTED. */
    @Builder.Default
    @Column(name = "overtime_status", nullable = false, length = 20)
    private String overtimeStatus = "NONE";

    @Builder.Default
    @Column(name = "overtime_approved_minutes")
    private Long overtimeApprovedMinutes = 0L;

    @Column(name = "overtime_reviewed_by", length = 50)
    private String overtimeReviewedBy;

    @Column(name = "overtime_reviewed_at")
    private LocalDateTime overtimeReviewedAt;

    @Column(name = "overtime_review_note", length = 500)
    private String overtimeReviewNote;

    @Column(name = "remarks")
    private String remarks;
}
