package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_submissions")
public class Submission extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "submission_type", length = 50, nullable = false)
    private String submissionType; // MATERIAL_REQUEST, RFI, SHOP_DRAWING, CONTRACT_EDIT

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, APPROVED, REJECTED, CANCELLED

    @Column(name = "current_step_index")
    private Integer currentStepIndex;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    @Builder.Default
    private List<SubmissionStep> steps = new ArrayList<>();
}
