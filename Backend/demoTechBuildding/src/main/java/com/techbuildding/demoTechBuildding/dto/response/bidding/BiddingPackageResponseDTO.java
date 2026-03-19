package com.techbuildding.demoTechBuildding.dto.response.bidding;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BiddingPackageResponseDTO {
    private Integer id;
    private Integer projectId;
    private String packageCode;
    private String packageName;
    private String description;
    private BigDecimal budget;
    private String status;
    private LocalDateTime deadline;
    private String criteria;
    private LocalDateTime createdAt;
}
