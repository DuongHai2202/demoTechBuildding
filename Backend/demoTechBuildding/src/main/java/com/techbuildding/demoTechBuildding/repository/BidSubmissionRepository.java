package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.BidSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidSubmissionRepository extends JpaRepository<BidSubmission, Integer> {
    List<BidSubmission> findByBiddingPackageId(Integer packageId);
    List<BidSubmission> findByPartnerId(Integer partnerId);
}
