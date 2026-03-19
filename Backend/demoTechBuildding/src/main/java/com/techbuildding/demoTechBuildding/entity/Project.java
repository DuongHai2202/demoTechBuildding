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
@Table(name = "tbl_projects")
public class Project extends AbstractEntity<Integer> {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "project_code", unique = true, length = 50)
    private String projectCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    @Builder.Default
    @Column(name = "radius_meters")
    private Integer radiusMeters = 100;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Builder.Default
    @Column(name = "status", length = 20)
    private String status = "PLANNING";
}
