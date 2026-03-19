package com.techbuildding.demoTechBuildding.dto.response.material;

import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
public class MaterialCategoryResponseDTO implements Serializable {
    private Integer id;
    private String name;
    private String description;
}
