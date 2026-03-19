package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_role_requests")
public class RoleRequest extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_role_id", nullable = false)
    private Role requestedRole;

    @Column(name = "reason")
    private String reason;

    @Column(name = "status", length = 20)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "admin_note")
    private String adminNote;
}
