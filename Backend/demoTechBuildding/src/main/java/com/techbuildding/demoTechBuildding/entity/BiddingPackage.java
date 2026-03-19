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
@Table(name = "tbl_bidding_packages")
public class BiddingPackage extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "package_code", unique = true, length = 50, nullable = false)
    private String packageCode;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "budget", precision = 19, scale = 2)
    private BigDecimal budget;

    @Builder.Default
    @Column(name = "status", length = 30, nullable = false)
    private String status = "DRAFT";

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "criteria", columnDefinition = "TEXT")
    private String criteria; // JSON string for criteria items
}
