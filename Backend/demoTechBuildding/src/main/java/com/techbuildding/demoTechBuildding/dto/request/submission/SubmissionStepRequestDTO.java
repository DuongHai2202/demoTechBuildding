package com.techbuildding.demoTechBuildding.dto.request.submission;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionStepRequestDTO {
    private String stepName;
    private Integer stepOrder;
    private String assignedRole;
}
