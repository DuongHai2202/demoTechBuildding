package com.techbuildding.demoTechBuildding.dto.response.bim;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BimModelResponseDTO {
    private Integer id;
    private Integer projectId;
    private Integer zoneId;
    private String zoneName;
    private String modelName;
    private String fileUrl;
    private String version;
    private String description;
    private Long fileSize;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
