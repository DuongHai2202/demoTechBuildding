package com.techbuildding.demoTechBuildding.service;

import com.techbuildding.demoTechBuildding.dto.response.project.MasterPlanResponseDTO;

import java.util.List;

public interface MasterPlanService {
    List<MasterPlanResponseDTO> getHierarchyByProject(Integer projectId);
    MasterPlanResponseDTO createPlan(Integer projectId, MasterPlanResponseDTO dto);
    MasterPlanResponseDTO updateProgress(Long planId, Integer progress, String status);
}
