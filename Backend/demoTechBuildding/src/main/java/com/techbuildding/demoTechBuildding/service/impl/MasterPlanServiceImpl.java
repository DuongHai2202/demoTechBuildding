package com.techbuildding.demoTechBuildding.service.impl;

import com.techbuildding.demoTechBuildding.dto.response.project.MasterPlanResponseDTO;
import com.techbuildding.demoTechBuildding.entity.MasterPlan;
import com.techbuildding.demoTechBuildding.entity.Project;
import com.techbuildding.demoTechBuildding.repository.MasterPlanRepository;
import com.techbuildding.demoTechBuildding.repository.ProjectRepository;
import com.techbuildding.demoTechBuildding.service.MasterPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MasterPlanServiceImpl implements MasterPlanService {

    private final MasterPlanRepository masterPlanRepository;
    private final ProjectRepository projectRepository;

    @Override
    public List<MasterPlanResponseDTO> getHierarchyByProject(Integer projectId) {
        List<MasterPlan> roots = masterPlanRepository.findByProjectIdAndParentIsNullOrderByDisplayOrder(projectId);
        return roots.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MasterPlanResponseDTO createPlan(Integer projectId, MasterPlanResponseDTO dto) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        MasterPlan parent = null;
        if (dto.getParentId() != null) {
            parent = masterPlanRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent plan not found"));
        }

        MasterPlan plan = MasterPlan.builder()
                .project(project)
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .displayOrder(dto.getDisplayOrder())
                .parent(parent)
                .status("NOT_STARTED")
                .progress(0)
                .build();

        return mapToDTO(masterPlanRepository.save(plan));
    }

    @Override
    @Transactional
    public MasterPlanResponseDTO updateProgress(Long planId, Integer progress, String status) {
        MasterPlan plan = masterPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        plan.setProgress(progress);
        plan.setStatus(status);
        
        return mapToDTO(masterPlanRepository.save(plan));
    }

    private MasterPlanResponseDTO mapToDTO(MasterPlan plan) {
        return MasterPlanResponseDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .progress(plan.getProgress())
                .status(plan.getStatus())
                .displayOrder(plan.getDisplayOrder())
                .parentId(plan.getParent() != null ? plan.getParent().getId() : null)
                .children(plan.getChildren().stream()
                        .map(this::mapToDTO)
                        .sorted((a, b) -> (a.getDisplayOrder() != null && b.getDisplayOrder() != null) 
                                ? a.getDisplayOrder().compareTo(b.getDisplayOrder()) : 0)
                        .collect(Collectors.toList()))
                .build();
    }
}
