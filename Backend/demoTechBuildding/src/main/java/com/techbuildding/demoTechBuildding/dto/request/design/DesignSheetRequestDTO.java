package com.techbuildding.demoTechBuildding.dto.request.design;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DesignSheetRequestDTO {
    private Integer projectId;
    private Integer zoneId;
    private String sheetNumber;
    private String title;
    private String discipline;
    private String revision;
    private String status;
    private String fileUrl;
    private String thumbnailUrl;
    private LocalDate issuedAt;
    private Long issuedBy;
}
