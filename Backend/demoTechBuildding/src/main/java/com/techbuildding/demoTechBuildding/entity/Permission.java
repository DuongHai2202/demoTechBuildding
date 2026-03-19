package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_permissions")
public class Permission extends AbstractEntity<Integer> {

    @Column(name = "name", unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "permission")
    private Set<RoleHasPermission> roleHasPermissions = new HashSet<>();
}
