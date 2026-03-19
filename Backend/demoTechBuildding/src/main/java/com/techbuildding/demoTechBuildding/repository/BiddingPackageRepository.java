package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.BiddingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BiddingPackageRepository extends JpaRepository<BiddingPackage, Integer> {
    List<BiddingPackage> findByProjectId(Integer projectId);
    boolean existsByPackageCode(String packageCode);
}
