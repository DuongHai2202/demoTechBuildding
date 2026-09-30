package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_contract_workflow_history")
public class ContractWorkflowHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Column(name = "from_step")
    private Integer fromStep;

    @Column(name = "to_step", nullable = false)
    private Integer toStep;

    @Column(name = "action", nullable = false, length = 30)
    private String action;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "changed_by", nullable = false, length = 100)
    private String changedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
