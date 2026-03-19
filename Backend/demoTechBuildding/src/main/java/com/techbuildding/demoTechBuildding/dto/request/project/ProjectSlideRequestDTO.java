package com.techbuildding.demoTechBuildding.dto.request.project;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectSlideRequestDTO {
    private Integer projectId;
    private String imageUrl;
    private String caption;
    private Integer displayOrder;
}
