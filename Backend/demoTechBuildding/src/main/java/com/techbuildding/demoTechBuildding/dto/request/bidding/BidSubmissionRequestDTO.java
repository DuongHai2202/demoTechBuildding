package com.techbuildding.demoTechBuildding.dto.request.bidding;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidSubmissionRequestDTO {
    private Integer packageId;
    private Integer partnerId;
    private BigDecimal bidPrice;
    private String proposalFileUrl;
    private String notes;
}
