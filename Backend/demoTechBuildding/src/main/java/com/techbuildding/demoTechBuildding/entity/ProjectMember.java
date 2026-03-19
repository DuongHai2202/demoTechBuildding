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
@Table(name = "tbl_project_members", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "project_id", "user_id" })
})
public class ProjectMember extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "assigned_role", length = 50)
    private String assignedRole;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
}
