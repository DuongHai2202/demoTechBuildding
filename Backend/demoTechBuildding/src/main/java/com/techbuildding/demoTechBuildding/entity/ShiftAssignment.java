package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** A concrete shift assigned to one user for one project and work date. */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_shift_assignments", uniqueConstraints = {
        @UniqueConstraint(name = "uq_shift_assignment", columnNames = {
                "project_id", "user_id", "shift_template_id", "work_date"
        })
})
public class ShiftAssignment extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "shift_template_id", nullable = false)
    private ShiftTemplate shiftTemplate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "work_date", nullable = false)
    private LocalDate workDate;

    @Builder.Default
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ASSIGNED";

    @Column(name = "notes", length = 500)
    private String notes;
}
