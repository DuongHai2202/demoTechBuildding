package com.techbuildding.demoTechBuildding.controller;

import com.techbuildding.demoTechBuildding.dto.response.ResponseData;
import com.techbuildding.demoTechBuildding.dto.response.project.MasterPlanResponseDTO;
import com.techbuildding.demoTechBuildding.service.MasterPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/master-plan")
@RequiredArgsConstructor
@Tag(name = "Master Plan Controller", description = "Endpoints for project scheduling and progress tracking")
public class MasterPlanController {

    private final MasterPlanService masterPlanService;

    @Operation(summary = "Get project master plan hierarchy")
    @GetMapping
    public ResponseData<List<MasterPlanResponseDTO>> getHierarchy(@PathVariable("projectId") Integer projectId) {
        List<MasterPlanResponseDTO> result = masterPlanService.getHierarchyByProject(projectId);
        return new ResponseData<>(HttpStatus.OK.value(), "Fetched master plan hierarchy", result);
    }

    @Operation(summary = "Add a new task/item to project master plan")
    @PostMapping
    public ResponseData<MasterPlanResponseDTO> create(@PathVariable("projectId") Integer projectId, @RequestBody MasterPlanResponseDTO dto) {
        MasterPlanResponseDTO result = masterPlanService.createPlan(projectId, dto);
        return new ResponseData<>(HttpStatus.CREATED.value(), "Plan item created", result);
    }

    @Operation(summary = "Update task progress and status")
    @PatchMapping("/{planId}")
    public ResponseData<MasterPlanResponseDTO> updateProgress(
            @PathVariable("planId") Long planId,
            @RequestParam("progress") Integer progress,
            @RequestParam("status") String status) {
        MasterPlanResponseDTO result = masterPlanService.updateProgress(planId, progress, status);
        return new ResponseData<>(HttpStatus.OK.value(), "Progress updated", result);
    }
}
