package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_contracts")
public class Contract extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "contract_number", unique = true, nullable = false, length = 100)
    private String contractNumber;

    @Column(name = "contract_name")
    private String contractName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private Partner partner;

    @Column(name = "partner_name") // Keeping for legacy or manual entry
    private String partnerName;

    @Column(name = "contract_value", precision = 18, scale = 2)
    private BigDecimal contractValue;

    @Builder.Default
    @Column(name = "workflow_step")
    private Integer workflowStep = 1; // 1-7 based on image

    @Column(name = "guarantee_info", columnDefinition = "TEXT")
    private String guaranteeInfo;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "ACTIVE";

    @Builder.Default
    @Column(name = "type", length = 20)
    private String type = "MAIN"; // MAIN, ADDENDUM

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Contract parentContract;

    @Column(name = "signed_date")
    private LocalDate signedDate;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;
}
