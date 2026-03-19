package com.techbuildding.demoTechBuildding.dto.request.project;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZoneRequestDTO {
    private Integer projectId;
    private String name;
    private String zoneCode;
    private Integer parentId;
}
