package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_digital_signatures")
public class DigitalSignature extends AbstractEntity<Long> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signer_id", nullable = false)
    private User signer;

    @Column(name = "signature_type", length = 20, nullable = false)
    private String signatureType; // ELECTRONIC (handdrawn), SMART_CA

    @Column(name = "signature_data", columnDefinition = "LONGTEXT")
    private String signatureData; // Base64 image or CA metadata/hash

    @Column(name = "certificate_serial")
    private String certificateSerial; // Only for SMART_CA

    @Column(name = "signed_at", nullable = false)
    private LocalDateTime signedAt;

    @Column(name = "ip_address")
    private String ipAddress;
}
