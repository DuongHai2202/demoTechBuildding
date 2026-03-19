package com.techbuildding.demoTechBuildding.repository;

import com.techbuildding.demoTechBuildding.entity.MasterPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MasterPlanRepository extends JpaRepository<MasterPlan, Long> {
    List<MasterPlan> findByProjectId(Integer projectId);
    List<MasterPlan> findByProjectIdAndParentIsNullOrderByDisplayOrder(Integer projectId);
}
