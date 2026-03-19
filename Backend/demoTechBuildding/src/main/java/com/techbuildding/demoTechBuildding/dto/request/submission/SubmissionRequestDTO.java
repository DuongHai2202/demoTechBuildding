package com.techbuildding.demoTechBuildding.dto.request.submission;

import lombok.*;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionRequestDTO {
    private Integer projectId;
    private String title;
    private String submissionType;
    private Long referenceId;
    private List<SubmissionStepRequestDTO> steps;
}
