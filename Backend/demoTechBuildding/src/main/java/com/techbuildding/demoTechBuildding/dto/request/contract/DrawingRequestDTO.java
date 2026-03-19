package com.techbuildding.demoTechBuildding.dto.request.contract;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DrawingRequestDTO {
    private Integer projectId;
    private Integer contractId;
    private String name;
    private String drawingNumber;
    private String fileUrl;
    private String version;
}
