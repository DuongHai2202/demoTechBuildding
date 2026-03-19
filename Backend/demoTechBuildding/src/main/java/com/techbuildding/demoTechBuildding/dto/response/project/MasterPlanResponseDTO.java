package com.techbuildding.demoTechBuildding.dto.response.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MasterPlanResponseDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer progress;
    private String status;
    private Long parentId;
    private Integer displayOrder;
    private List<MasterPlanResponseDTO> children;
}
