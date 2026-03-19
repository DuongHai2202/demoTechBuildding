package com.techbuildding.demoTechBuildding.dto.request.design;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfiRequestDTO {
    private Integer projectId;
    private String title;
    private String question;
    private String suggestedSolution;
    private String status;
    private Long assignedTo;
    private Integer designSheetId;
    private Double coordX;
    private Double coordY;
}
