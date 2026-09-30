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

import java.time.LocalTime;

/**
 * A reusable definition of a work shift. A template is deliberately kept
 * separate from a user's daily assignment so changing tomorrow's schedule
 * never rewrites historical attendance records.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_shift_templates")
public class ShiftTemplate extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Builder.Default
    @Column(name = "crosses_midnight", nullable = false)
    private boolean crossesMidnight = false;

    @Builder.Default
    @Column(name = "break_minutes", nullable = false)
    private Integer breakMinutes = 0;

    @Builder.Default
    @Column(name = "early_check_in_minutes", nullable = false)
    private Integer earlyCheckInMinutes = 30;

    @Builder.Default
    @Column(name = "late_check_in_minutes", nullable = false)
    private Integer lateCheckInMinutes = 120;

    /** Whether time worked after the scheduled end can be submitted for approval. */
    @Builder.Default
    @Column(name = "overtime_eligible", nullable = false)
    private boolean overtimeEligible = true;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";
}
