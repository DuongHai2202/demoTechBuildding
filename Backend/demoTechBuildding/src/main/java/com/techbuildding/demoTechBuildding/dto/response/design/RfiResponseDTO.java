package com.techbuildding.demoTechBuildding.dto.response.design;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfiResponseDTO {
    private Integer id;
    private Integer projectId;
    private String title;
    private String question;
    private String suggestedSolution;
    private String status;
    private Long assignedTo;
    private String assigneeName;
    private Long createdBy;
    private String creatorName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private Integer designSheetId;
    private String sheetNumber;
    private Double coordX;
    private Double coordY;
}
