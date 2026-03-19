package com.techbuildding.demoTechBuildding.dto.request.submission;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DigitalSignatureRequestDTO {
    private String signatureType; // ELECTRONIC, SMART_CA
    private String signatureData;
    private String certificateSerial;
}
