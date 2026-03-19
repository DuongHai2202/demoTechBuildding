package com.techbuildding.demoTechBuildding.dto.request.material;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@Schema(description = "Request DTO for creating a material")
public class MaterialRequestDTO implements Serializable {
    private Integer categoryId;
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

