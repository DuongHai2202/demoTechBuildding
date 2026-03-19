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
@Table(name = "tbl_roles")
public class Role extends AbstractEntity<Integer> {

    @Column(name = "name", unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "role")
    private Set<UserHasRole> userHasRoles = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "role")
    private Set<RoleHasPermission> roleHasPermissions = new HashSet<>();
}
