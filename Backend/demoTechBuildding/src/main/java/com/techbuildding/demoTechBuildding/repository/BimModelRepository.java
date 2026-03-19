package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.BimModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BimModelRepository extends JpaRepository<BimModel, Integer> {
    List<BimModel> findByProjectId(Integer projectId);
    List<BimModel> findByProjectIdAndZoneId(Integer projectId, Integer zoneId);
}
