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
@Table(name = "tbl_rfis")
public class Rfi extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "question", columnDefinition = "TEXT", nullable = false)
    private String question;

    @Column(name = "suggested_solution", columnDefinition = "TEXT")
    private String suggestedSolution;

    @Column(name = "status", length = 50)
    private String status; // OPEN, PENDING, RESOLVED, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "design_sheet_id")
    private DesignSheet designSheet;

    @Column(name = "coord_x")
    private Double coordX;

    @Column(name = "coord_y")
    private Double coordY;
}
