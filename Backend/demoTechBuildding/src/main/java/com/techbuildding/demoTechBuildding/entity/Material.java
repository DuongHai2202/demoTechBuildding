package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_materials")
public class Material extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private MaterialCategory category;

    @Column(name = "management_code", length = 50)
    private String managementCode;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    @Column(name = "name_en")
    private String nameEn;

    @Column(name = "name_zh")
    private String nameZh;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "catalogue_url", length = 500)
    private String catalogueUrl;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    private String descriptionVi;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "description_zh", columnDefinition = "TEXT")
    private String descriptionZh;

    @Column(name = "revit_family_category", length = 100)
    private String revitFamilyCategory;

    @Column(name = "revit_code", length = 100)
    private String revitCode;

    @Column(name = "properties", columnDefinition = "JSON")
    private String properties;
}
