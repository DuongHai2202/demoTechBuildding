package com.techbuildding.demoTechBuildding.dto.response.contract;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractWorkflowHistoryResponseDTO {
    private Long id;
    private Integer fromStep;
    private Integer toStep;
    private String action;
    private String note;
    private String changedBy;
    private LocalDateTime createdAt;
}
