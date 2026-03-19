package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_design_sheets")
public class DesignSheet extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id")
    private Zone zone;

    @Column(name = "sheet_number", nullable = false, length = 100)
    private String sheetNumber;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "discipline", length = 50)
    private String discipline; // ARCH, STRUC, MEP, etc.

    @Column(name = "revision", length = 20)
    private String revision;

    @Column(name = "status", length = 50)
    private String status; // PRELIMINARY, IFC, etc.

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "issued_at")
    private LocalDate issuedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by")
    private User issuer;
}
