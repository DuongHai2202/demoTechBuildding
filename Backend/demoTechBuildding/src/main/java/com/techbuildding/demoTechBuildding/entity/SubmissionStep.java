package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_submission_steps")
public class SubmissionStep extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "assigned_role", length = 50)
    private String assignedRole; // SUPERVISOR, PM, etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processor_id")
    private User processor;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "signature_id")
    private DigitalSignature signature;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}
