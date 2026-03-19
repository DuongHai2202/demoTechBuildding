package com.techbuildding.demoTechBuildding.dto.request.bim;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BimModelRequestDTO {
    private Integer projectId;
    private Integer zoneId;
    private String modelName;
    private String fileUrl;
    private String version;
    private String description;
    private Long fileSize;
}
