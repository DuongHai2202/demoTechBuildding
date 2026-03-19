package com.techbuildding.demoTechBuildding.dto.response.submission;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionResponseDTO {
    private Long id;
    private Integer projectId;
    private String title;
    private String submissionType;
    private Long referenceId;
    private String status;
    private Integer currentStepIndex;
    private List<SubmissionStepResponseDTO> steps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
