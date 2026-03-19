package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_role_has_permissions")
@IdClass(RoleHasPermission.RoleHasPermissionId.class)
public class RoleHasPermission {

    @Id
    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @Id
    @ManyToOne
    @JoinColumn(name = "permission_id")
    private Permission permission;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class RoleHasPermissionId implements Serializable {
        private Integer role;
        private Integer permission;
    }
}
