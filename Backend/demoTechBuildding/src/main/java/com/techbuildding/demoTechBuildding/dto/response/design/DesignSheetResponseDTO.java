package com.techbuildding.demoTechBuildding.dto.response.design;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignSheetResponseDTO {
    private Integer id;
    private Integer projectId;
    private Integer zoneId;
    private String zoneName;
    private String sheetNumber;
    private String title;
    private String discipline;
    private String revision;
    private String status;
    private String fileUrl;
    private String thumbnailUrl;
    private LocalDate issuedAt;
    private Long issuedBy;
    private String issuerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
