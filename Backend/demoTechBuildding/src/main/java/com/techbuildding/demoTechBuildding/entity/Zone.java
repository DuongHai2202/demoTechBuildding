package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_zones")
public class Zone extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Zone parent;

    @Builder.Default
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private java.util.Set<Zone> children = new java.util.HashSet<>();

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "zone_code", length = 50)
    private String zoneCode;
}
