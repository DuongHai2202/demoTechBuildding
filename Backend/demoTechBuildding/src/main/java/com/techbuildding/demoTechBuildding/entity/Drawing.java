package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_drawings")
public class Drawing extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "drawing_number", length = 100)
    private String drawingNumber;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "version", length = 20)
    private String version;
}
