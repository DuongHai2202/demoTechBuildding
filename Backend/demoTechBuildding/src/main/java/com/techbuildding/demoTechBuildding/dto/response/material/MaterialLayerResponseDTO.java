package com.techbuildding.demoTechBuildding.dto.response.material;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialLayerResponseDTO implements Serializable {
    private Integer id;
    private Integer subSystemId;
    private String subSystemName;
    private String name;
    private String code;
    private String description;
}
