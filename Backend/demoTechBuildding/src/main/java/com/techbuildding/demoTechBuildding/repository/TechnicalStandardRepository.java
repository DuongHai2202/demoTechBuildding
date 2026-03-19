package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.TechnicalStandard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechnicalStandardRepository extends JpaRepository<TechnicalStandard, Long> {
    List<TechnicalStandard> findByProjectId(Integer projectId);
    List<TechnicalStandard> findByProjectIsNull(); // Global standards
    List<TechnicalStandard> findByProjectIdOrProjectIsNull(Integer projectId);
}
