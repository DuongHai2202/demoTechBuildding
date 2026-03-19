package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_work_logs")
public class WorkLog extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "weather_condition", length = 100)
    private String weatherCondition;

    @Builder.Default
    @Column(name = "worker_count")
    private Integer workerCount = 0;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "PENDING"; // PENDING, CHECKED, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "checked_by")
    private User checkedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "checked_at")
    private java.time.LocalDateTime checkedAt;

    @Column(name = "approved_at")
    private java.time.LocalDateTime approvedAt;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
