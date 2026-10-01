package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** Immutable business snapshot for every manual attendance correction. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_attendance_correction_audits")
public class AttendanceCorrectionAudit extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attendance_id", nullable = false)
    private AttendanceLog attendanceLog;

    @Column(name = "previous_status", nullable = false, length = 20)
    private String previousStatus;

    @Column(name = "new_status", nullable = false, length = 20)
    private String newStatus;

    @Column(name = "previous_check_in_at")
    private LocalDateTime previousCheckInAt;

    @Column(name = "previous_check_out_at")
    private LocalDateTime previousCheckOutAt;

    @Column(name = "new_check_in_at")
    private LocalDateTime newCheckInAt;

    @Column(name = "new_check_out_at")
    private LocalDateTime newCheckOutAt;

    @Column(name = "reason", nullable = false, length = 500)
    private String reason;

    @Column(name = "corrected_by", nullable = false, length = 50)
    private String correctedBy;

    @Column(name = "corrected_at", nullable = false)
    private LocalDateTime correctedAt;
}
