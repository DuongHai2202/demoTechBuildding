package com.techbuildding.demoTechBuildding.dto.response.material;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class MaterialResponseDTO implements Serializable {
    private Integer id;
    private Integer categoryId;
    private String categoryName;
    private String managementCode;
    private String nameVi;
    private String nameEn;
    private String nameZh;
    private String unit;
    private String imageUrl;
    private String catalogueUrl;
    private String descriptionVi;
    private String descriptionEn;
    private String descriptionZh;
    private String revitFamilyCategory;
    private String revitCode;
    private String properties;
}

