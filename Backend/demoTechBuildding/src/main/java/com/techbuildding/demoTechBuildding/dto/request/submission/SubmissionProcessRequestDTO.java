package com.techbuildding.demoTechBuildding.dto.request.submission;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionProcessRequestDTO {
    private String status; // APPROVED, REJECTED
    private String comments;
    private DigitalSignatureRequestDTO signature;
}
