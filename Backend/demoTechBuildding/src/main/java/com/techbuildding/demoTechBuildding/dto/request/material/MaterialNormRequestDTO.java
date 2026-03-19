package com.techbuildding.demoTechBuildding.dto.request.material;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

@Getter
@Setter
public class MaterialNormRequestDTO implements Serializable {
    private Integer boqItemId;
    private Integer materialId;
    private Float quantityPerUnit;
}
