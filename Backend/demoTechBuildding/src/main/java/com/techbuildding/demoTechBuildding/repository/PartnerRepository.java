package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.Partner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Integer> {
    Optional<Partner> findByPartnerCode(String partnerCode);
}
