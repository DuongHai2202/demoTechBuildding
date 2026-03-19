package com.techbuildding.demoTechBuildding.dto.response.contract;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DrawingResponseDTO {
    private Integer id;
    private Integer projectId;
    private Integer contractId;
    private String name;
    private String drawingNumber;
    private String fileUrl;
    private String version;
}
