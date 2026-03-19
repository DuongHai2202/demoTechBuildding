package com.techbuildding.demoTechBuildding.dto.response.project;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectSlideResponseDTO {
    private Integer id;
    private Integer projectId;
    private String imageUrl;
    private String caption;
    private Integer displayOrder;
}
