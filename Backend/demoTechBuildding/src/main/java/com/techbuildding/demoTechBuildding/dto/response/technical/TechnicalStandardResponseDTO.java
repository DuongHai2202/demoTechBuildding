package com.techbuildding.demoTechBuildding.dto.response.technical;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalStandardResponseDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String category;
    private String fileUrl;
    private String version;
    private Integer projectId;
    private String projectName;
    private String createdBy;
    private LocalDateTime createdAt;
}
