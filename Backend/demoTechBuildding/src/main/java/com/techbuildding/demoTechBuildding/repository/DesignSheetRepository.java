package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.DesignSheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesignSheetRepository extends JpaRepository<DesignSheet, Integer> {
    List<DesignSheet> findByProjectId(Integer projectId);
    List<DesignSheet> findByProjectIdAndZoneId(Integer projectId, Integer zoneId);
}
