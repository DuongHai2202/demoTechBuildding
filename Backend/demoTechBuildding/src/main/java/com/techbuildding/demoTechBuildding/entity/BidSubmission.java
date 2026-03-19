package com.techbuildding.demoTechBuildding.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tbl_bid_submissions")
public class BidSubmission extends AbstractEntity<Integer> {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private BiddingPackage biddingPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id", nullable = false)
    private Partner partner;

    @Column(name = "bid_price", precision = 19, scale = 2, nullable = false)
    private BigDecimal bidPrice;

    @Column(name = "proposal_file_url", length = 500)
    private String proposalFileUrl;

    @Builder.Default
    @Column(name = "status", length = 20, nullable = false)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
