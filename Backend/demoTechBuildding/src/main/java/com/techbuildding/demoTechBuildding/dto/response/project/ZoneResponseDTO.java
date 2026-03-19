package com.techbuildding.demoTechBuildding.dto.response.project;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ZoneResponseDTO {
    private Integer id;
    private Integer projectId;
    private String name;
    private String zoneCode;
    private Integer parentId;
    private java.util.List<ZoneResponseDTO> children;
}
