package com.techbuildding.demoTechBuildding.dto.response.submission;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionStepResponseDTO {
    private Long id;
    private String stepName;
    private Integer stepOrder;
    private String assignedRole;
    private String status;
    private String comments;
    private Long processorId;
    private String processorName;
    private DigitalSignatureResponseDTO signature;
    private LocalDateTime processedAt;
}
