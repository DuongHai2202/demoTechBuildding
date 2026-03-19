package com.techbuildding.demoTechBuildding.dto.response.material;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialSubSystemResponseDTO implements Serializable {
    private Integer id;
    private String name;
    private String type;
    private String description;
}
