package com.techbuildding.demoTechBuildding.dto.response.material;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

@Getter
@Setter
public class MaterialNormResponseDTO implements Serializable {
    private Integer id;
    private Integer boqItemId;
    private Integer materialId;
    private String materialName;
    private String materialUnit;
    private Float quantityPerUnit;
}
