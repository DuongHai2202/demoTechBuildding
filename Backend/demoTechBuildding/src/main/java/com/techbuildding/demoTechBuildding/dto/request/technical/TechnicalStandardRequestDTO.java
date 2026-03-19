package com.techbuildding.demoTechBuildding.dto.request.technical;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicalStandardRequestDTO {
    @NotBlank(message = "Standard code is required")
    private String code;

    @NotBlank(message = "Standard name is required")
    private String name;

    private String description;
    private String category;
    private String version;
    private Integer projectId;
}
