package com.techbuildding.demoTechBuildding.dto.response.bidding;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidSubmissionResponseDTO {
    private Integer id;
    private Integer packageId;
    private Integer partnerId;
    private String partnerName;
    private BigDecimal bidPrice;
    private String proposalFileUrl;
    private String status;
    private String notes;
    private LocalDateTime submissionDate;
}
