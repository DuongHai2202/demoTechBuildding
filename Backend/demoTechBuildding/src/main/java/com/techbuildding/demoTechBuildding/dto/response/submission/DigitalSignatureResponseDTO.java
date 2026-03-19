package com.techbuildding.demoTechBuildding.dto.response.submission;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalSignatureResponseDTO {
    private Long id;
    private Long signerId;
    private String signerName;
    private String signatureType;
    private String signatureData;
    private LocalDateTime signedAt;
}
